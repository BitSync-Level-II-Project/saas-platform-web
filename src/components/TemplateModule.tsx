import { useEffect, useRef, useState } from "react";
import {
  ApiError,
  createTemplateDraft,
  getPublishedTemplate,
  getTemplate,
  listTemplates,
  publishTemplate,
  updateTemplateDraft,
} from "../services/templatesApi";
import type {
  ApiPublishedTemplate,
  ApiTemplateDetail,
  TemplateListResponse,
} from "../services/templatesApi";
import type {
  SavedTemplateDraft,
  TemplateDetails,
  TemplateField,
} from "./templateTypes";
import { CreateTemplatePage } from "./CreateTemplatePage";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { TemplateTable } from "./TemplateTable";

type Props = {
  onEditingChange: (editing: boolean) => void;
};

type LoadResult = {
  key: string;
  data: TemplateListResponse | null;
  error: string | null;
};

function messageOf(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

function toEditorDraft(template: ApiTemplateDetail): SavedTemplateDraft {
  return {
    id: template.id,
    schemaVersion: 1,
    status: template.status,
    details: template.details,
    fields: template.fields,
    savedAt: template.updatedAt,
  };
}

export function TemplatesModule({ onEditingChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [initialDraft, setInitialDraft] = useState<SavedTemplateDraft | null>(
    null,
  );

  // Retains the server ID and revision between save attempts.
  const session = useRef<ApiTemplateDetail | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);

  const [result, setResult] = useState<LoadResult>({
    key: "",
    data: null,
    error: null,
  });

  const [opening, setOpening] = useState(false);
  const openingRequest = useRef<AbortController | null>(null);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<ApiPublishedTemplate | null>(null);

  const requestKey = JSON.stringify({
    search,
    status,
    page,
    refresh,
  });

  const loading = result.key !== requestKey;
  const error = loading ? null : result.error;
  const data = loading ? null : result.data;

  useEffect(() => () => openingRequest.current?.abort(), []);

  useEffect(() => {
    const controller = new AbortController();

    listTemplates({ search, status, page, limit: 10 }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return;

        setResult({
          key: requestKey,
          data: response,
          error: null,
        });
      })
      .catch((failure: unknown) => {
        if (controller.signal.aborted) return;

        setResult({
          key: requestKey,
          data: null,
          error: messageOf(failure),
        });
      });

    return () => controller.abort();
  }, [search, status, page, refresh, requestKey]);

  function startEditing(template: ApiTemplateDetail | null) {
    session.current = template;
    setInitialDraft(template ? toEditorDraft(template) : null);
    setActionError("");
    setNotice("");
    setEditing(true);
    onEditingChange(true);
  }

  function leaveEditor() {
    setEditing(false);
    onEditingChange(false);
    setPage(1);
    setRefresh((value) => value + 1);
  }

  async function openTemplate(id: string, published: boolean) {
    if (openingRequest.current) return;

    const controller = new AbortController();
    openingRequest.current = controller;
    setOpening(true);
    setActionError("");

    try {
      if (published) {
        const snapshot = await getPublishedTemplate(id, controller.signal);
        if (!controller.signal.aborted) setPreview(snapshot);
      } else {
        const template = await getTemplate(id, controller.signal);
        if (controller.signal.aborted) return;

        // A draft might have been published by another session.
        if (template.status === "published") {
          const snapshot = await getPublishedTemplate(id, controller.signal);
          if (!controller.signal.aborted) setPreview(snapshot);
        } else {
          startEditing(template);
        }
      }
    } catch (failure) {
      if (!controller.signal.aborted) setActionError(messageOf(failure));
    } finally {
      openingRequest.current = null;
      if (!controller.signal.aborted) setOpening(false);
    }
  }

  async function persist(
    details: TemplateDetails,
    fields: TemplateField[],
    mode: "draft" | "publish",
  ): Promise<void> {
    try {
      if (!session.current) {
        session.current = await createTemplateDraft(details);
      }

      const current = session.current;

      const updated = await updateTemplateDraft(current.id, {
        expectedRevision: current.draftRevision,
        details,
        fields,
      });

      // Keep the new revision even if publishing subsequently fails.
      session.current = updated;

      if (mode === "publish") {
        await publishTemplate(updated.id, updated.draftRevision);
      }

      setNotice(
        mode === "publish"
          ? "Template published successfully."
          : "Draft saved successfully.",
      );
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 409) {
        throw new Error(
          "This template changed or was published elsewhere. " +
            "Your current inputs are still here. Return to the list " +
            "and reopen the template before continuing.",
          { cause: failure },
        );
      }

      throw failure;
    }
  }

  if (editing) {
    return (
      <CreateTemplatePage
        key={initialDraft?.id ?? "new-template"}
        initialDraft={initialDraft}
        onBack={leaveEditor}
        onSaved={leaveEditor}
        onPersist={persist}
      />
    );
  }

  return (
    <section className="templates-page" aria-labelledby="templates-title">
      <h1 id="templates-title">Templates</h1>
      <p>Reusable forms for your warehouses.</p>

      <form
        className="template-toolbar tm-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <input
          className="search-input"
          type="search"
          aria-label="Search templates"
          placeholder="Search templates"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <button className="tm-button" type="submit">
          Search
        </button>

        <select
          className="status-select"
          aria-label="Filter by status"
          value={status}
          onChange={(event) => {
            const value = event.target.value;

            if (value === "all" || value === "draft" || value === "published") {
              setPage(1);
              setStatus(value);
            }
          }}
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button
          className="create-button"
          type="button"
          onClick={() => startEditing(null)}
          disabled={opening}
        >
          Create template
        </button>
      </form>

      {notice && (
        <p className="tm-notice" role="status">
          {notice}
        </p>
      )}

      {actionError && (
        <p className="tm-error" role="alert">
          {actionError}
        </p>
      )}

      {opening && <p role="status">Opening template…</p>}

      {loading ? (
        <div className="tm-panel" role="status">
          Loading templates…
        </div>
      ) : error ? (
        <div className="tm-panel">
          <p className="tm-error" role="alert">
            {error}
          </p>
          <button
            className="tm-button"
            type="button"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      ) : !data?.items.length ? (
        <div className="tm-panel">
          <h2>No templates found</h2>
          <p>Create a template or adjust your search and status filter.</p>
        </div>
      ) : (
        <TemplateTable
          busy={opening}
          templates={data.items.map((template) => ({
            id: template.id,
            name: template.details.name,
            updated: new Date(template.updatedAt).toLocaleString(),
            warehouse: template.details.warehouse || "Not selected",
            fields: template.fieldCount,
            status: template.status,
            canContinue: template.status === "draft",
            canView: template.status === "published",
          }))}
          onContinue={(id) => void openTemplate(id, false)}
          onView={(id) => void openTemplate(id, true)}
        />
      )}

      <nav className="tm-pagination" aria-label="Template pages">
        <button
          className="tm-button"
          type="button"
          disabled={page === 1 || loading || opening}
          onClick={() => setPage((value) => value - 1)}
        >
          Previous
        </button>

        <span>Page {page}</span>

        <button
          className="tm-button"
          type="button"
          disabled={loading || opening || !data?.hasMore}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </nav>

      {preview && (
        <TemplatePreviewModal
          key={preview.versionId}
          title={preview.details.name}
          description={preview.details.description}
          fields={preview.fields}
          readOnly
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  );
}
