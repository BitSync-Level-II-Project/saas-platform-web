# SiteTrace Web

SiteTrace is a field operations platform for managing warehouses, assigning work, collecting structured data, and reviewing results. This repository contains the browser workspace built with React, TypeScript, and Vite. The web app calls the shared SiteTrace API; it does not connect directly to PostgreSQL.

| Repository | Role | Integration branch |
| --- | --- | --- |
| [SiteTrace Web](https://github.com/BitSync-Level-II-Project/saas-platform-web) | Browser workspace for managers and supervisors | `chore/web-foundation` |
| [SiteTrace API](https://github.com/BitSync-Level-II-Project/saas-platform-api) | Shared NestJS API and PostgreSQL database | `chore/api-foundation` |
| [SiteTrace Mobile](https://github.com/BitSync-Level-II-Project/saas-platform-mobile) | Worker task and form capture app | `main` |

## What works today

| Area | Current behavior on `chore/web-foundation` |
| --- | --- |
| Templates | Search and filter templates, create and reopen drafts, edit fields, publish, and view read-only published snapshots. These operations persist through the development API. |
| Warehouses and locations | List and manage warehouses and their locations through the development API. Task creation can read warehouse and location options from the API. |
| Collected Data | Search, filter, export CSV, view details, and preview approval or rejection with sample records. Review decisions change browser state only. |
| Tasks, supervisors, and monitoring | The screens are available for demonstration. Task and supervisor changes and monitoring totals should not be treated as persisted operational data. |

The intended workflow is that a manager publishes a form, a supervisor assigns a task tied to a specific published version, and a worker completes that form on mobile. Only supervisors can approve or reject submitted work. Authenticated task assignment, persisted Collected Data history and reviews, and production role enforcement are still integration work.

## Run locally

**Prerequisites:** Git, Node.js 24 (use the version in [`.nvmrc`](./.nvmrc)), npm, and the [SiteTrace API](https://github.com/BitSync-Level-II-Project/saas-platform-api/tree/chore/api-foundation) running with local PostgreSQL. Use the API's `chore/api-foundation` branch for warehouse, location, and template development.

```bash
git clone --branch chore/web-foundation https://github.com/BitSync-Level-II-Project/saas-platform-web.git
cd saas-platform-web
npm ci
```

Start the API first in a separate terminal. Confirm that [the API health route](http://localhost:3000/api/v1/health) responds. Then create `.env.local` in the web repository root using [`.env.example`](./.env.example):

```dotenv
VITE_API_URL=http://localhost:3000/api/v1
```

Keep the `/api/v1` suffix. If the web or API port changes, update both `VITE_API_URL` and the API's `FRONTEND_ORIGIN` as appropriate, then restart the running processes. Vite environment values are public to the browser; do not put secrets in them.

```bash
npm run dev -- --port 5173 --strictPort
```

Open [http://localhost:5173](http://localhost:5173). Use the local development API settings for templates and warehouses. A working health route does not mean those routes are enabled.

## Project layout

| Path | Purpose |
| --- | --- |
| [`src/App.tsx`](./src/App.tsx) | Workspace shell and module navigation |
| [`src/components/`](./src/components) | Template builder, warehouses, tasks, supervisors, and other workspace screens |
| [`src/components/collected-data/`](./src/components/collected-data) | Collected Data list, details, review UI, and CSV export |
| [`src/services/`](./src/services) | Template, warehouse, and location API clients |
| [`src/types/`](./src/types) | Shared web types |

## Verify a change

```bash
npm run check
npm run lint
```

`check` runs the TypeScript and Vite production build. Use `npm run preview` to inspect the built app locally; it is not the API server. On Windows PowerShell, use `npm.cmd` if your execution policy blocks `npm.ps1`.

For a browser smoke test:

1. Create a template draft, reload the page, and reopen it. Publish it and verify that **View** opens a read-only snapshot.
2. Open a test warehouse and add or edit a location. Reload and verify that the change persists. In Create Task, switch warehouses and check that locations belong to the selected warehouse.
3. Open **Collected Data** and verify the **Sample data** label, details, export, and review interaction. A sample review is not a database write.

## Contribute

Use your existing feature branch and keep it current with `chore/web-foundation`. Open PRs against `chore/web-foundation`; use `main` for reviewed project milestones. Link the Jira issue, describe which screens changed, report build and lint results, and identify which browser checks used live development data versus fixtures.

- [Web CI](./.github/workflows/ci.yml)
- [BitSync Jira board](https://gunasekarapdvp.atlassian.net/jira/software/projects/SCRUM/boards/1)
