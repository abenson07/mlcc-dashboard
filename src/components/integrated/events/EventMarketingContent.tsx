"use client";

import { MOCK_MARKETING_ITEMS } from "../mockData";

export default function EventMarketingContent() {
  return (
    <div>
      <div className="lf-page-header">
        <h1 className="lf-h1">Marketing</h1>
        <div className="lf-card-actions">
          <button type="button" className="lf-small-btn">Edit</button>
          <button type="button" className="lf-small-btn">Share</button>
        </div>
      </div>
      <p className="lf-page-desc" style={{ marginBottom: 20 }}>4 scheduled items in total</p>

      <div className="lf-story-list">
        {MOCK_MARKETING_ITEMS.map((item) => (
          <button key={item.title} type="button" className="lf-event-row" style={{ marginBottom: 8 }}>
            <span className="lf-story-date lf-meta">{item.date}</span>
            <span className="lf-story-badge" style={{ background: item.color }}>{item.channel}</span>
            <span style={{ flex: 1, textAlign: "left" }}>{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
