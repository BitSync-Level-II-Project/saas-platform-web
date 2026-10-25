import { useState } from "react";
import "./CreateTemplatePage.css";
import { FieldToolbox } from "./FieldToolbox";
import type {
  FieldType,
  TemplateField,
  FieldSettingsUpdate,
  TemplateDetails,
} from "./templateTypes";
import { FormCanvas } from "./FormCanvas";
import { FieldSettingsPanel } from "./FieldSettingsPanel";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { loadTemplateDraft, saveTemplateDraft } from "./templateDraftStorage";

type CreateTemplatePageProps = {
  onBack: () => void;
};

export function CreateTemplatePage({ onBack }: CreateTemplatePageProps) {
  const [initialDraft] = useState(loadTemplateDraft);

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
        schemaVersion: 1,
        details: {
          ...details,
          name: details.name.trim(),
        },
        fields,
        savedAt: new Date().toISOString(),
      });

      setSaveMessage(
        "Draft saved in this browser. Save again after making changes.",
      );
    } catch {
      setSaveError("Your draft could not be saved. Please try again.");
    }
  }
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
