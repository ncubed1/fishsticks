import { zoom, pan } from './panZoom.js';

const s = 100;

function m2pos(pos) {
    let x = pos.x * s;
    let y = -pos.y * s;
    return {x, y};
}

class Canvas {
    constructor(props) {
        const { backgroundColor = 0x1099bb } = props;
        const app = new PIXI.Application({
            background: '#1099bb',
            resizeTo: window,
            antialias: true,
        });
        app.view.id = 'pixi-canvas';
        app.renderer.background.color = backgroundColor;

        const canvas = new PIXI.Container();
        canvas.sortableChildren = true;
        canvas.width = 100; //
        canvas.height = 100;
        canvas.pivot.set(canvas.width / 2, canvas.height / 2);
        canvas.position.set(app.screen.width / 2, app.screen.height / 1.1);

        const center = new PIXI.Graphics();
        center.beginFill(0x000000);
        center.drawCircle(0, 0, 5);
        center.endFill();
        canvas.addChild(center);

        zoom(app, canvas, 0.1);
        pan(app, canvas);

        app.stage.addChild(canvas);

        this.app = app;
        this.pixiCanvas = canvas;
    }

    addTicker(tickerFunc) {
        this.app.ticker.add(tickerFunc);
    }

    removeTicker(tickerFunc) {
        this.app.ticker.remove(tickerFunc);
    }


    start() { // unused
        this.app.ticker.start()
    }

    stop() { // unused
        this.app.ticker.stop()
    }

    global2pos(x, y) {
        return this.pixiCanvas.toLocal({x, y});
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
        point.position = m2pos(pos);
        this.put(point);
        return point;
    }

    removePoint(point) {
        this.remove(point);
    }
}

class ObjectGraphics {
    constructor(canvas, props) {

        this.canvas = canvas;
        const {
            pos = { x: 0, y: 0 },
            color = 0xffffff,
            v = { x: 0, y: 0 },
            a = { x: 0, y: 0 }
        } = props;

        this.pos = pos;
        this.color = color;
        this.v = v;
        this.a = a;
    }

    put() {
        this.canvas.put(this.object);
    }

    remove() {
        this.canvas.remove(this.object);
    }

    position(pos) {
        const position = m2pos(pos);
        this.object.position = position;
    }

    rotation(angle) {
        this.object.rotation = -angle;
    }
}

class BallG extends ObjectGraphics {
    constructor(canvas, props) {
        super(canvas, props);
        const { r = 0 } = props;
        this.r = r * s;
        const _pos = this.pos;
        const pos = m2pos(_pos);

        const object = new PIXI.Container()
        object.position = pos;
        const circle = new PIXI.Graphics();
        circle.beginFill(this.color);
        circle.drawCircle(0, 0, this.r);
        circle.endFill();
        object.addChild(circle);

        this.object = object;
        this.pixiGraphics = circle;
    }
}

class RectG extends ObjectGraphics {
    constructor(canvas, props) {
        super(canvas, props);
        const { w = 0, h = 0 } = props;
        this.w = w * s;
        this.h = h * s;
        const _pos = this.pos;
        const pos = m2pos(_pos);

        const object = new PIXI.Container()
        object.position = pos;
        const rect = new PIXI.Graphics();
        rect.beginFill(this.color);
        rect.drawRect(-this.w/2, -this.h/2, this.w, this.h);
        rect.endFill();
        object.addChild(rect);

        this.object = object;
        this.pixiGraphics = rect;
    }
}


export { Canvas, BallG, RectG };
