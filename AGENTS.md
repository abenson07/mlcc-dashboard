# MLCC Dashboard — agent instructions

## Admin-migrate: demo / live layout parity

`/admin-migrate` has two modes (demo and live) that can show **different data**, but they must share the **same layouts, structure, and UI**.

When changing layout, spacing, composition, chrome, navigation, or interaction patterns for admin-migrate:

- Apply the change in **both** demo mode and live mode.
- Do **not** leave one mode with an older layout while updating the other.
- Data sources, mocks, empty states, and write behavior may differ between modes; visual/layout parity still applies.

Primary surfaces: `src/app/admin-migrate/**`, `src/components/patterns/client-templates-migrate/**`, and shared foundation pieces used by that admin shell.
