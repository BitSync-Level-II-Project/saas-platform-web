# M5 web module (Alerts, Rules, Audit log, Notifications)

Styled to the Figma "Field Operations - Web UI" screens and built first against an in-browser
mock backend (Part B of the M5 coding guide).

## Run

    npm install react-router-dom @tanstack/react-query   # once
    npm run dev

Open http://localhost:5173/ for the original starter page, then use the button on it,
or go straight to /alerts. Mock mode is on by default; set `VITE_USE_MOCK=false`
(with `VITE_API_URL`) to call a real API. Mock data resets when you refresh.

## Try the flow

1. Alerts tab: open "Simulate a device reading", press "Send hot reading (85 °C)".
2. A critical alert appears, the bell count rises and the banner shows. Open it:
   Acknowledge, Escalate (reason needed), Resolve (note needed).
3. Rules tab: Create alert rule, pause/activate, edit (History tab shows each change), delete (reason needed).
4. Audit log (manager and admin only): filter, click a row, see before and after in Event details.
5. "Viewing as" in the top bar switches Manager / Supervisor / Admin (demo only).

## Where things are

    types.ts            shared types (same names as the backend contract)
    lib/                pure logic (evaluate), formatting, labels, permissions
    mock/               fake database, rule engine, endpoint handlers
    api/m5Api.ts        one function per endpoint (mock branch + real branch)
    api/hooks.ts        react-query hooks
    components/         badges, dialogs, table, toast, bell, banner, icons
    layout/             AppLayout (Figma sidebar and top bar) + nav items
    pages/              Alerts (tabs), RulesTab, RuleEditor, AlertDetails, AuditLog, Placeholder
    routes.tsx          m5Routes: the only thing the app router needs
    session.ts          stand-in for the logged-in user (replace with M1 auth)
    m5.css              all styling; one font variable (--m5-font) at the top

## Connecting to the team shell later

Keep their layout: add `...m5Routes` to its child routes, make sure Alerts and Audit log are in
its menu, replace `session.ts` with their auth hook, and point `getReference()` in
`api/m5Api.ts` at the M2 (warehouses, devices) and M3 (templates) endpoints.

## Not built yet

Notifications page and preferences, Events log, Operations monitor, Device health
(placeholders). Sidebar items owned by other modules open a placeholder page.
