import { useEffect } from "react";
import styles from "./Controls.module.css";
import { objects } from "../../creator.js";
import PlaySVG from "./play-solid.svg?react";
import PauseSVG from "./pause-solid.svg?react";

type props = {
  isStopped: boolean;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
};

export default function PlayPause({ isStopped, isPaused, setIsPaused }: props) {

  const pause = () => {
    objects.pause();
    console.log("pause");
    setIsPaused(true);
  };

  const play = () => {
    objects.play();
    console.log("play");
  };

  const handleClick = () => {
    isPaused ? play() : pause();
    setIsPaused(!isPaused);
  };

  return (
    <>
      {!isStopped && (
        <div onClick={handleClick}>
          {isPaused && (
            <PlaySVG className={`${styles.play} ${styles.button}`} />
          )}
          {!isPaused && (
            <PauseSVG className={`${styles.pause} ${styles.button}`} />
          )}
        </div>
      )}
    </>
  );
}
