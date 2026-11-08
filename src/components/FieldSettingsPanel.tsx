import type { FieldSettingsUpdate, TemplateField } from "./templateTypes";

import "./FieldSettingsPanel.css";

type FieldSettingsPanelProps = {
  field: TemplateField | undefined;

  onUpdateField: (fieldId: string, updates: FieldSettingsUpdate) => void;
};

export function FieldSettingsPanel({
  field,
  onUpdateField,
}: FieldSettingsPanelProps) {
  if (!field) {
    return (
      <aside className="field-settings" aria-labelledby="field-settings-title">
        <h2 id="field-settings-title">Field settings</h2>

        <p className="field-settings__empty">
          Select a field from the canvas to edit its settings.
        </p>
      </aside>
    );
  }

  return (
    <aside className="field-settings" aria-labelledby="field-settings-title">
      <h2 id="field-settings-title">Field settings</h2>

      <p className="field-settings__description">
        Configure the selected field.
      </p>

      <div className="field-settings__control">
        <label htmlFor="selected-field-label">Field label</label>

        <input
          id="selected-field-label"
          type="text"
          value={field.label}
          placeholder="e.g. Received Quantity"
          aria-describedby="field-label-help"
          onChange={(event) =>
            onUpdateField(field.id, {
              label: event.currentTarget.value,
            })
          }
        />

        <p id="field-label-help">This name appears on the collection form.</p>
      </div>

      <label className="field-settings__required">
        <span>
          <span className="field-settings__required-title">Required field</span>

          <span className="field-settings__required-help">
            A response is required for this field.
          </span>
        </span>

        <input
          type="checkbox"
          checked={field.required}
          onChange={(event) =>
            onUpdateField(field.id, {
              required: event.currentTarget.checked,
            })
          }
        />
      </label>
      {field.type === "dropdown" && (
        <div className="field-settings__control">
          <label htmlFor="dropdown-options">Dropdown options</label>

          <textarea
            id="dropdown-options"
            rows={5}
            value={(field.options ?? []).join("\n")}
            placeholder={"Good\nDamaged\nNeeds review"}
            aria-describedby="dropdown-options-help"
            onChange={(event) =>
              onUpdateField(field.id, {
                options: event.currentTarget.value.split("\n"),
              })
            }
          />

          <p id="dropdown-options-help">Enter one option per line.</p>
        </div>
      )}

      {field.type === "number" && (
        <div className="field-settings__number-settings">
          <div className="field-settings__control">
            <label htmlFor="number-minimum">Minimum value</label>

            <input
              id="number-minimum"
              type="number"
              step="any"
              value={field.min ?? ""}
              placeholder="No minimum"
              onChange={(event) => {
                const value = event.currentTarget.valueAsNumber;

                onUpdateField(field.id, {
                  min: Number.isFinite(value) ? value : null,
                });
              }}
            />
          </div>

          <div className="field-settings__control">
            <label htmlFor="number-maximum">Maximum value</label>

            <input
              id="number-maximum"
              type="number"
              step="any"
              value={field.max ?? ""}
              placeholder="No maximum"
              onChange={(event) => {
                const value = event.currentTarget.valueAsNumber;

                onUpdateField(field.id, {
                  max: Number.isFinite(value) ? value : null,
                });
              }}
            />
          </div>

          {field.min != null && field.max != null && field.min > field.max && (
            <p className="field-settings__error" role="alert">
              Maximum must be greater than or equal to minimum.
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
