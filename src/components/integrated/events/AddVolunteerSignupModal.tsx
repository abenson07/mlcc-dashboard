"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { usePeople } from "hooks";
import type { VolunteerAskWithSignups } from "hooks";
import { supabaseClient } from "@/lib/supabaseClient";
import { toast } from "sonner";

type AddVolunteerSignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  asks: VolunteerAskWithSignups[];
  onAdded?: () => void;
  readOnly?: boolean;
};

export default function AddVolunteerSignupModal({
  isOpen,
  onClose,
  asks,
  onAdded,
  readOnly = false,
}: AddVolunteerSignupModalProps) {
  const [search, setSearch] = useState("");
  const [askId, setAskId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { people, loading } = usePeople({
    autoFetch: isOpen,
    filters: { search: search.trim() || undefined },
  });

  const askOptions = useMemo(
    () =>
      asks
        .filter((a) => a.remaining_slots > 0)
        .map((a) => ({
          value: a.id,
          label: `${a.title} (${a.signup_count}/${a.quantity})`,
        })),
    [asks],
  );

  const eligiblePeople = useMemo(() => {
    if (!askId) return people.slice(0, 20);
    const ask = asks.find((a) => a.id === askId);
    if (!ask) return people.slice(0, 20);
    const signedUp = new Set(ask.signups.map((s) => s.person_id));
    return people.filter((p) => !signedUp.has(p.id)).slice(0, 20);
  }, [people, askId, asks]);

  const reset = () => {
    setSearch("");
    setAskId("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = async (personId: string) => {
    if (readOnly || !askId || !supabaseClient) return;
    const ask = asks.find((a) => a.id === askId);
    if (!ask || ask.remaining_slots <= 0) {
      toast.error("This hub is full.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabaseClient.from("volunteers").insert({
        volunteer_ask_id: askId,
        person_id: personId,
      });
      if (error) throw error;
      toast.success("Volunteer added.");
      onAdded?.();
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add volunteer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6">
      <h2 className="lf-h2" style={{ marginBottom: 16 }}>
        Add volunteer signup
      </h2>

      {askOptions.length === 0 ? (
        <p className="lf-meta">All volunteer hubs are full. Create a new hub or increase capacity.</p>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <Label>Volunteer hub</Label>
            <Select
              placeholder="Select a hub"
              options={askOptions}
              onChange={setAskId}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Label>Search people</Label>
            <Input
              type="search"
              placeholder="Name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {loading ? (
              <p className="lf-meta">Loading people…</p>
            ) : eligiblePeople.length === 0 ? (
              <p className="lf-meta">No matching people.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {eligiblePeople.map((person) => (
                  <li
                    key={person.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--lf-border, #eee)",
                    }}
                  >
                    <span>
                      <span style={{ fontWeight: 500 }}>{person.full_name ?? "—"}</span>
                      {person.email ? (
                        <span className="lf-meta" style={{ marginLeft: 8 }}>
                          {person.email}
                        </span>
                      ) : null}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!askId || submitting || readOnly}
                      onClick={() => void handleAdd(person.id)}
                    >
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <Button type="button" size="sm" variant="outline" onClick={handleClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
