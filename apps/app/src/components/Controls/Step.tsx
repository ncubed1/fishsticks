import styles from './Controls.module.css';
import { objects } from '../../creator.js';

type props = {
  isStopped: boolean;
}

export default function Step({isStopped}: props) {
  const stepBack = () => {
    console.log('stepBack not implemented');
  }

  const stepForward = () => {
    console.log('stepForward');
    objects.step()
  }

  return (
    <>
      {!isStopped && <div className={`${styles.step} ${styles.button}`}>
        <div
          onClick={stepBack}
          className={styles['speed-down']}
        >
          &lt;
        </div>
        Step
        <div
          onClick={stepForward}
          className={styles['speed-up']}
        >
          &gt;
        </div>
      </div>}
    </>
  );
}
