# Debug: Login 500 / React #418 in Production

**Context:** Login works locally but fails when deployed. Used to continue debugging in a new chat.

---

## What’s happening

When logging in on the **deployed** app:

1. **Browser:** `[login] form submit` runs (form submits).
2. **Network:** A request returns **500** (often reported as `login:1 Failed to load resource: 500`).
3. **React:** **Minified React error #418** — hydration failed because server-rendered HTML didn’t match the client.
4. **Next:** “An error occurred in the Server Components render…” (message omitted in production).

So we have a **server-side 500** (and/or a Server Component throwing) plus a **client-side hydration error** (#418). The 500 may be the cause; the hydration error may be a consequence or a separate issue.

---

## Hypotheses (and how logs map to them)

| ID   | Hypothesis | What would confirm it |
|------|------------|------------------------|
| **H-A** | The **server action `signIn`** throws in production (env, Supabase, or an uncaught error) and causes the 500. | Last `[debug-42f575]` from the action is `"action entry"` or `"uncaught"` (top-level catch). |
| **H-B** | **`createClient()` in `src/lib/supabase/server.ts`** throws in production (e.g. `cookies()`, env, or serverless behavior). | Logs show `"server.ts:createClient"` with `"cookies() throw"` or we never see `"client created"`. |
| **H-C** | The **(admin) layout** throws when it runs (e.g. after redirect to `/neighbors/all`). | Logs show `"admin/layout.tsx"` with `"layout throw"` or failure between `"entry"` and `"getUser done"`. |
| **H-D** | **`redirect()`** in the server action is handled differently in production and surfaces as a 500 or triggers a render error. | We see `"before redirect"` then `"redirect throw"` with a non-NEXT_REDIRECT error, or 500 right after “before redirect”. |
| **H-E** | **Hydration (#418)** is separate (e.g. `ThemeTogglerTwo` or client-only state). The 500 is from the action or layout. | Server logs show a clear 500 cause (e.g. H-A/B/C/D); hydration may still need a separate fix (suppress client-only until mounted, etc.). |
| **H-F** | The **Next.js error digest** (logged in catch blocks) reveals the underlying exception. | Logs show `digest` in a catch payload; digest can be correlated with Next.js server error types. |

---

## Instrumentation that was added

### 1. Debug logger

- **File:** `src/lib/debug-session.ts`
- **Behavior:** Sends a JSON payload to the debug ingest and also runs `console.error("[debug-6da16b]", JSON.stringify(payload))` so:
  - **Local:** logs can be read from the session log file (`.cursor/debug-6da16b.log`).
  - **Deployed (e.g. Vercel):** the same payload appears in **server/function logs** (search for `[debug-6da16b]`).

Payload shape: `{ sessionId, location, message, data, timestamp, hypothesisId }`.  
`hypothesisId` is one of: **H-A**, **H-B**, **H-C**, **H-D**, **H-F**. Catch-block logs include `digest` in `data` when present (H-F).

### 2. Where `debugLog` is called

**Server action** `src/app/(full-width-pages)/(auth)/login/actions.ts`:

- `"action entry"` (H-A) — start of `signIn`
- `"createClient throw"` (H-B) — `createClient()` threw
- `"createClient ok"` (H-B) — after `createClient()` succeeded
- `"before redirect"` (H-D) — right before `redirect("/neighbors/all")`
- `"redirect throw"` (H-D) — in the catch for `redirect()`
- `"uncaught"` (H-A) — top-level catch around the whole action

**Supabase server client** `src/lib/supabase/server.ts`:

- `"entry"` (H-B) — start of `createClient()`
- `"cookies() throw"` (H-B) — `cookies()` threw
- `"client created"` (H-B) — after `createServerClient()` returned

**Admin layout** `src/app/(admin)/layout.tsx`:

- `"entry"` (H-C) — start of layout
- `"getUser done"` (H-C) — after `getUser()`, with `hasUser: boolean`
- `"redirect to login"` (H-C) — about to call `redirect("/login")`
- `"layout throw"` (H-C) — layout’s catch (any throw in layout or children)

---

## How to use this in a new chat

1. **Reproduce on the deployed app:** open login, submit valid credentials, let the 500 and #418 happen.
2. **Get server logs:** In your host (e.g. Vercel → Project → Logs / Function logs), find lines containing **`[debug-6da16b]`**. Copy the last few lines before the 500 (or the whole run).
3. **In the new chat:** Share this file and the pasted log lines. Ask to:
   - Map the last `[debug-6da16b]` message to a hypothesis (H-A/B/C/D/H-F).
   - Propose a fix based on that (and, if needed, a separate hydration fix for H-E).

---

## File reference

- **This doc:** `docs/DEBUG-LOGIN-PRODUCTION.md`
- **Logger:** `src/lib/debug-session.ts` (session **6da16b**)
- **Instrumented files:**  
  `src/app/(full-width-pages)/(auth)/login/actions.ts`  
  `src/lib/supabase/server.ts`  
  `src/app/(admin)/layout.tsx`

After the bug is fixed and verified, you can remove `debug-session.ts`, all `debugLog(...)` calls, and the top-level try/catch in the signIn action added for H-A.
