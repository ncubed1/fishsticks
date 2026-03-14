import { zoom, pan } from "./panZoom.js";
import * as PIXI from "pixi.js";

function mod(n, m) {
  return ((n % m) + m) % m;
}

/**
 * Returns the smallest "nice" step >= rawStep where the
 * most-significant digit is 1, 2, or 5 (Desmos-style).
 */
function niceStep(rawStep: number): number {
  if (rawStep <= 0) return 1;
  const exp = Math.floor(Math.log10(rawStep));
  const mag = Math.pow(10, exp);
  const f = rawStep / mag; // in [1, 10)
  const niceFraction = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return niceFraction * mag;
}

function clamp(value: number, min: number, max: number): number {
  if (max <= min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

class Canvas {
  backgroundColor: number | string;
  app: PIXI.Application;
  s: number;
  view: HTMLCanvasElement;
  grid: PIXI.Graphics;
  pixiCanvas: PIXI.Container;
  handleWindowResize: () => void;
  gridTextStyle: PIXI.TextStyle;
  gridXLabels: PIXI.Text[];
  gridYLabels: PIXI.Text[];
  gridOriginLabel: PIXI.Text | null;

  constructor(props) {
    const { s = 100, backgroundColor = 0x1099bb } = props;
    this.backgroundColor = backgroundColor;
    const app = new PIXI.Application();
    this.app = app;
    this.s = s;
    this.view = document.createElement("canvas");
    this.gridTextStyle = new PIXI.TextStyle({
      stroke: "ghostwhite",
      fontSize: 14,
    });
    this.gridXLabels = [];
    this.gridYLabels = [];
    this.gridOriginLabel = null;
    this.handleWindowResize = () => {
      requestAnimationFrame(() => {
        this.updateGrid();
      });
    };
  }

  async init() {
    await this.app.init({
      background: "#1099bb",
      resizeTo: window,
      antialias: true,
      view: this.view,
    });
    this.app.canvas.id = "pixi-canvas";
    this.app.renderer.background.color = this.backgroundColor;
    this.app.stage.sortableChildren = true;

    const canvas = new PIXI.Container();
    canvas.sortableChildren = true;
    canvas.width = 100; //
    canvas.height = 100;
    canvas.pivot.set(canvas.width / 2, canvas.height / 2);
    canvas.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 1.3,
    );

    const grid = new PIXI.Graphics();
    this.grid = grid;

    // canvas.addChild(grid);
    this.app.stage.addChild(grid);

    // const center = new PIXI.Graphics();
    // center.circle(0,0,5).fill(0x000000);
    // canvas.addChild(center);

    // pan(this.app, canvas, updateGrid);

    this.app.stage.addChild(canvas);

    this.pixiCanvas = canvas;
    window.addEventListener("resize", this.handleWindowResize);
    // zoom(this.app, canvas, 0.05, ()=>{});
    this.updateGrid();
  }

  trimGridLabels(labels: PIXI.Text[], keepCount: number) {
    const removedLabels = labels.splice(keepCount);

    if (removedLabels.length === 0) {
      return;
    }

    this.grid.removeChild(...removedLabels);
    removedLabels.forEach((label) => label.destroy());
  }

  getGridLabel(labels: PIXI.Text[], index: number, text: string) {
    let label = labels[index];

    if (!label) {
      label = new PIXI.Text({ text, style: this.gridTextStyle });
      labels[index] = label;
      this.grid.addChild(label);
    }

    label.text = text;
    label.visible = true;
    return label;
  }

  getOriginLabel() {
    if (!this.gridOriginLabel) {
      this.gridOriginLabel = new PIXI.Text({
        text: "0",
        style: this.gridTextStyle,
      });
      this.grid.addChild(this.gridOriginLabel);
    }

    return this.gridOriginLabel;
  }

  updateGrid() {
    const canvas = this.pixiCanvas;
    const app = this.app;
    const grid = this.grid;
    const lineWidth = 1;
    const screenWidth = app.screen.width;
    const screenHeight = app.screen.height;
    const axisXVisible = canvas.x >= 0 && canvas.x <= screenWidth;
    const axisYVisible = canvas.y >= 0 && canvas.y <= screenHeight;

    grid.clear();

    const pixelsPerUnit = this.s * canvas.scale.x;
    const rawMajorStep = this.s / pixelsPerUnit;
    const majorStep = niceStep(rawMajorStep);
    const majorStepPrecision = Math.max(0, -Math.floor(Math.log10(majorStep)));
    const lineSpacing = (majorStep / 5) * pixelsPerUnit;

    const numHorizontalLines = Math.ceil(screenHeight / lineSpacing) + 1;
    const initialY = mod(canvas.y, lineSpacing);
    const initialLineNumY = Math.floor(canvas.y / lineSpacing);

    const numVerticalLines = Math.ceil(screenWidth / lineSpacing) + 1;
    const initialX = mod(canvas.x, lineSpacing);
    const initialLineNumX = Math.floor(canvas.x / lineSpacing);

    let hasMinorLines = false;
    for (let i = 0; i < numVerticalLines; i++) {
      const lineNumX = initialLineNumX - i;
      const x = initialX + i * lineSpacing;

      if (lineNumX === 0 || mod(lineNumX, 5) === 0) {
        continue;
      }

      grid.moveTo(x, -screenHeight / 2 - lineSpacing);
      grid.lineTo(x, screenHeight + lineSpacing);
      hasMinorLines = true;
    }

    for (let i = 0; i < numHorizontalLines; i++) {
      const lineNumY = initialLineNumY - i;
      const y = initialY + i * lineSpacing;

      if (lineNumY === 0 || mod(lineNumY, 5) === 0) {
        continue;
      }

      grid.moveTo(-screenWidth / 2 - lineSpacing, y);
      grid.lineTo(screenWidth + lineSpacing, y);
      hasMinorLines = true;
    }

    if (hasMinorLines) {
      grid.stroke({ width: lineWidth, color: "lightgrey" });
    }

    let xLabelCount = 0;
    for (let i = 0; i < numVerticalLines; i++) {
      const lineNumX = initialLineNumX - i;
      const x = initialX + i * lineSpacing;

      if (lineNumX === 0 || mod(lineNumX, 5) !== 0) {
        continue;
      }

      const text = String(
        parseFloat((-(lineNumX / 5) * majorStep).toFixed(majorStepPrecision)),
      );
      const label = this.getGridLabel(this.gridXLabels, xLabelCount, text);
      label.x = x - label.width / 2;
      label.y = clamp(canvas.y, 0, screenHeight - label.height);
      xLabelCount += 1;

      grid.moveTo(x, -screenHeight / 2 - lineSpacing);
      grid.lineTo(x, screenHeight + lineSpacing);
    }

    this.trimGridLabels(this.gridXLabels, xLabelCount);

    let yLabelCount = 0;
    for (let i = 0; i < numHorizontalLines; i++) {
      const lineNumY = initialLineNumY - i;
      const y = initialY + i * lineSpacing;

      if (lineNumY === 0 || mod(lineNumY, 5) !== 0) {
        continue;
      }

      const text = String(
        parseFloat(((lineNumY / 5) * majorStep).toFixed(majorStepPrecision)),
      );
      const label = this.getGridLabel(this.gridYLabels, yLabelCount, text);
      label.x = clamp(canvas.x - label.width - 5, 0, screenWidth - label.width);
      label.y = y - label.height / 2;
      yLabelCount += 1;

      grid.moveTo(-screenWidth / 2 - lineSpacing, y);
      grid.lineTo(screenWidth + lineSpacing, y);
    }

    this.trimGridLabels(this.gridYLabels, yLabelCount);

    if (xLabelCount > 0 || yLabelCount > 0) {
      grid.stroke({ width: lineWidth, color: "grey" });
    }

    if (axisXVisible && axisYVisible) {
      const originLabel = this.getOriginLabel();
      originLabel.text = "0";
      originLabel.x = clamp(
        canvas.x - originLabel.width - 5,
        0,
        screenWidth - originLabel.width,
      );
      originLabel.y = clamp(canvas.y, 0, screenHeight - originLabel.height);
      originLabel.visible = true;
    } else if (this.gridOriginLabel) {
      this.gridOriginLabel.visible = false;
    }

    let hasAxisLines = false;

    if (axisXVisible) {
      grid.moveTo(canvas.x, -screenHeight / 2);
      grid.lineTo(canvas.x, screenHeight);
      hasAxisLines = true;
    }

    if (axisYVisible) {
      grid.moveTo(-screenWidth / 2, canvas.y);
      grid.lineTo(screenWidth, canvas.y);
      hasAxisLines = true;
    }

    if (hasAxisLines) {
      grid.stroke({ width: lineWidth, color: "black" });
    }
  }

  getCanvasPosition() {
    return {
      x: this.pixiCanvas.x,
      y: this.pixiCanvas.y,
    };
  }

  getCanvasScale() {
    return {
      x: this.pixiCanvas.scale.x,
      y: this.pixiCanvas.scale.y,
    };
  }

  moveCanvas({ x, y }) {
    this.pixiCanvas.x = x;
    this.pixiCanvas.y = y;
  }

  scaleCanvas({ x, y }) {
    this.pixiCanvas.scale.x = x;
    this.pixiCanvas.scale.y = y;
  }

  updateCanvas() {
    this.app.renderer.render(this.app.stage);
    this.updateGrid();
  }

  addTicker(tickerFunc) {
    this.app.ticker.add(tickerFunc);
  }

  removeTicker(tickerFunc) {
    this.app.ticker.remove(tickerFunc);
  }

  start() {
    // unused
    this.app.ticker.start();
  }

  stop() {
    // unused
    this.app.ticker.stop();
  }

  destroy() {
    window.removeEventListener("resize", this.handleWindowResize);
    this.app.destroy(true, { children: true });
  }

  global2pos(x, y) {
    return this.pixiCanvas.toLocal({ x, y });
  }

  put(obj) {
    this.pixiCanvas.addChild(obj);
  }

  remove(obj) {
    this.pixiCanvas.removeChild(obj);
  }

  drawPoint(pos, color = 0x000000) {
    const point = new PIXI.Graphics();
    point.beginFill(color);
    point.drawCircle(0, 0, 5);
    point.endFill();
    point.position = pos;
    this.put(point);
    return point;
  }

  removePoint(point) {
    this.remove(point);
  }
}

class ObjectGraphics {
  canvas: Canvas;
  pos: { x: number; y: number };
  color: number;
  v: { x: number; y: number };
  a: { x: number; y: number };
  borderLines: PIXI.Graphics;
  borderPoints: { [key: string]: PIXI.Graphics };
  border: PIXI.Container;
  object: PIXI.Container;
  pixiGraphics: PIXI.Graphics;

  constructor(canvas, props) {
    this.canvas = canvas;
    const {
      pos = { x: 0, y: 0 },
      color = 0xffffff,
      v = { x: 0, y: 0 },
      a = { x: 0, y: 0 },
    } = props;

    this.pos = { x: pos.x * canvas.s, y: -pos.y * canvas.s };
    this.color = color;
    this.v = v;
    this.a = a;
    const object = new PIXI.Container();
    object.position = this.pos;
    const pixiGraphics = new PIXI.Graphics();
    const border = new PIXI.Container();
    const borderLines = new PIXI.Graphics();
    const borderPoint1 = new PIXI.Graphics();
    const borderPoint2 = new PIXI.Graphics();
    const borderPoint3 = new PIXI.Graphics();
    const borderPoint4 = new PIXI.Graphics();
    const borderPoints = {
      bottomRight: borderPoint1,
      topRight: borderPoint2,
      bottomLeft: borderPoint3,
      topLeft: borderPoint4,
    };
    object.addChild(pixiGraphics);
    border.addChild(...Object.values(borderPoints));
    object.addChild(border);
    border.addChild(borderLines);

    this.borderLines = borderLines;
    this.borderPoints = borderPoints;
    this.border = border;
    this.object = object;
    this.pixiGraphics = pixiGraphics;
  }

  put() {
    this.canvas.put(this.object);
  }

  remove() {
    this.canvas.remove(this.object);
  }

  getPosition() {
    return this.object.position;
  }

  getRotation() {
    return this.object.rotation;
  }

  getColor() {
    return this.pixiGraphics.fillStyle.color;
  }

  setPosition(pos) {
    this.object.position = pos;
  }

  setRotation(angle) {
    this.object.rotation = -angle;
  }

  getBorderPoint(pos) {
    const scale = this.canvas.pixiCanvas.scale.x;
    for (let point in this.borderPoints) {
      let pointPosLocal = this.borderPoints[point].position;
      let pointPos = {
        x: pointPosLocal.x + this.object.x,
        y: pointPosLocal.y + this.object.y,
      };
      if (
        Math.sqrt(
          Math.pow(pos.x - pointPos.x, 2) + Math.pow(pos.y - pointPos.y, 2),
        ) <
        7 / scale
      )
        return point;
    }
    return null;
  }

  clearBorder() {
    this.borderLines.clear();
    Object.values(this.borderPoints).forEach((graphic) => graphic.clear());
  }
}

class BallG extends ObjectGraphics {
  r: number;

  constructor(canvas, props) {
    super(canvas, props);
    const { r = 0 } = props;

    this.r = r * canvas.s;

    this.draw(this.r, { color: this.color });
  }

  draw(r, style) {
    this.pixiGraphics.clear();
    this.pixiGraphics.circle(0, 0, r).fill(style);
  }

  drawBorder() {
    this.borderLines.clear();
    const r = this.getRadius();
    const scale = this.canvas.pixiCanvas.scale.x;
    // let r = 100;
    this.borderLines
      .moveTo(-r, -r - 1 / scale)
      .lineTo(-r, r)
      .lineTo(r, r)
      .lineTo(r, -r)
      .lineTo(-r, -r);

    this.borderLines.stroke({
      alignment: 0,
      width: 2 / scale,
      color: 0xff0000,
    });

    Object.values(this.borderPoints).forEach((graphic, i) => {
      graphic.clear();
      graphic.stroke({ alignment: 0, width: 1, color: 0xff0000 });
      graphic.circle(0, 0, 7 / scale).fill({ color: 0xff0000 });
      graphic.position.x = r * Math.pow(-1, i >> 1);
      graphic.position.y = r * Math.pow(-1, i);
    });
  }

  getRadius() {
    let r = this.pixiGraphics.width / 2;
    return r ? r : this.r;
  }

  setRadius(r) {
    this.pixiGraphics.width = r * 2;
    this.pixiGraphics.height = r * 2;
    // this.draw(r * s, {color: this.getColor()});
  }

  setColor(color) {
    this.draw(this.getRadius(), { color });
  }
}

class RectG extends ObjectGraphics {
  w: number;
  h: number;

  constructor(canvas, props) {
    super(canvas, props);
    const { w = 0, h = 0 } = props;
    this.w = w * canvas.s;
    this.h = h * canvas.s;
    this.draw(this.w, this.h, { color: this.color });
  }

  draw(w, h, style) {
    this.pixiGraphics.clear();
    this.pixiGraphics.rect(-w / 2, -h / 2, w, h).fill(style);
    console.log("wh", h, this.pixiGraphics.width, this.pixiGraphics.height);
  }

  drawBorder() {
    this.borderLines.clear();
    const w = this.getWidth() / 2;
    const h = this.getHeight() / 2;
    const scale = this.canvas.pixiCanvas.scale.x;
    // let r = 100;
    this.borderLines
      .moveTo(-w, -h - 1 / scale)
      .lineTo(-w, h)
      .lineTo(w, h)
      .lineTo(w, -h)
      .lineTo(-w, -h);

    this.borderLines.stroke({
      alignment: 0,
      width: 2 / scale,
      color: 0xff0000,
    });

    Object.values(this.borderPoints).forEach((graphic, i) => {
      graphic.clear();
      graphic.stroke({ alignment: 0, width: 1, color: 0xff0000 });
      graphic.circle(0, 0, 7 / scale).fill({ color: 0xff0000 });
      graphic.position.x = w * Math.pow(-1, i >> 1);
      graphic.position.y = h * Math.pow(-1, i);
    });
  }

  getWidth() {
    let w = this.pixiGraphics.width;
    return w ? w : this.w;
    // return this.pixiGraphics.width
  }

  getHeight() {
    let h = this.pixiGraphics.height;
    return h ? h : this.h;
    // return this.pixiGraphics.height
  }

  setWidth(w) {
    // this.draw(w * s, this.getHeight(), {color: this.getColor()});
    this.pixiGraphics.width = w;
  }

  setHeight(h) {
    this.pixiGraphics.height = h;
    // this.draw(this.getWidth(), h * s, {color: this.getColor()});
  }

  setColor(color) {
    this.draw(this.getWidth(), this.getHeight(), { color });
  }
}

export { Canvas, BallG, RectG };
