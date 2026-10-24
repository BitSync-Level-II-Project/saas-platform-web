export type Template = {
  id: string
  name: string
  updated: string
  warehouse: string
  fields: number
  status: 'published' | 'draft'
}

type TemplateTableProps = {
  templates: Template[]
}

export function TemplateTable({ templates }: TemplateTableProps) {
  return (
    <div className="table-card">
      <div className="table-scroll">
        <table className="template-table">
          <thead>
            <tr>
              <th>Template</th>
              <th>Warehouse</th>
              <th>Fields</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>

          <tbody>
            {templates.map((template) => (
              <tr key={template.id}>
                <td>
                  <strong>{template.name}</strong>
                  <small>Updated {template.updated}</small>
                </td>
                <td>{template.warehouse}</td>
                <td>{template.fields}</td>
                <td>
                  <span className={`status status--${template.status}`}>
                    {template.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>
                  <button className="text-action" type="button">
                    {template.status === 'published' ? 'Edit' : 'Continue'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">{templates.length} records</div>
    </div>
  )
}