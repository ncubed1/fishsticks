import styles from "./Hotbar.module.css";
import { objects, listener, OI } from "../../creator.js";
import Item from "./Item";

const simplePropsB = {
  pos: { x: 0.0, y: 0.0 },
  r: 0.25,
  color: 0xffff00,
  mass: 1.0,
  restitution: 1.0,
  rigidBody: "dynamic",
  canSleep: false,
  ccd: true,
  v: { x: 0.0, y: 0.0 },
};

const simplePropsR = {
  pos: { x: 0.0, y: 0.0 },
  w: 0.5,
  h: 0.5,
  color: 0xffff00,
  mass: 1.0,
  restitution: 1.0,
  rigidBody: "dynamic",
  canSleep: false,
  ccd: true,
  v: { x: 0.0, y: 0.0 },
};


export default function Hotbar() {
  const ball = {
    iconType: "div",
    iconProps: { className: `${styles.circle}` },
    objectProps: simplePropsB,
    action: (position) => {
      OI.createBallFromGlobalPos({ ...simplePropsB, pos: position }).put();
    },
  };

  const square = {
    iconType: "div",
    iconProps: { className: `${styles.square}` },
    objectProps: simplePropsR,
    action: (position) => {
      OI.createRectFromGlobalPos({ ...simplePropsR, pos: position }).put();
    },
  };

  const polygon = {
    iconType: "div",
    iconProps: { className: `${styles.polygon}` },
    objectProps: simplePropsB,
    action: (position) => {
      OI.createBallFromGlobalPos({ ...simplePropsB, pos: position }).put();
    },
  };
  return (
    <div className={styles.hotbar}>
      {[ball, square, polygon].map((item, index) => {
        return (
          <Item
            key={index}
            iconType={item.iconType}
            iconProps={item.iconProps}
            objectProps={item.objectProps}
            action={item.action}
          />
        );
      })}
    </div>
  );
}
