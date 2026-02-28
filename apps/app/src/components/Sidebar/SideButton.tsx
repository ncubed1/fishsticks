import styles from "./Sidebar.module.css"; 
import { useState} from "react";


export default function Sidebutton({ children, activeRef, setActiveRef}) {

  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (event) => {
    if (event.target !== event.currentTarget) return;
    if (activeRef && activeRef.element !== event.currentTarget) {
      activeRef.setIsClicked(false);
    }
    setIsClicked(!isClicked);
    setActiveRef({setIsClicked, element: event.currentTarget});
  }

  return (
    <>
      <div className={styles['button-container']}> 
        <div onClick={handleClick} className={`${isClicked ? styles.click: ""} ${styles.button}`}>{children}</div>
        {isClicked && <div className={styles.popup}>
          <div className={styles['popup-buttons']}>aa</div>
          <div className={styles['popup-buttons']}>bb</div>
          <div className={styles['popup-buttons']}>cc</div>
          <div className={styles['popup-buttons']}>dd</div>
          <div className={styles['popup-buttons']}>ee</div>
        </div>}
      </div>
    </>
  )
}