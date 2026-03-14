import PlayPause from "./PlayPause";
import StartStop from "./StartStop";
import Speed from "./Speed";
import styles from "./Controls.module.css";
import { useEffect, useState } from "react";
import { objects, waitForCreatorReady } from "../../creator.js";
import { Undo2, Redo2 } from "lucide-react";

type ControlsProps = {
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
};

export default function Controls({
  isMinimized,
  setIsMinimized,
}: ControlsProps) {
  const [isPaused, setIsPaused] = useState(true);
  const [speed, setSpeed] = useState(1);

  const speedStep = 0.5;

  useEffect(() => {
    let isMounted = true;

    const stopSimulation = () => {
      if (!objects) {
        return;
      }

      objects.stop();
      objects.pause();
      // objects.timeline.hide();
      if (isMounted) {
        setIsPaused(true);
      }
    };

    const startSimulation = () => {
      if (!objects) {
        return;
      }

      objects.start();
      // objects.timeline.show();
      // objects.play();
      // if (isMounted) {
      //   setIsPaused(false);
      // }
    };

    const syncSimulationToWindowFocus = () => {
      if (document.hidden || !document.hasFocus()) {
        stopSimulation();
        return;
      }

      startSimulation();
    };

    const bootstrapControls = async () => {
      await waitForCreatorReady();
      if (!isMounted) {
        return;
      }

      syncSimulationToWindowFocus();
    };

    // window.addEventListener("focus", syncSimulationToWindowFocus);
    // window.addEventListener("blur", syncSimulationToWindowFocus);
    document.addEventListener("visibilitychange", syncSimulationToWindowFocus);
    bootstrapControls();

    return () => {
      isMounted = false;
      // window.removeEventListener("focus", syncSimulationToWindowFocus);
      // window.removeEventListener("blur", syncSimulationToWindowFocus);
      document.removeEventListener(
        "visibilitychange",
        syncSimulationToWindowFocus,
      );
      objects?.stop();
    };
  }, []);

  useEffect(() => {
    if (!objects) {
      return;
    }

    if (isMinimized) {
      objects.timeline?.hide();
      return;
    }

    objects.timeline?.show();
  }, [isMinimized]);

  return (
    <>
      <div className={styles.controlsLeft}>
        <div
          className={`${styles.controls} ${isMinimized ? styles.controlsStopped : ""}`}
        >
          <StartStop
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
          />

          <div
            className={`${styles.controlsContent} ${isMinimized ? styles.controlsContentHidden : styles.controlsContentVisible}`}
            aria-hidden={isMinimized}
          >
            <PlayPause isPaused={isPaused} setIsPaused={setIsPaused} />
            <div className={styles.controlsGroup}>
              {/* <div className={styles.divider}></div> */}
              <Speed speed={speed} speedStep={speedStep} setSpeed={setSpeed} />
            </div>

            <div className={styles.controlsGroup}>
              <button
                className={styles.button}
                aria-label="Undo"
                title="Undo"
                // disabled
              >
                <Undo2 size={18} />
              </button>
              <button
                className={styles.button}
                aria-label="Redo"
                title="Redo"
                // disabled
              >
                <Redo2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* {!isMinimized && (
        <div className={styles.timelineBottom}>
          <div className={styles.timelineSteps}>
            <Step isStopped={false} direction="backward" />
            <Step isStopped={false} direction="forward" />
          </div>
        </div>
      )} */}
    </>
  );
}
