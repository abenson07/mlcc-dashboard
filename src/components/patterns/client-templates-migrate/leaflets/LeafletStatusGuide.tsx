import { Text } from "@/components/patterns/primitives/Text";

export function LeafletStatusGuide() {
  return (
    <footer
      aria-label="Leaflet status guide"
      style={{
        position: "sticky",
        boxSizing: "border-box",
        bottom: 0,
        zIndex: 1,
        flexShrink: 0,
        marginTop: "auto",
        marginInline: -24,
        padding: "12px 24px 16px",
        maxHeight: "40vh",
        overflowY: "auto",
        background: "var(--linear-color-canvas)",
        borderTop: "var(--linear-border-width) solid var(--linear-color-hairline)",
        boxShadow: "0 -8px 16px var(--linear-color-canvas)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: 13,
          lineHeight: "20px",
          color: "var(--linear-color-ink-subtle)",
        }}
      >
        <caption style={{ textAlign: "left", paddingBottom: 4 }}>
          <Text weight="semibold" size="sm">Issue statuses</Text>
        </caption>
        <thead>
          <tr>
            <th scope="col" style={{ padding: "2px 12px 2px 0" }}>Status</th>
            <th scope="col" style={{ paddingBlock: 2 }}>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Planned", "Upcoming issue being prepared."],
            ["Active", "Current issue used by public open-route listings and signups. Only one can be active."],
            ["Closed", "Past/completed issue; its data remains available."],
          ].map(([status, meaning]) => (
            <tr key={status} style={{ background: "transparent", transition: "none" }}>
              <th
                scope="row"
                style={{ padding: "2px 12px 2px 0", verticalAlign: "top", fontWeight: 500 }}
              >
                {status}
              </th>
              <td style={{ paddingBlock: 2, verticalAlign: "top" }}>{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Text size="sm" color="secondary" display="block" style={{ marginTop: 6 }}>
        Status changes do not send emails. Use Send/Resend separately; closing does not block manual sends.
      </Text>
    </footer>
  );
}
