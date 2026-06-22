"use client";

type CloseOutBannerProps = {
  title: string;
  onReview: () => void;
};

export default function CloseOutBanner({ title, onReview }: CloseOutBannerProps) {
  return (
    <div className="lf-banner lf-banner--green">
      <div className="lf-close-out-banner">
        <div>
          <strong>{title} delivery complete!</strong>
          <span className="lf-close-out-banner-sub">
            Review results and close out this leaflet when ready.
          </span>
        </div>
        <button type="button" className="lf-btn lf-btn--accent" onClick={onReview}>
          Review results
        </button>
      </div>
    </div>
  );
}
