import styles from "./Controls.module.css";
import { useRef, useEffect } from "react";
import { objects } from "../../creator.js";
import { Plus, Minus } from "lucide-react";

type props = {
  speed: number;
  speedStep: number;
  setSpeed: (speed: number) => void;
};

export default function Speed({ speed, speedStep, setSpeed }: props) {
  let speedRef = useRef<HTMLInputElement>(null);

  const speedDown = () => {
    if (speedRef.current) {
      speedRef.current.stepDown();
      setSpeed(Number(speedRef.current.value));
    }
  };
  const speedUp = () => {
    if (speedRef.current) {
      speedRef.current.stepUp();
      setSpeed(Number(speedRef.current.value));
    }
  };

  useEffect(() => {
    objects?.setSpeed(speed);
  }, [speed]);

  return (
    <div
      className={styles.speed}
      aria-label="Playback Speed"
      title="Playback Speed"
    >
      <button
        onClick={speedDown}
        className={styles.button}
        aria-label="Decrease playback speed"
        title="Decrease playback speed"
      >
        <Minus size={18} />
      </button>
      <input
        ref={speedRef}
        className={styles["speed-input"]}
        type="number"
        step={speedStep}
        value={speed}
        min="0"
        aria-label="Playback speed"
        title="Playback speed"
        onChange={(e) => setSpeed(Number(e.target.value))}
      />
      <button
        onClick={speedUp}
        className={styles.button}
        aria-label="Increase playback speed"
        title="Increase playback speed"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
