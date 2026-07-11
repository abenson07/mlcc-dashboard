export function IconColorSwatch({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="8" height="8" rx="2" fill={color} />
    </svg>
  );
}

export function IconSwap() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.00327 14.6685C4.32136 14.6685 1.33659 11.6838 1.33659 8.00184C1.33659 4.31997 4.32136 1.33521 8.00327 1.33521C11.6851 1.33521 14.6699 4.31997 14.6699 8.00184C14.6699 11.6838 11.6851 14.6685 8.00327 14.6685ZM8.00327 13.3352C10.9488 13.3352 13.3366 10.9474 13.3366 8.00184C13.3366 5.05635 10.9488 2.66854 8.00327 2.66854C5.05774 2.66854 2.66992 5.05635 2.66992 8.00184C2.66992 10.9474 5.05774 13.3352 8.00327 13.3352ZM4.66992 6.00187L6.66994 3.66854L8.66994 6.00187H7.3366V8.66851H6.00326V6.00187H4.66992ZM11.3366 10.0018L9.3366 12.3352L7.3366 10.0018H8.66994V7.33517H10.0033V10.0018H11.3366Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconStatusConfirmed() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="6" fill="#34C759" />
    </svg>
  );
}

export function IconStatusUnresponsive() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.4" stroke="#FFCC00" strokeWidth="1.2" opacity="0.35" />
      <path d="M7 1.3A5.7 5.7 0 0 1 7 12.7V7Z" fill="#FFCC00" />
    </svg>
  );
}

export function IconStatusDeclined() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.4" stroke="#FF9500" strokeWidth="1.2" opacity="0.35" />
      <path d="M7 7V1.3A5.7 5.7 0 0 1 12.03 4.36L7 7Z" fill="#FF9500" />
    </svg>
  );
}

export function IconStatusSwapNeeded() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.00327 14.6685C4.32136 14.6685 1.33659 11.6838 1.33659 8.00184C1.33659 4.31997 4.32136 1.33521 8.00327 1.33521C11.6851 1.33521 14.6699 4.31997 14.6699 8.00184C14.6699 11.6838 11.6851 14.6685 8.00327 14.6685ZM8.00327 13.3352C10.9488 13.3352 13.3366 10.9474 13.3366 8.00184C13.3366 5.05635 10.9488 2.66854 8.00327 2.66854C5.05774 2.66854 2.66992 5.05635 2.66992 8.00184C2.66992 10.9474 5.05774 13.3352 8.00327 13.3352ZM4.66992 6.00187L6.66994 3.66854L8.66994 6.00187H7.3366V8.66851H6.00326V6.00187H4.66992ZM11.3366 10.0018L9.3366 12.3352L7.3366 10.0018H8.66994V7.33517H10.0033V10.0018H11.3366Z"
        fill="#AF52DE"
      />
    </svg>
  );
}

export function IconDownload({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 1.5v8M3.5 6.5L7 10l3.5-3.5M1.5 10v2.5h11V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDocument({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.99972 6.49986V2.87413C9.99972 2.79456 9.96812 2.71826 9.91187 2.66199L8.33757 1.08773C8.28132 1.03147 8.20502 0.99986 8.12547 0.99986H2.29972C2.13404 0.99986 1.99972 1.13418 1.99972 1.29986V10.6999C1.99972 10.8656 2.13404 10.9999 2.29972 10.9999H6.99972"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.99972 0.99986V2.69986C7.99972 2.86555 8.13402 2.99986 8.29972 2.99986H9.99972"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.99972 9.50014H10.9997M9.49972 11.0001L10.9997 9.50014L9.49972 8.00014"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
