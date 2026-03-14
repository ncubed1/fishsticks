import styles from "./Controls.module.css";
import { objects } from "../../creator.js";
import { StepForward, StepBack } from "lucide-react";

type props = {
  isStopped: boolean;
  direction?: "forward" | "backward";
};

export default function Step({ isStopped, direction = "forward" }: props) {
  const stepBack = () => {};

  const stepForward = () => {
    objects?.step();
  };

  if (isStopped) return null;

  if (direction === "backward") {
    return (
      <button
        onClick={stepBack}
        className={styles.button}
        aria-label="Step Backward"
        title="Step Backward"
        disabled
      >
        <StepBack size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={stepForward}
      className={styles.button}
      aria-label="Step Forward"
      title="Step Forward"
    >
      <StepForward size={18} />
    </button>
  );
}
