import styles from "./Controls.module.css";
import { Circle, CircleSmall, Plus, Minus } from "lucide-react";

type props = {
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
};

export default function StartStop({ isMinimized, setIsMinimized }: props) {
  const handleClick = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <button
      onClick={handleClick}
      className={`${styles.primaryButton} ${isMinimized ? styles.start : styles.stop}`}
      aria-label={isMinimized ? "Maximize controls" : "Minimize controls"}
      title={isMinimized ? "Maximize controls" : "Minimize controls"}
    >
      <div
        className={`${styles.primaryIcon} ${isMinimized ? styles.minimised : styles.maximised}`}
      >
        {/* <Circle size={24} /> */}
        {isMinimized ? <Circle size={24} /> : <CircleSmall size={40} />}
        {/* {isMinimized ? <Plus size={24} /> : <Minus size={24} />} */}
      </div>
    </button>
  );
}
