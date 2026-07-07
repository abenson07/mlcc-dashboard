export default function RouteNameCell({
  routeName,
  routeType,
}: {
  routeName?: string | null;
  routeType?: string | null;
}) {
  return (
    <td>
      <span className="lf-table-title">{routeName ?? "—"}</span>
      {routeType ? <span className="lf-table-subtitle">{routeType}</span> : null}
    </td>
  );
}
