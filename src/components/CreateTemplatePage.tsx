import { useEffect, useState, useRef } from "react";
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
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { ConfirmPublishDialog } from "./ConfirmPublishDialog";

type CreateTemplatePageProps = {
  onBack: () => void;
  initialDraft: SavedTemplateDraft | null;
  onSaved: () => void;
  onPersist: (
    details: TemplateDetails,
    fields: TemplateField[],
    mode: "draft" | "publish",
  ) => Promise<void>;
};

export function CreateTemplatePage({
  onBack,
  initialDraft,
  onSaved,
  onPersist,
}: CreateTemplatePageProps) {
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

  const [initialSnapshot] = useState(() => JSON.stringify({ details, fields }));
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const isDirty = JSON.stringify({ details, fields }) !== initialSnapshot;

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = true;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  function handleBack() {
    if (isDirty) {
      setIsLeaveDialogOpen(true);
      return;
    }

    onBack();
  }

  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const saveLock = useRef(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
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

  async function persist(mode: "draft" | "publish"): Promise<boolean> {
    if (saveLock.current) return false;
    setSaveError("");

    if (details.name.trim() === "") {
      setSaveError("Enter a template name before saving your draft.");
      return false;
    }

    if (mode === "publish" && validateTemplate(details, fields).length > 0) {
      setHasCheckedTemplate(true);
      return false;
    }

    saveLock.current = true;
    setIsSaving(true);

    try {
      await onPersist({ ...details, name: details.name.trim() }, fields, mode);
      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Your template could not be saved. Please try again.",
      );
      return false;
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  }

  async function handleSaveDraft() {
    const success = await persist("draft");
    if (success) {
      onSaved();
    }
  }

  function handlePublish() {
    if (saveLock.current) return;
    setHasCheckedTemplate(true);
    setSaveError("");

    const errors = validateTemplate(details, fields);

    if (errors.length > 0) {
      return;
    }

    setIsPublishConfirmOpen(true);
  }

  const validationErrors = validateTemplate(details, fields);

  return (
    <section className="template-builder" aria-busy={isSaving}>
      {isSaving && (
        <p className="tm-notice" role="status">
          Saving your template…
        </p>
      )}
      <fieldset className="tm-editor-lock" disabled={isSaving}>
        <button
          className="template-builder__back"
          type="button"
          onClick={handleBack}
        >
          ← Templates
        </button>

        <div className="template-builder__heading">
          <h1>Create template</h1>

          <span className="template-builder__draft">Draft</span>
          {isDirty && (
            <span className="template-builder__unsaved" role="status">
              Unsaved changes
            </span>
          )}

          <div className="template-builder__actions">
            <button
              type="button"
              className="template-builder__save-button"
              onClick={() => void handleSaveDraft()}
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
              className="template-builder__publish-button"
              onClick={handlePublish}
            >
              Publish
            </button>
          </div>
        </div>

        <p className="template-builder__description">
          Build a reusable form for receiving, storage, picking or dispatch.
        </p>

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

        {hasCheckedTemplate && validationErrors.length > 0 && (
          <section
            className="template-builder__validation template-builder__validation--error"
            aria-labelledby="template-validation-title"
            aria-live="polite"
            aria-atomic="true"
          >
            <h2 id="template-validation-title">
              Fix these items before publishing
            </h2>

            <ul>
              {validationErrors.map((message, index) => (
                <li key={`${index}-${message}`}>{message}</li>
              ))}
            </ul>
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

          <FieldSettingsPanel
            field={selectedField}
            onUpdateField={updateField}
          />
        </div>

        {isLeaveDialogOpen && (
          <UnsavedChangesDialog
            onStay={() => setIsLeaveDialogOpen(false)}
            onDiscard={onBack}
            onSave={async () => {
              const success = await persist("draft");
              setIsLeaveDialogOpen(false);
              if (success) {
                onSaved();
              }
            }}
          />
        )}

        {isPreviewOpen && (
          <TemplatePreviewModal
            title={details.name}
            description={details.description}
            fields={fields}
            onClose={() => setIsPreviewOpen(false)}
          />
        )}

        {isPublishConfirmOpen && (
          <ConfirmPublishDialog
            name={details.name}
            onCancel={() => setIsPublishConfirmOpen(false)}
            onConfirm={() => {
              setIsPublishConfirmOpen(false);
              void persist("publish");
            }}
          />
        )}
      </fieldset>
    </section>
  );
}
