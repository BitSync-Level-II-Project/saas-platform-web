import type { TemplateField } from "./templateTypes";

import "./FormCanvas.css";
type FormCanvasProps = {
  fields: TemplateField[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;

  onMoveField: (fieldId: string, direction: "up" | "down") => void;
};

function FieldPreview({ field }: { field: TemplateField }) {
  switch (field.type) {
    case "short-text":
      return <span className="form-canvas__preview">Enter text</span>;

    case "long-text":
      return (
        <span className="form-canvas__preview form-canvas__preview--long">
          Enter a detailed response
        </span>
      );

    case "number":
      return (
        <span className="form-canvas__number-preview">
          <span className="form-canvas__preview">Enter a number</span>

          <span className="form-canvas__preview-note">
            Minimum: {field.min ?? "Not set"}
            {" · "}
            Maximum: {field.max ?? "Not set"}
          </span>
        </span>
      );

    case "dropdown":
      return (
        <span>
          <span className="form-canvas__preview form-canvas__preview--between">
            <span>Select an option</span>
            <span>⌄</span>
          </span>

          <span className="form-canvas__preview-note">
            Options:{" "}
            {(field.options ?? [])
              .map((option) => option.trim())
              .filter((option) => option.length > 0)
              .join(", ") || "No options added"}
          </span>
        </span>
      );

    case "yes-no":
      return (
        <span className="form-canvas__choices">
          <span>Yes</span>
          <span>No</span>
        </span>
      );

    case "date-time":
      return <span className="form-canvas__preview">Select date and time</span>;

    case "photo":
      return (
        <span className="form-canvas__preview form-canvas__preview--capture">
          + Add photo
        </span>
      );

    case "barcode":
      return (
        <span className="form-canvas__preview form-canvas__preview--capture">
          Scan QR / barcode
        </span>
      );

    case "location":
      return (
        <span className="form-canvas__preview form-canvas__preview--capture">
          Capture location
        </span>
      );
  }
}

export function FormCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onMoveField,
}: FormCanvasProps) {
  return (
    <section className="form-canvas" aria-labelledby="form-fields-title">
      <div className="form-canvas__heading">
        <h2 id="form-fields-title">Form fields</h2>

        <span aria-live="polite">
          {fields.length} {fields.length === 1 ? "field" : "fields"}
        </span>
      </div>

      <p className="form-canvas__description">
        Select a field to configure its properties.
      </p>

      {fields.length === 0 ? (
        <div className="form-canvas__empty">
          <h3>Start building your form</h3>
          <p>Choose a field type from the toolbox.</p>
        </div>
      ) : (
        <ol className="form-canvas__list">
          {fields.map((field, index) => {
            const isSelected = field.id === selectedFieldId;

            return (
              <li key={field.id}>
                <button
                  type="button"
                  className={
                    isSelected
                      ? "form-canvas__card form-canvas__card--selected"
                      : "form-canvas__card"
                  }
                  aria-pressed={isSelected}
                  aria-label={`Select ${field.label}, field ${index + 1}`}
                  onClick={() => onSelectField(field.id)}
                >
                  <span className="form-canvas__card-heading">
                    <span className="form-canvas__number">{index + 1}</span>

                    <span className="form-canvas__label">{field.label}</span>

                    <span className="form-canvas__requirement">
                      {field.required ? "Required" : "Optional"}
                    </span>
                  </span>

                  <span aria-hidden="true">
                    <FieldPreview field={field} />{" "}
                  </span>
                </button>

                <div className="form-canvas__actions">
                  <button
                    type="button"
                    disabled={index === 0}
                    aria-label={`Move ${field.label || "field"} up`}
                    onClick={() => onMoveField(field.id, "up")}
                  >
                    ↑ Move up
                  </button>

                  <button
                    type="button"
                    disabled={index === fields.length - 1}
                    aria-label={`Move ${field.label || "field"} down`}
                    onClick={() => onMoveField(field.id, "down")}
                  >
                    ↓ Move down
                  </button>

                  <button
                    type="button"
                    className="form-canvas__delete"
                    aria-label={`Delete ${field.label || "field"}`}
                    onClick={() => onDeleteField(field.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
