# Alerts, Rules, Audit log and Notifications

Built to the same pattern as the other screens: `App.tsx` owns the current view, the pages
receive callbacks, and styling uses the shared classes in `App.css` (the alert-specific ones
start with `al-` and sit in one block at the end of that file).

## Run

    npm install lucide-react @tanstack/react-query
    npm run dev

The site opens on **Alerts**. Everything runs on built-in sample data, so no backend is needed.
Sample data resets when you refresh the page.

## Try the flow

1. Alerts tab: open "Simulate a device reading" and press "Send hot reading (85 °C)".
2. A critical alert appears, the bell shows a dot and a banner appears at the top. Open the alert:
   Acknowledge, Escalate (reason needed), Resolve (note needed).
3. Rules tab: Create alert rule, pause or activate, edit (History tab shows every change), delete (reason needed).
4. Audit log (manager and admin): filter, click a row, read the Event details.
5. The bell: "View all notifications" opens the Notifications page.
6. To see another role add `?role=supervisor` or `?role=admin` to the address (default is Manager).

## Folders

    types.ts            shared types
    navigation.ts       the callbacks pages use to move around
    session.ts          stand-in for the signed-in user (swap for the real login hook)
    lib/                rule evaluation, formatting, labels, permissions
    mock/               sample database, rule engine, endpoint handlers
    api/alertsApi.ts    one function per endpoint (sample data now, real API when ready)
    api/hooks.ts        data hooks (@tanstack/react-query)
    parts/              badges, table, dialogs, form field, toast, bell, banner, simulate panel
    pages/              Alerts, RulesTab, RuleEditor, AlertDetails, AuditLog, Notifications

## Connecting to the real backend later

Set `VITE_USE_MOCK=false` and `VITE_API_URL`. Each function in `api/alertsApi.ts` already has the
real request next to the sample one. Point `getReference()` at the warehouses, devices and templates
endpoints of the other modules, and replace `session.ts` with the real login.

## Not built yet

Notification preferences and the Events log, Operations monitor and Device health screens.
