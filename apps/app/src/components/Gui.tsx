import styles from "./Gui.module.css";
// import useScript from '../hooks/useScript.js';
import { useRef, useEffect, useState } from "react";
import { init, listener, objects, OI } from "../creator.js";
import Controls from "./Controls/Controls";
import { createPortal } from "react-dom";
import Hotbar from "./Hotbar/Hotbar";
import Sidebar from "./Sidebar/Sidebar";
import AttributesMenu from "./AttributesMenu/AttributesMenu";

const gui = document.createElement("div");
gui.tabIndex=0
gui.className = styles.gui;
init(gui);

export default function Gui() {
  let guiContainer = useRef(null);
  let object = useRef(null);
  let selectedObjects = useRef([]);
  let border = useRef(null);

  // function getObject(clientPosition) {
  //   if (!object.current)
  //   return object.current;
  // }

  function getObject({clientPosition}) {
    object.current = OI.getObjectFromGlobalPos(clientPosition);
    for (let i = 0; i < selectedObjects.current.length; i++) {
      let pos = OI.global2m(clientPosition);
      let borderPoint = selectedObjects.current[i].getBorderPoint(pos);
      if (borderPoint) {
        border.current = borderPoint
        return true
      }
    }
  }

  function moveChecker() {
    return !!object.current;
  }

  function moveGrab() {
      console.log('b')
    if (!selectedObjects.current.includes(object.current)) {
      console.log('a')
      selectedObjects.current.push(object.current);
      object.current.select();
    }
  }

  function moveDrag({deltaClientPosition}) {
    selectedObjects.current.forEach((object)=> {
      let positionM = OI.px2m(deltaClientPosition);
      let pos = {
        x: object.getPosition().x + positionM.x,
        y: object.getPosition().y + positionM.y,
      };
      object.setPosition(pos);
    })
  }

  function moveDrop() {
    object.current = null
    objects.updateColliders();
  }

  function resizeChecker() {
    return !!border.current
  }

  function resizeGrab() {

  }

  function resizeDrag({deltaClientPosition}) {
    selectedObjects.current.forEach((object)=>{
      object.scale(border.current, OI.px2m(deltaClientPosition))
    })
    objects.updateColliders();
  }

  function resizeDrop() {
    border.current = null
  }

  function panChecker() {
    return !object.current && !border.current;
  }

  function panGrab() {
    objects.view.style.cursor = "grabbing";
  }

  function panDrag({deltaClientPosition}) {
    objects.moveCanvasBy(deltaClientPosition)
  }

  function panDrop() {
    objects.view.style.cursor = "default";
  }

  function zoom({pos1, pos2, deltaDiff, pos, deltaPos, prevDiff}) {
    // const {x: dx, y: dy} = deltaDiffPos;
    // console.log(OI.global2m(OI.m2pos(pos1)), OI.global2m(OI.m2pos(pos2)))
    OI.zoom(deltaDiff, pos, deltaPos, prevDiff);
  }

  const [attributesMenu, setAttributesMenu] = useState(null);

  useEffect(() => {
    listener.addZoomAction(objects.view, ()=>true, zoom);
    listener.addLmbDownAction(objects.view, ()=>true, getObject);
    listener.addDragAction(objects.view, moveChecker, moveGrab, moveDrag, moveDrop);
    listener.addDragAction(objects.view, panChecker, panGrab, panDrag, panDrop);
    listener.addDragAction(objects.view, resizeChecker, resizeGrab, resizeDrag, resizeDrop);
    guiContainer.current.appendChild(gui);

    listener.addRmbAction(
      objects.view,
      ()=>true,
      ({clientPosition}) => {
        let object = OI.getObjectFromGlobalPos(clientPosition);
        if (object) {
          setAttributesMenu(<AttributesMenu position={clientPosition} objectProp={object} />)
        }
      }
    );

    listener.addLmbAction(
      objects.view,
      ()=>true,
      ()=>{
        setAttributesMenu(null);
        if (object.current) {
          let index = selectedObjects.current.indexOf(object.current);
          if (index === -1) {
            selectedObjects.current.push(object.current);
            object.current.select();
          } else {
            selectedObjects.current.splice(index, 1);
            object.current.deselect();
          }
        } else if (!border.current) {
          selectedObjects.current.forEach((object)=>object.deselect());
          selectedObjects.current = [];
        }
      }
    );

    listener.addDeleteAction(
      objects.view,
      ()=>{
        return selectedObjects.current.length != 0
      },
      ()=>{
        selectedObjects.current.forEach((object, i)=>{
          object.remove();
        });
        selectedObjects.current = [];
      }
    )
  }, []);

  return (
    <div ref={guiContainer}>
      {createPortal([
        <Controls />,
        <Sidebar />,
        <Hotbar />
        ], gui)}
      {attributesMenu && createPortal(attributesMenu, gui)}
    </div>
  );
}
