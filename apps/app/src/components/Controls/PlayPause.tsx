import styles from "./Controls.module.css";
import { objects } from "../../creator.js";
import { Play, Pause } from "lucide-react";

type props = {
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
};

export default function PlayPause({ isPaused, setIsPaused }: props) {
  const pause = () => {
    if (!objects) {
      return;
    }

    objects.pause();
    setIsPaused(true);
  };

  const play = () => {
    if (!objects) {
      return;
    }

    objects.play();
  };

  const handleClick = () => {
    isPaused ? play() : pause();
    setIsPaused(!isPaused);
  };

  return (
    <button
      onClick={handleClick}
      className={`${styles.button} ${isPaused ? styles.play : styles.pause}`}
      aria-label={isPaused ? "Play" : "Pause"}
      title={isPaused ? "Play" : "Pause"}
    >
      {isPaused ? (
        <Play size={18} fill="currentColor" />
      ) : (
        <Pause size={18} fill="currentColor" />
      )}
    </button>
  );
}
