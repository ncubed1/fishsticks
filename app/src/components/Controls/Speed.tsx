import styles from './Controls.module.css';
import { useRef, useEffect } from 'react';
import { objects } from '../../creator.js'

type props = {
  isStopped: boolean
  speed: number;
  speedStep: number;
  setSpeed: (speed: number) => void;
};

export default function Speed({ isStopped, speed, speedStep, setSpeed }: props) {
  let speedRef = useRef(null);

  const speedDown = () => {
    speedRef.current.stepDown();
    setSpeed(speedRef.current.value);
  }
  const speedUp = () => {
    speedRef.current.stepUp();
    setSpeed(speedRef.current.value);
  }

  useEffect(()=>{
    objects.setSpeed(speed);
  }, [speed])

  return (
    <>
      {!isStopped && <div className={`${styles.speed} ${styles.button}`}>
        <div
          onClick={speedDown}
          className={styles['speed-down']}
        >
          &lt;
        </div>
        <input
          ref={speedRef}
          className={styles['speed-input']}
          type='number'
          step={speedStep}
          defaultValue={speed}
          min='0' />
        <div
          onClick={speedUp}
          className={styles['speed-up']}
        >
          &gt;
        </div>
      </div>}
    </>
  );
}
