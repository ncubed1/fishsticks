import { useRef, useEffect, useState } from 'react';
import styles from './AttributesMenu.module.css';

type props = {
  position: { x: number, y: number };
  objectProp: any;
}

export default function AttributesMenu({ position, objectProp }: props) {
  let objectProps = useRef(objectProp.props);
  let [object, setObject] = useState(objectProp)
  const [id, setId] = useState('');
  const [expr, setExpr] = useState('');

  useEffect(() => {
    objectProps.current = object.props;
    setObject(objectProp);
  }, [objectProp]);

  return (
    <div style={{ position: "absolute", left: position.x, top: position.y }} className={styles.menu}>
    <table style={{ width: "100%" }}>
      <tbody>
        <tr>
          <td>Position</td>
          <td>
            <span>x: </span><input onChange={ (e)=>object.setPosition({ x: Number(e.target.value), y: object.getPosition().y }) } type="number" defaultValue={(object.getPosition().x).toPrecision(3)} />
            <span> y: </span><input onChange={ (e)=>object.setPosition({ x: object.getPosition().x, y: Number(e.target.value) }) } type="number" defaultValue={(object.getPosition().y).toPrecision(3)} />
          </td>
        </tr>
        {objectProps.current.r && <tr>
          <td>Radius</td>
          <td><input width={"5em"} onChange={ (e)=>object.setRadius(Number(e.target.value)) } type="number" defaultValue={object.getRadius()} /></td>
        </tr>}
        {objectProps.current.w && objectProps.current.h && <tr>
          <td>Width</td>
          <td><input width={"5em"} onChange={ (e)=>object.setWidth( Number(e.target.value)) } type="number" defaultValue={object.getWidth()} /></td>
        </tr>}
        {objectProps.current.w && objectProps.current.h && <tr>
          <td>Height</td>
          <td><input width={"5em"} onChange={ (e)=>object.setHeight(Number(e.target.value)) } type="number" defaultValue={object.getHeight()} /></td>
        </tr>}
        {<tr>
          <td>Color</td>
          <td><input width={"6em"} onChange={ (e) => {object.setColor(e.target.value)} } type="color" defaultValue={`#${object.getColor().toString(16)}`} /></td>
        </tr>}
        {<tr>
          <td>Mass</td>
          <td><input width={"5em"} onChange={ (e) => object.setMass(Number(e.target.value)) } type="number" defaultValue={object.getMass()} /></td>
        </tr>}
        {<tr>
          <td>Restitution</td>
          <td><input width={"5em"} onChange={ (e) => object.setRestitution(Number(e.target.value)) } type="number" min={0} max={1} defaultValue={object.getRestitution()} /></td>
        </tr>}
        {<tr>
          <td>Rigid body type</td>
          <td>
            <select onChange={(e) =>{object.setRigidBodyType(e.target.value)}} defaultValue={object.getRigidBodyType()}>
              <option value="fixed">Fixed</option>
              <option value="dynamic">Dynamic</option>
            </select>
          </td>
        </tr>}
        {<tr>
          <td>Sleep</td>
          <td>
            <input type="checkbox" checked={object.isSleeping()} onChange={(e)=>{object.setSleeping(e.target.checked)}}></input>
            <span></span>
          </td>
          {/* <td><input type="text" defaultValue={objectProps.current.canSleep} /></td> */}
        </tr>}
        {<tr>
          <td>CCD</td>
          <td>
            <input type="checkbox" checked={object.getCCD()} onChange={(e)=>{object.setCCD(e.target.checked)}}></input>
            <span></span>
          </td>
        </tr>}
        {<tr>
          <td>Linear Velocity</td>
          <td>
            <span>x: </span><input onChange={ (e)=>object.setLinvel({ x: Number(e.target.value), y: object.getLinvel().y }) } type="text" defaultValue={(object.getLinvel().x).toPrecision(3)} />
            <span> y: </span><input onChange={ (e)=>object.setLinvel({ x: object.getLinvel().x, y: Number(e.target.value) }) } type="text" defaultValue={(object.getLinvel().y).toPrecision(3)} />
          </td>
        </tr>}
        <tr>
          <td colSpan={2}><hr /></td>
        </tr>
        <tr>
          <td>Add vector</td>
          <td>
            <input type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
            <input type="text" placeholder="Expression" value={expr} onChange={(e) => setExpr(e.target.value)} />
            <button onClick={() => object.addVector(id, { expr, showMag: true, showId: true })}>+</button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
  );
}