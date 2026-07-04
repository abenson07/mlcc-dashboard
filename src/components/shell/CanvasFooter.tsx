import { Bug, ListVideo, MessageSquare } from "lucide-react";
import FooterMenuItem from "./FooterMenuItem";

export default function CanvasFooter() {
  return (
    <footer className="shell-canvas-footer">
      <div className="shell-footer-group">
        <FooterMenuItem
          icon={<ListVideo size={16} strokeWidth={1.5} />}
          label="Help doc one"
        />
        <FooterMenuItem
          icon={<ListVideo size={16} strokeWidth={1.5} />}
          label="Help doc two"
        />
      </div>
      <div className="shell-footer-group">
        <FooterMenuItem
          icon={<MessageSquare size={16} strokeWidth={1.5} />}
          label="Submit feedback"
        />
        <FooterMenuItem icon={<Bug size={16} strokeWidth={1.5} />} label="Report a bug" />
      </div>
    </footer>
  );
}
