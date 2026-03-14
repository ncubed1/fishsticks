import type { ReactNode } from "react";
import styles from "./Sidebar.module.css";

type SideButtonProps = {
  icon: ReactNode;
  label: string;
  color: "yellow" | "green";
  separated?: boolean;
};

export default function SideButton({
  icon,
  label,
  color,
  separated = false,
}: SideButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${styles[color]} ${separated ? styles.separated : ""}`}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon}>{icon}</span>
    </button>
  );
}
