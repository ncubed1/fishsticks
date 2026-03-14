import { SlidersHorizontal } from "lucide-react";
import SideButton from "./SideButton";

export default function SceneSettingsButton() {
  return (
    <SideButton
      icon={<SlidersHorizontal size={24} strokeWidth={2.25} />}
      label="Scene Settings"
      color="yellow"
    />
  );
}
