import styles from "./Hotbar.module.css";
import { useEffect, useRef, useState, createElement } from "react";
import { listener, objects, waitForCreatorReady } from "../../creator.js";

type props = {
  iconType: string;
  iconProps: { [key: string]: any };
  objectProps: { [key: string]: any };
  action: Function;
};

export default function Item({
  iconType,
  iconProps,
  objectProps,
  action,
}: props) {
  let initialPosition = useRef({ x: 0, y: 0 });
  let initialOffsetPosition = useRef({ x: 0, y: 0 });
  let [position, setPosition] = useState({ x: 0, y: 0 });
  let style = { left: position.x, top: position.y };
  let iconPropsNew = { ...iconProps, style };

  let iconRef = useRef(null);
  let icon = createElement(iconType, { ref: iconRef, ...iconPropsNew });

  function grab({ clientPosition, offsetPosition }) {
    if (!iconRef.current) {
      return;
    }

    iconRef.current.style.cursor = "grabbing";
    initialPosition.current = clientPosition;
    initialOffsetPosition.current = offsetPosition;
  }

  function drag({ clientPosition }) {
    let dx = clientPosition.x - initialPosition.current.x;
    let dy = clientPosition.y - initialPosition.current.y;
    setPosition({ x: dx, y: dy });
  }

  function drop({ clientPosition }) {
    if (!iconRef.current) {
      return;
    }

    let pos = { x: 0.0, y: 0.0 };
    pos.x =
      clientPosition.x -
      initialOffsetPosition.current.x +
      iconRef.current.offsetWidth / 2;
    pos.y =
      clientPosition.y -
      initialOffsetPosition.current.y +
      iconRef.current.offsetHeight / 2;
    action(pos);
    setPosition({ x: 0, y: 0 });
    iconRef.current.style.cursor = "default";
    objects?.updateColliders();
  }

  useEffect(() => {
    let isMounted = true;

    const registerDragAction = async () => {
      await waitForCreatorReady();
      if (!isMounted || !listener || !iconRef.current) {
        return;
      }

      listener.addDragAction(
        iconRef.current,
        () => {
          return true;
        },
        grab,
        drag,
        drop,
      );
    };

    registerDragAction();

    return () => {
      isMounted = false;
    };
  }, []);

  return icon;
}
