"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import { useModal } from "@/hooks/useModal";
import { installConsoleBuffer, getConsoleSnapshot } from "./consoleBuffer";

type FeedbackType = "bug" | "feature";

export default function FeedbackFab() {
  const pathname = usePathname();
  const { isOpen, openModal, closeModal } = useModal();
  const [type, setType] = useState<FeedbackType>("bug");
  const [whatWentWrong, setWhatWentWrong] = useState("");
  const [whatShouldHaveHappened, setWhatShouldHaveHappened] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [userName, setUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    installConsoleBuffer();
  }, []);

  const handleOpen = () => {
    setWhatWentWrong("");
    setWhatShouldHaveHappened("");
    setFeatureDescription("");
    setUserName("");
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const page = pathname ?? "";

    if (type === "bug") {
      const wrong = whatWentWrong.trim();
      const expected = whatShouldHaveHappened.trim();
      if (!wrong || !expected) {
        toast.error("Please answer both questions.");
        return;
      }
      setSubmitting(true);
      try {
        const details = `**What went wrong:**\n${wrong}\n\n**What should have happened:**\n${expected}`;
        let errorLog = "";
        try {
          errorLog = getConsoleSnapshot() ?? "";
        } catch {
          // never fail submission if console capture is missing or throws
        }
        const res = await fetch("/api/linear/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "bug",
            page,
            details,
            ...(errorLog ? { errorLog } : {}),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error ?? "Failed to submit.");
          return;
        }
        toast.success("Bug report submitted to Linear.");
        closeModal();
        setWhatWentWrong("");
        setWhatShouldHaveHappened("");
      } catch {
        toast.error("Failed to submit.");
      } finally {
        setSubmitting(false);
      }
    } else {
      const feature = featureDescription.trim();
      const name = userName.trim();
      if (!feature) {
        toast.error("Please describe the feature you want.");
        return;
      }
      if (!name) {
        toast.error("Please enter your name.");
        return;
      }
      setSubmitting(true);
      try {
        const details = `**What feature do you want?**\n${feature}\n\n**Submitted by:** ${name}`;
        const res = await fetch("/api/linear/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "feature",
            page,
            details,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.error ?? "Failed to submit.");
          return;
        }
        toast.success("Feature request submitted to Linear.");
        closeModal();
        setFeatureDescription("");
        setUserName("");
      } catch {
        toast.error("Failed to submit.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="Submit bug report or feature request"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[584px] p-5 lg:p-10"
      >
        <form onSubmit={handleSubmit}>
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Bug report or feature request
          </h4>

          <div className="mb-4 flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setType("bug")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                type === "bug"
                  ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Bug report
            </button>
            <button
              type="button"
              onClick={() => setType("feature")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                type === "feature"
                  ? "bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Feature request
            </button>
          </div>

          <div className="space-y-5">
            {type === "bug" ? (
              <>
                <div>
                  <Label htmlFor="feedback-wrong">What went wrong?</Label>
                  <TextArea
                    id="feedback-wrong"
                    rows={3}
                    value={whatWentWrong}
                    onChange={setWhatWentWrong}
                    placeholder="Describe what happened..."
                  />
                </div>
                <div>
                  <Label htmlFor="feedback-expected">What should have happened?</Label>
                  <TextArea
                    id="feedback-expected"
                    rows={3}
                    value={whatShouldHaveHappened}
                    onChange={setWhatShouldHaveHappened}
                    placeholder="Describe the expected behavior..."
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="feedback-feature">What feature do you want?</Label>
                  <TextArea
                    id="feedback-feature"
                    rows={4}
                    value={featureDescription}
                    onChange={setFeatureDescription}
                    placeholder="Describe the feature you'd like..."
                  />
                </div>
                <div>
                  <Label htmlFor="feedback-name">Your name</Label>
                  <input
                    id="feedback-name"
                    type="text"
                    required
                    placeholder="Your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" size="sm" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
