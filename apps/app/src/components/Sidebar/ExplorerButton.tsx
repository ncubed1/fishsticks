import { Compass } from "lucide-react";
import SideButton from "./SideButton";

export default function ExplorerButton() {
  return (
    <SideButton
      icon={<Compass size={24} strokeWidth={2.25} />}
      label="Explorer"
      color="green"
      separated
    />
  );
}
