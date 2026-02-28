import { useEffect } from "react";
import styles from "./Controls.module.css";
import { objects } from "../../creator.js";
import {ReactComponent as PlaySVG} from "./play-solid.svg";
import {ReactComponent as PauseSVG}from "./pause-solid.svg";

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
            <PlaySVG className={`${styles.play} ${styles.button}`} alt="play" />
          )}
          {!isPaused && (
            <PauseSVG className={`${styles.pause} ${styles.button}`} alt="pause" />
          )}
        </div>
      )}
    </>
  );
}
