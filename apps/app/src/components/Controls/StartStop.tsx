import { useState, SetStateAction } from "react";
import styles from "./Controls.module.css";
import { objects } from "../../creator.js";

type props = {
  isStopped: boolean;
  setIsStopped: (isStopped: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
};

const simpleProps = {
  pos: { x: -1.0, y: 0.0 },
  r: 0.1,
  color: 0xff0000,
  mass: 1.0,
  restitution: 1.0,
  rigidBody: "dynamic",
  canSleep: false,
  ccd: true,
  v: { x: 0.0, y: 0.0 },
};

export default function StartStop({
  isStopped,
  setIsStopped,
  setIsPaused,
}: props) {
  const stop = () => {
    objects.stop();
    console.log("stop");
    setIsPaused(true);
  };

  const start = () => {
    objects.start();
    console.log("start");
  };

  const handleClick = () => {
    isStopped ? start() : stop();
    setIsStopped(!isStopped);

    // let ball = objects.createBall(simpleProps);
    // ball.put();
  };

  return (
    <div onClick={handleClick}>
      {isStopped && (
        <div className={`${styles.start} ${styles.button}`}>Start</div>
      )}
      {!isStopped && (
        <div className={`${styles.stop} ${styles.button}`}>Stop</div>
      )}
    </div>
  );
}
