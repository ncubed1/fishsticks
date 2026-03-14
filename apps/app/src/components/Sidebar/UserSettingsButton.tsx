import { UserRound } from "lucide-react";
import SideButton from "./SideButton";

export default function UserSettingsButton() {
  return (
    <SideButton
      icon={<UserRound size={24} strokeWidth={2.25} />}
      label="User Settings"
      color="yellow"
    />
  );
}
