import "@/components/leaflet/leaflet.css";
import "@/components/integrated/integrated.css";

export default function PeopleLayout({ children }: { children: React.ReactNode }) {
  return <div className="leaflet-app lf-shell">{children}</div>;
}
