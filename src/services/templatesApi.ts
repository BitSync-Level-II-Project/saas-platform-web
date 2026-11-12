import type {
  TemplateDetails,
  TemplateField,
} from "../components/templateTypes";

export type ApiTemplateSummary = {
  id: string;
  fieldCount: number;
  status: "draft" | "published";
  draftRevision: number;
  version: number | null;
  publishedAt: string | null;
  details: TemplateDetails;
  createdAt: string;
  updatedAt: string;
};

export type ApiTemplateDetail = ApiTemplateSummary & {
  fields: TemplateField[];
};

export type TemplateListResponse = {
  items: ApiTemplateSummary[];
  page: number;
  limit: number;
  hasMore: boolean;
};

export type UpdateDraftInput = {
  expectedRevision: number;
  details: TemplateDetails;
  fields: TemplateField[];
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getErrorMessage(payload: unknown, status: number): string {
  if (payload !== null && typeof payload === "object" && "message" in payload) {
    if (typeof payload.message === "string") {
      return payload.message;
    }

    if (Array.isArray(payload.message)) {
      const messages = payload.message.filter(
        (message): message is string => typeof message === "string",
      );

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  return `Request failed (HTTP ${status}).`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    throw new ApiError("VITE_API_URL is not configured.", 0);
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch (error) {
    if (options.signal?.aborted) {
      throw error;
    }

    throw new ApiError(
      "Cannot connect to the API. Check that the backend is running.",
      0,
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, response.status),
      response.status,
    );
  }

  if (payload === null) {
    throw new ApiError(
      "The API returned an invalid JSON response.",
      response.status,
    );
  }

  return payload as T;
}

export function listTemplates(
  query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "all" | "draft" | "published";
  } = {},
  signal?: AbortSignal,
): Promise<TemplateListResponse> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 20),
  });

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  params.set("status", query.status ?? "all");

  return request<TemplateListResponse>(`/templates?${params.toString()}`, {
    signal,
  });
}

export function getTemplate(
  id: string,
  signal?: AbortSignal,
): Promise<ApiTemplateDetail> {
  return request<ApiTemplateDetail>(`/templates/${encodeURIComponent(id)}`, {
    signal,
  });
}

export function createTemplateDraft(
  details: TemplateDetails,
): Promise<ApiTemplateDetail> {
  return request<ApiTemplateDetail>("/templates", {
    method: "POST",
    body: JSON.stringify(details),
  });
}

export function updateTemplateDraft(
  id: string,
  input: UpdateDraftInput,
): Promise<ApiTemplateDetail> {
  return request<ApiTemplateDetail>(`/templates/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export type ApiPublishedTemplate = {
  id: string;
  versionId: string;
  status: "published";
  version: number;
  sourceDraftRevision: number;
  publishedAt: string;
  details: TemplateDetails;
  fields: TemplateField[];
};

export function publishTemplate(
  id: string,
  expectedRevision: number,
): Promise<ApiPublishedTemplate> {
  return request<ApiPublishedTemplate>(
    `/templates/${encodeURIComponent(id)}/publish`,
    {
      method: "POST",
      body: JSON.stringify({ expectedRevision }),
    },
  );
}

export function getPublishedTemplate(
  id: string,
  signal?: AbortSignal,
): Promise<ApiPublishedTemplate> {
  return request<ApiPublishedTemplate>(
    `/templates/${encodeURIComponent(id)}/published`,
    { signal },
  );
}