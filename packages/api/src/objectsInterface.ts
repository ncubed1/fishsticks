// simplifies various operations in objects.js

export default class ObjectsInterface {objects: any; canvas: any; s: any; cursor: any;
    constructor(objects, props) {
        this.objects = objects;
        this.canvas = objects.canvas;
        const { s = 100 } = props;
        this.s = s
        this.cursor;
    }

    pos2m(pos) {
        return {x: pos.x / this.s, y: - pos.y / this.s};
    }

    global2m(globalPos) {
        let pos = this.canvas.pixiCanvas.toLocal(globalPos);
        return this.pos2m(pos);
    }

    px2m(px) {
        return {x: px.x / this.s / this.canvas.pixiCanvas.scale.x, y: - px.y / this.s / this.canvas.pixiCanvas.scale.y};
    }

    m2pos(pos) {
        let x = pos.x * 100;
        let y = -pos.y * 100;
        return {x, y};
    }
// 100 * scale : (100 * scale + x)/ 100 * scale
// 100 : (100 * scale + x)/ 100 * scale


// 100 -> 200

// 100 * scale = 200

// scale:  1 : ?
// pixels: 100 : 100 + x


// 1 : 4
// 100 : 400

// 4 : 5
// 400 : 500

// 100/


// 100/(400 * 2) + 1


// 500/400

// 100/(200 * 1) + 1

// 1.5

// 1 + x/(100 * scale)

// 1 : 1 + x/200


// 2 3 : 2 * 3 + 1
    zoom(deltaDiff, pos, deltaPos, prevDiff) {
        // console.log(deltaDiff, pos)
        clearTimeout(this.cursor);
        let { x: factorX, y: factorY } = { x: (prevDiff+deltaDiff)/(prevDiff), y: (prevDiff+deltaDiff)/(prevDiff) }

        if (deltaDiff < 0) {
            this.objects.view.style.cursor = "zoom-in";
        } else {
            this.objects.view.style.cursor = "zoom-out";
        }
        this.cursor = setTimeout(() => {
            this.objects.view.style.cursor = "default";
        }, 300);
        // console.log(pos)
        this.objects.multiplyCanvasScale({mulX: factorX, mulY: factorY})

        // console.log(factorX)
        this.objects.moveCanvasBy({
            x: ((pos.x - this.canvas.pixiCanvas.x) * (1 - factorX) + deltaPos.x)/2,
            y: ((pos.y - this.canvas.pixiCanvas.y) * (1 - factorY) + deltaPos.y)/2,
        })
    }

    createBallFromGlobalPos(props) {
        const { pos = { x: 0, y: 0 } } = props;
        // props.v = { x: 5, y: 7 }
        props.pos = this.global2m(pos);
        return this.objects.createBall(props);
    }

    setPosFromGlobalPos(obj, globalPos) {
        let pos = this.global2m(globalPos);
        obj.setPosition(pos);
    }

    createRectFromGlobalPos(props) {
        const { pos = { x: 0, y: 0 } } = props;
        props.pos = this.global2m(pos);
        return this.objects.createRect(props);
    }


    getObjectFromGlobalPos(globalPos) {
        let pos = this.global2m(globalPos);
        return this.objects.getObjectFromPos(pos);
    }

    removeFromGlobalPos(globalPos) {
        let pos = this.global2m(globalPos);
        this.objects.removeFromPos(pos);
    }
}
