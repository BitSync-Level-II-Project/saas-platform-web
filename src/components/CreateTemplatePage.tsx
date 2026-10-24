import { useState } from 'react'
import './CreateTemplatePage.css'

type TemplateDetails = {
  name: string
  industry: string
  process: string
  warehouse: string
  description: string
}

type CreateTemplatePageProps = {
  onBack: () => void
}

export function CreateTemplatePage({
  onBack,
}: CreateTemplatePageProps) {
  const [details, setDetails] = useState<TemplateDetails>({
    name: '',
    industry: '',
    process: '',
    warehouse: '',
    description: '',
  })

  function updateDetail(
    field: keyof TemplateDetails,
    value: string,
  ) {
    setDetails((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <section className="template-builder">
      <button
        className="template-builder__back"
        type="button"
        onClick={onBack}
      >
        ← Templates
      </button>

      <div className="template-builder__heading">
        <h1>Create Template</h1>
        <span className="template-builder__draft">Draft</span>
      </div>

      <p className="template-builder__subtitle">
        Build a reusable form for receiving, storage,
        picking or dispatch.
      </p>

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
                updateDetail('name', event.currentTarget.value)
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
                updateDetail('industry', event.currentTarget.value)
              }
            >
              <option value="">Select industry</option>
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
                updateDetail('process', event.currentTarget.value)
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
                updateDetail('warehouse', event.currentTarget.value)
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
                updateDetail(
                  'description',
                  event.currentTarget.value,
                )
              }
              placeholder="Describe what this form collects."
              rows={3}
            />
          </label>
        </div>
      </section>
    </section>
  )
}