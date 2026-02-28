import styles from "./Sidebar.module.css"; 
import { useState, useRef, useEffect } from "react";
import Sidebutton from "./SideButton";

export default function Sidebar() {

  const [activeRef, setActiveRef] = useState(null);

  return (
    <>
      <div className={`${styles.sidebar}`}>
        <Sidebutton activeRef={activeRef} setActiveRef={setActiveRef}>Menu 1</Sidebutton>
        <Sidebutton activeRef={activeRef} setActiveRef={setActiveRef}>Menu 2</Sidebutton>
        <Sidebutton activeRef={activeRef} setActiveRef={setActiveRef}>Menu 3</Sidebutton>
        <Sidebutton activeRef={activeRef} setActiveRef={setActiveRef}>Menu 4</Sidebutton>
      </div>
    </>
  )
}