"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";

const COMMITTEES = Object.keys(COMMITTEE_LABELS) as CommitteeSlug[];

type InviteMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [committee, setCommittee] = useState<CommitteeSlug>("steering");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim() || undefined,
          committee,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(body?.error ?? "Failed to invite member");
      }
      setEmail("");
      setFullName("");
      setCommittee("steering");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <h2 className="lf-h2" style={{ fontSize: 18 }}>Invite member</h2>
      <p className="lf-page-desc">
        Sends an admin dashboard invite and adds them to a committee&apos;s roster.
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>
        <div>
          <Label htmlFor="invite-name">Full name (optional)</Label>
          <Input
            id="invite-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <Label htmlFor="invite-committee">Committee</Label>
          <select
            id="invite-committee"
            className="lf-select"
            style={{ width: "100%" }}
            value={committee}
            onChange={(e) => setCommittee(e.target.value as CommitteeSlug)}
          >
            {COMMITTEES.map((slug) => (
              <option key={slug} value={slug}>
                {COMMITTEE_LABELS[slug]}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="lf-text-red" style={{ fontSize: 13 }}>{error}</p>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !email.trim()}>
            {saving ? "Inviting…" : "Invite member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
