"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/apiBase";
import type { ActionItemWithAssignee } from "hooks/useCommitteeMeeting";
import { usePeople } from "hooks";

type ActionItemsTableProps = {
  items: ActionItemWithAssignee[];
  onUpdated: () => void;
  readOnly?: boolean;
};

export default function ActionItemsTable({
  items,
  onUpdated,
  readOnly = false,
}: ActionItemsTableProps) {
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { people } = usePeople({
    autoFetch: Boolean(reassignId),
    filters: { search: search.trim() || undefined },
  });

  async function patchItem(
    id: string,
    patch: { status?: "open" | "done"; assignee_person_id?: string | null },
  ) {
    const res = await fetch(`${getApiBase()}/api/action-items/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(body.error ?? "Failed to update");
    onUpdated();
  }

  if (items.length === 0) {
    return <p className="lf-meta">No action items yet.</p>;
  }

  return (
    <div className="lf-action-items-table">
      <table className="lf-table">
        <thead>
          <tr>
            <th>Done</th>
            <th>Action item</th>
            <th>Assignee</th>
            <th>Due</th>
            {!readOnly && <th />}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  type="checkbox"
                  checked={item.status === "done"}
                  disabled={readOnly}
                  onChange={(e) =>
                    void patchItem(item.id, {
                      status: e.target.checked ? "done" : "open",
                    })
                  }
                />
              </td>
              <td>
                <strong>{item.title}</strong>
                {item.description ? (
                  <p className="lf-meta" style={{ marginTop: 4 }}>{item.description}</p>
                ) : null}
              </td>
              <td>{item.assignee?.full_name ?? "Unassigned"}</td>
              <td>{item.due_at ?? "—"}</td>
              {!readOnly && (
                <td>
                  <button
                    type="button"
                    className="lf-btn lf-btn--ghost lf-btn--sm"
                    onClick={() => setReassignId(reassignId === item.id ? null : item.id)}
                  >
                    Reassign
                  </button>
                  {reassignId === item.id && (
                    <div className="lf-reassign-popover">
                      <input
                        type="search"
                        className="lf-input"
                        placeholder="Search people…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {people.slice(0, 8).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="lf-mention-item"
                          onClick={() => {
                            void patchItem(item.id, { assignee_person_id: p.id }).then(() => {
                              setReassignId(null);
                              setSearch("");
                            });
                          }}
                        >
                          {p.full_name}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
