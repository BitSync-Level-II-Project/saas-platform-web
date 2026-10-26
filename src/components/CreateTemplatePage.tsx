import { useState } from "react";
import "./CreateTemplatePage.css";
import { FieldToolbox } from "./FieldToolbox";
import { validateTemplate } from "./validateTemplate";

import type {
  FieldType,
  TemplateField,
  FieldSettingsUpdate,
  TemplateDetails,
  SavedTemplateDraft,
} from "./templateTypes";
import { FormCanvas } from "./FormCanvas";
import { FieldSettingsPanel } from "./FieldSettingsPanel";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { saveTemplateDraft } from "./templateDraftStorage";

type CreateTemplatePageProps = {
  onBack: () => void;
  initialDraft: SavedTemplateDraft | null;
  onSaved: () => void;
};
export function CreateTemplatePage({
  onBack,
  initialDraft,
  onSaved,
}: CreateTemplatePageProps) {
  const [draftId] = useState(() => initialDraft?.id ?? crypto.randomUUID());

  const [details, setDetails] = useState<TemplateDetails>(
    () =>
      initialDraft?.details ?? {
        name: "",
        industry: "",
        process: "",
        warehouse: "",
        description: "",
      },
  );

  function updateDetail(field: keyof TemplateDetails, value: string) {
    setDetails((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const [fields, setFields] = useState<TemplateField[]>(
    () => initialDraft?.fields ?? [],
  );

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [hasCheckedTemplate, setHasCheckedTemplate] = useState(false);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  function addField(type: FieldType, label: string) {
    const newField: TemplateField = {
      id: crypto.randomUUID(),
      type,
      label,
      required: false,
    };

    setFields((currentFields) => [...currentFields, newField]);

    setSelectedFieldId(newField.id);
  }

  function updateField(fieldId: string, updates: FieldSettingsUpdate) {
    setFields((currentFields) =>
      currentFields.map((field) => {
        if (field.id === fieldId) {
          return {
            ...field,
            ...updates,
          };
        }

        return field;
      }),
    );
  }

  function deleteField(fieldId: string) {
    setFields((currentFields) =>
      currentFields.filter((field) => field.id !== fieldId),
    );

    setSelectedFieldId((currentId) =>
      currentId === fieldId ? null : currentId,
    );
  }

  function moveField(fieldId: string, direction: "up" | "down") {
    setFields((currentFields) => {
      const currentIndex = currentFields.findIndex(
        (field) => field.id === fieldId,
      );

      if (currentIndex === -1) {
        return currentFields;
      }

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= currentFields.length) {
        return currentFields;
      }

      const reorderedFields = [...currentFields];

      const [movedField] = reorderedFields.splice(currentIndex, 1);

      if (!movedField) {
        return currentFields;
      }

      reorderedFields.splice(targetIndex, 0, movedField);

      return reorderedFields;
    });
  }

  const selectedField = fields.find((field) => field.id === selectedFieldId);

  function handleSaveDraft() {
    setSaveMessage("");
    setSaveError("");

    if (details.name.trim() === "") {
      setSaveError("Enter a template name before saving your draft.");
      return;
    }

    try {
      saveTemplateDraft({
        id: draftId,
        schemaVersion: 1,
        details: {
          ...details,
          name: details.name.trim(),
        },
        fields,
        savedAt: new Date().toISOString(),
      });

      onSaved();
    } catch {
      setSaveError("Your draft could not be saved. Please try again.");
    }
  }
  const validationErrors = validateTemplate(details, fields);
  return (
    <section className="template-builder">
      <button className="template-builder__back" type="button" onClick={onBack}>
        ← Templates
      </button>

      <div className="template-builder__heading">
        <h1>Create template</h1>

        <span className="template-builder__draft">Draft</span>

        <div className="template-builder__actions">
          <button
            type="button"
            className="template-builder__save-button"
            onClick={handleSaveDraft}
          >
            Save draft
          </button>

          <button
            type="button"
            className="template-builder__preview-button"
            onClick={() => setIsPreviewOpen(true)}
          >
            Preview
          </button>
          <button
            type="button"
            className="template-builder__validate-button"
            onClick={() => setHasCheckedTemplate(true)}
          >
            Check template
          </button>
        </div>
      </div>

      <p className="template-builder__subtitle">
        Build a reusable form for receiving, storage, picking or dispatch.
      </p>

      {saveMessage && (
        <p className="template-builder__save-success" role="status">
          {saveMessage}
        </p>
      )}

      {saveError && (
        <p className="template-builder__save-error" role="alert">
          {saveError}
        </p>
      )}

      <section
        className="template-builder__details"
        aria-labelledby="template-details-title"
      >
        <h2 id="template-details-title">Template details</h2>

        <div className="template-builder__grid">
          <label>
            Template name *
            <input
              value={details.name}
              onChange={(event) =>
                updateDetail("name", event.currentTarget.value)
              }
              placeholder="e.g. Goods Receiving Inspection"
              required
            />
          </label>

          <label>
            Industry
            <select
              value={details.industry}
              onChange={(event) =>
                updateDetail("industry", event.currentTarget.value)
              }
            >
              <option value="">Select Industry</option>
              <option value="warehouse">Warehouse</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="logistics">Logistics</option>
            </select>
          </label>

          <label>
            Process
            <select
              value={details.process}
              onChange={(event) =>
                updateDetail("process", event.currentTarget.value)
              }
            >
              <option value="">Select process</option>
              <option value="receiving">Goods Receiving</option>
              <option value="storage">Storage</option>
              <option value="picking">Picking</option>
              <option value="dispatch">Dispatch</option>
            </select>
          </label>

          <label>
            Applicable warehouses
            <select
              value={details.warehouse}
              onChange={(event) =>
                updateDetail("warehouse", event.currentTarget.value)
              }
            >
              <option value="">Select warehouse</option>
              <option value="all">All warehouses</option>
              <option value="colombo">Colombo warehouse</option>
              <option value="galle">Galle warehouse</option>
            </select>
          </label>

          <label className="template-builder__full-width">
            Description
            <textarea
              value={details.description}
              onChange={(event) =>
                updateDetail("description", event.currentTarget.value)
              }
              placeholder="Describe what this form collects."
              rows={3}
            />
          </label>
        </div>
      </section>
      {hasCheckedTemplate && (
        <section
          className={
            validationErrors.length > 0
              ? "template-builder__validation template-builder__validation--error"
              : "template-builder__validation template-builder__validation--success"
          }
          aria-labelledby="template-validation-title"
          aria-live="polite"
          aria-atomic="true"
        >
          <h2 id="template-validation-title">
            {validationErrors.length > 0
              ? "Fix these items before publishing"
              : "Template is ready for publishing"}
          </h2>

          {validationErrors.length > 0 ? (
            <ul>
              {validationErrors.map((message, index) => (
                <li key={`${index}-${message}`}>{message}</li>
              ))}
            </ul>
          ) : (
            <p>All template checks passed. Your template is still a draft.</p>
          )}
        </section>
      )}
      <div className="template-builder__workspace">
        <FieldToolbox onAddField={addField} />

        <FormCanvas
          fields={fields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onDeleteField={deleteField}
          onMoveField={moveField}
        />

        <FieldSettingsPanel field={selectedField} onUpdateField={updateField} />
      </div>

      {isPreviewOpen && (
        <TemplatePreviewModal
          title={details.name}
          description={details.description}
          fields={fields}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </section>
  );
}
