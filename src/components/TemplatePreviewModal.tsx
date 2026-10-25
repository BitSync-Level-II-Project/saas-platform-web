import { useEffect, useRef, useState } from "react";
import type { TemplateField } from "./templateTypes";

import "./TemplatePreviewModal.css";

type TemplatePreviewModalProps = {
  title: string;
  description: string;
  fields: TemplateField[];
  onClose: () => void;
};

function PreviewControl({ field }: { field: TemplateField }) {
  const commonProps = {
    id: `preview-${field.id}`,
    name: field.id,
    required: field.required,
  };

  switch (field.type) {
    case "short-text":
      return <input {...commonProps} type="text" placeholder="Enter text" />;

    case "long-text":
      return (
        <textarea
          {...commonProps}
          rows={4}
          placeholder="Enter a detailed response"
        />
      );

    case "number":
      return (
        <input
          {...commonProps}
          type="number"
          step="any"
          min={field.min ?? undefined}
          max={field.max ?? undefined}
          placeholder="Enter a number"
        />
      );

    case "dropdown": {
      const options = [
        ...new Set(
          (field.options ?? [])
            .map((option) => option.trim())
            .filter((option) => option.length > 0),
        ),
      ];

      return (
        <select {...commonProps} defaultValue="">
          <option value="">Select an option</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    case "yes-no":
      return (
        <select {...commonProps} defaultValue="">
          <option value="">Select an answer</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      );

    case "date-time":
      return <input {...commonProps} type="datetime-local" />;

    case "photo":
      return <input {...commonProps} type="file" accept="image/*" />;

    case "barcode":
      return (
        <>
          <input
            {...commonProps}
            type="text"
            placeholder="Enter a sample barcode"
            aria-describedby={`help-${field.id}`}
          />

          <small id={`help-${field.id}`}>
            Enter a sample value to test this field. Camera scanning is
            unavailable in this preview.
          </small>
        </>
      );

    case "location":
      return (
        <>
          <input
            {...commonProps}
            type="text"
            placeholder="Enter a sample location"
            aria-describedby={`help-${field.id}`}
          />

          <small id={`help-${field.id}`}>
            Enter a sample location to test this field. GPS capture is
            unavailable in this preview.
          </small>
        </>
      );
  }
}

export function TemplatePreviewModal({
  title,
  description,
  fields,
  onClose,
}: TemplatePreviewModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isTestPassed, setIsTestPassed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    dialog.showModal();

    return () => {
      dialog.close();
    };
  }, []);

  const hasInvalidConfiguration = fields.some(
    (field) =>
      field.label.trim() === "" ||
      (field.type === "number" &&
        field.min != null &&
        field.max != null &&
        field.min > field.max) ||
      (field.type === "dropdown" &&
        !(field.options ?? []).some((option) => option.trim().length > 0)),
  );

  return (
    <dialog
      ref={dialogRef}
      className="template-preview"
      aria-labelledby="template-preview-title"
      aria-describedby="template-preview-notice"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="template-preview__header">
        <div>
          <span className="template-preview__badge">Preview</span>

          <h2 id="template-preview-title">
            {title.trim() || "Untitled template"}
          </h2>
        </div>

        <button
          type="button"
          className="template-preview__close"
          aria-label="Close template preview"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <p id="template-preview-notice" className="template-preview__notice">
        Test your form. Responses entered here are not saved.
      </p>

      {description.trim() && (
        <p className="template-preview__description">{description}</p>
      )}

      {hasInvalidConfiguration && (
        <p className="template-preview__error" role="alert">
          Some fields need attention. Check field labels, dropdown options and
          number limits in the builder.
        </p>
      )}

      <form
        onInput={() => setIsTestPassed(false)}
        onSubmit={(event) => {
          event.preventDefault();

          if (fields.length === 0 || hasInvalidConfiguration) {
            return;
          }

          setIsTestPassed(true);
        }}
      >
        <div className="template-preview__fields">
          {fields.length === 0 ? (
            <p className="template-preview__empty">
              No fields yet. Add fields in the builder.
            </p>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="template-preview__field">
                <label htmlFor={`preview-${field.id}`}>
                  {index + 1}. {field.label.trim() || "Untitled field"}
                  <span>{field.required ? " (Required)" : " (Optional)"}</span>
                </label>

                <PreviewControl field={field} />
              </div>
            ))
          )}
        </div>

        {isTestPassed && (
          <p className="template-preview__success" role="status">
            Preview check passed. No responses were saved.
          </p>
        )}

        <div className="template-preview__footer">
          <button
            type="button"
            className="template-preview__secondary"
            onClick={onClose}
          >
            Back to builder
          </button>

          <button
            type="submit"
            className="template-preview__primary"
            disabled={fields.length === 0 || hasInvalidConfiguration}
          >
            Test form
          </button>
        </div>
      </form>
    </dialog>
  );
}
