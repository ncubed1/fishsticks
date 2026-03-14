import { BookOpenText } from "lucide-react";
import SideButton from "./SideButton";

export default function GuideButton() {
  return (
    <SideButton
      icon={<BookOpenText size={24} strokeWidth={2.25} />}
      label="Guide"
      color="yellow"
    />
  );
}
