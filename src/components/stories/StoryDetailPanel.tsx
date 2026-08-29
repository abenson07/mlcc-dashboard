"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IconClose } from "@/components/leaflet/routes/leafletIcons";
import DatePickerField from "@/components/form/DatePicker";
import { useLeaflets, usePeople, useStories } from "hooks";
import type { Stories } from "@/types/database";
import StoryBodyEditor from "./StoryBodyEditor";

type StoryDetailPanelProps = {
  story: Stories;
  onClose: () => void;
  onDeleted: () => void;
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function StoryDetailPanel({ story, onClose, onDeleted }: StoryDetailPanelProps) {
  const { update, remove, uploadCoverImage } = useStories({ autoFetch: false });
  const { leaflets } = useLeaflets();
  const { people } = usePeople();
  const [title, setTitle] = useState(story.title);
  const [publishDate, setPublishDate] = useState(story.publish_date ?? todayDateString());
  const [deleting, setDeleting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    setTitle(story.title);
    setPublishDate(story.publish_date ?? todayDateString());
  }, [story.id, story.title, story.publish_date]);

  const isScheduled = publishDate > todayDateString();
  const isNeverPublished = story.status === "draft";

  async function handleCancel() {
    setDeleting(true);
    try {
      const ok = await remove(story.id);
      if (ok) onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${story.title || "this story"}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const ok = await remove(story.id);
      if (ok) onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  async function handlePublish() {
    await update(story.id, { publish_date: publishDate, status: "published" });
  }

  async function handleCoverImageChange(file: File) {
    setUploadingCover(true);
    try {
      const url = await uploadCoverImage(file);
      await update(story.id, { cover_image_url: url });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cover image upload failed");
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <div className="lf-faqs-detail-inner">
      <div className="lf-person-detail-header">
        <div>
          <h2 className="lf-h2">Story</h2>
          <p className="lf-meta">{story.status === "published" ? "Published" : "Draft"}</p>
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
        <label className="lf-detail-label" htmlFor="story-title">
          Title
        </label>
        <input
          id="story-title"
          className="lf-input"
          value={title}
          autoFocus={!story.title}
          placeholder="Untitled story"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title !== story.title) void update(story.id, { title });
          }}
        />
      </div>

      <div className="lf-faqs-field">
        <label className="lf-detail-label" htmlFor="story-author">
          Author
        </label>
        <select
          id="story-author"
          className="lf-select"
          style={{ width: "100%" }}
          value={people.find((p) => p.full_name === story.author)?.id ?? ""}
          onChange={(e) => {
            const person = people.find((p) => p.id === e.target.value);
            void update(story.id, { author: person?.full_name ?? "" });
          }}
        >
          <option value="">Unassigned</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="lf-faqs-field">
        <label className="lf-detail-label" htmlFor="story-cover">
          Cover image
        </label>
        {story.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.cover_image_url} alt="" className="lf-story-cover-preview" />
        ) : null}
        <input
          id="story-cover"
          type="file"
          accept="image/*"
          disabled={uploadingCover}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleCoverImageChange(file);
          }}
        />
        {uploadingCover ? <p className="lf-meta">Uploading…</p> : null}
      </div>

      <div className="lf-faqs-field">
        <label className="lf-detail-label" htmlFor="story-publish-date">
          Publish date
        </label>
        <DatePickerField
          id="story-publish-date"
          value={publishDate}
          onChange={(next) => {
            setPublishDate(next);
            void update(story.id, { publish_date: next || null });
          }}
        />
      </div>

      <div className="lf-faqs-field">
        <label className="lf-detail-label" htmlFor="story-leaflet">
          Leaflet
        </label>
        <select
          id="story-leaflet"
          className="lf-select"
          style={{ width: "100%" }}
          value={story.leaflet_id ?? ""}
          onChange={(e) => void update(story.id, { leaflet_id: e.target.value || null })}
        >
          <option value="">No leaflet (standalone)</option>
          {leaflets.map((leaflet) => (
            <option key={leaflet.id} value={leaflet.id}>
              {leaflet.title}
            </option>
          ))}
        </select>
      </div>

      <div className="lf-faqs-field">
        <label className="lf-detail-label">Body</label>
        <StoryBodyEditor
          content={story.body}
          onChange={(html) => void update(story.id, { body: html })}
          onUploadImage={uploadCoverImage}
        />
      </div>

      <div className="lf-faqs-field" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {isNeverPublished ? (
          <button type="button" className="lf-link" disabled={deleting} onClick={() => void handleCancel()}>
            {deleting ? "Cancelling…" : "Cancel"}
          </button>
        ) : (
          <button type="button" className="lf-small-btn lf-text-red" disabled={deleting} onClick={() => void handleDelete()}>
            {deleting ? "Deleting…" : "Delete story"}
          </button>
        )}
        <button type="button" className="lf-btn lf-btn--accent" onClick={() => void handlePublish()}>
          {isScheduled ? "Schedule" : "Publish"}
        </button>
      </div>
    </div>
  );
}
