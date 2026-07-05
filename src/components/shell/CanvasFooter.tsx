import { Bug, ListVideo, MessageSquare } from "lucide-react";
import FooterMenuItem from "./FooterMenuItem";

export default function CanvasFooter() {
  return (
    <footer className="shell-canvas-footer">
      <div className="shell-footer-group">
        <FooterMenuItem
          icon={<ListVideo size={16} strokeWidth={1.5} />}
          label="Help doc one"
          tooltip="Coming soon"
        />
        <FooterMenuItem
          icon={<ListVideo size={16} strokeWidth={1.5} />}
          label="Help doc two"
          tooltip="Coming soon"
        />
      </div>
      <div className="shell-footer-group">
        <FooterMenuItem
          icon={<MessageSquare size={16} strokeWidth={1.5} />}
          label="Submit feedback"
          tooltip="Coming soon"
        />
        <FooterMenuItem
          icon={<Bug size={16} strokeWidth={1.5} />}
          label="Report a bug"
          tooltip="Coming soon"
        />
      </div>
    </footer>
  );
}
