"use client";

import { useEffect, useState } from "react";
import { IconClose } from "@/components/leaflet/routes/leafletIcons";
import { useFaqs } from "hooks";
import type { FaqWithPages } from "hooks";
import { FAQ_PAGE_OPTIONS } from "schemas/faqs";

type FaqDetailPanelProps = {
  faq: FaqWithPages;
  onClose: () => void;
  onDeleted: () => void;
};

export default function FaqDetailPanel({ faq, onClose, onDeleted }: FaqDetailPanelProps) {
  const { update, remove, togglePage } = useFaqs({ autoFetch: false });
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [deleting, setDeleting] = useState(false);
  const [pageSaving, setPageSaving] = useState<string | null>(null);

  useEffect(() => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
  }, [faq.id, faq.question, faq.answer]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${faq.question}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const ok = await remove(faq.id);
      if (ok) onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="lf-faqs-detail-inner">
      <div className="lf-person-detail-header">
        <div>
          <h2 className="lf-h2">FAQ</h2>
          <p className="lf-meta">{faq.is_active ? "Active" : "Inactive"}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex shrink-0 rounded p-0.5 text-[#A1A1AA] hover:text-[#71717A]"
          aria-label="Close details"
        >
          <IconClose />
        </button>
      </div>

      <div className="lf-faqs-field">
        <label className="lf-detail-label" htmlFor="faq-question">
          Question
        </label>
        <input
          id="faq-question"
          className="lf-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onBlur={() => {
            if (question.trim() && question !== faq.question) {
              void update(faq.id, { question: question.trim() });
            }
          }}
        />
      </div>

      <div className="lf-faqs-field">
        <label className="lf-detail-label" htmlFor="faq-answer">
          Answer
        </label>
        <textarea
          id="faq-answer"
          className="lf-textarea"
          rows={8}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onBlur={() => {
            if (answer !== faq.answer) {
              void update(faq.id, { answer });
            }
          }}
        />
      </div>

      <section className="lf-detail-card">
        <div className="lf-card-header">
          <span className="lf-card-title">Show on pages</span>
        </div>
        <div className="lf-card-body lf-faqs-page-grid">
          {FAQ_PAGE_OPTIONS.map((page) => {
            const checked = faq.pages.includes(page.slug);
            return (
              <label key={page.slug} className="lf-task-box">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={pageSaving === page.slug}
                  onChange={async (e) => {
                    setPageSaving(page.slug);
                    try {
                      await togglePage(faq.id, page.slug, e.target.checked);
                    } finally {
                      setPageSaving(null);
                    }
                  }}
                />
                <span>{page.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        className="lf-small-btn lf-text-red"
        disabled={deleting}
        onClick={() => void handleDelete()}
      >
        {deleting ? "Deleting…" : "Delete FAQ"}
      </button>
    </div>
  );
}
