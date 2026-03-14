import styles from "./Sidebar.module.css";
import UserSettingsButton from "./UserSettingsButton";
import SceneSettingsButton from "./SceneSettingsButton";
import GuideButton from "./GuideButton";
import ExplorerButton from "./ExplorerButton";

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <UserSettingsButton />
      <SceneSettingsButton />
      <GuideButton />
      <ExplorerButton />
    </div>
  );
}
