import type {
  FieldSettingsUpdate,
  TemplateField,
} from './templateTypes'

import './FieldSettingsPanel.css'

type FieldSettingsPanelProps = {
  field: TemplateField | undefined

  onUpdateField: (
    fieldId: string,
    updates: FieldSettingsUpdate
  ) => void
}

export function FieldSettingsPanel({
  field,
  onUpdateField,
}: FieldSettingsPanelProps) {
  if (!field) {
    return (
      <aside
        className="field-settings"
        aria-labelledby="field-settings-title"
      >
        <h2 id="field-settings-title">
          Field settings
        </h2>

        <p className="field-settings__empty">
          Select a field from the canvas to edit its settings.
        </p>
      </aside>
    )
  }

  return (
    <aside
      className="field-settings"
      aria-labelledby="field-settings-title"
    >
      <h2 id="field-settings-title">
        Field settings
      </h2>

      <p className="field-settings__description">
        Configure the selected field.
      </p>

      <div className="field-settings__control">
        <label htmlFor="selected-field-label">
          Field label
        </label>

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

        <p id="field-label-help">
          This name appears on the collection form.
        </p>
      </div>

      <label className="field-settings__required">
        <span>
          <span className="field-settings__required-title">
            Required field
          </span>

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
    </aside>
  )
}