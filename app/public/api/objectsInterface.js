// simplifies various operations in objects.js

class ObjectsInterface {
    constructor(objects, props) {
        this.objects = objects;
        this.canvas = objects.canvas;
        const { s = 100 } = props;
        this.s = s
    }

    pos2m(pos) {
        return {x: pos.x / this.s, y: - pos.y / this.s};
    }

    global2m(globalPos) {
        let pos = this.canvas.pixiCanvas.toLocal(globalPos);
        return this.pos2m(pos);
    }

    createBallFromGlobalPos(props) {
        const { pos = { x: 0, y: 0 } } = props;
        props.v = { x: 5, y: 7 }
        props.pos = this.global2m(pos);
        return this.objects.createBall(props);
    }

    createRectFromGlobalPos(props) {
        const { pos = { x: 0, y: 0 } } = props;
        props.pos = this.global2m(pos);
        return this.objects.createRect(props);
    }

    removeFromGlobalPos(globalPos) {
        let pos = this.global2m(globalPos);
        this.objects.removeFromPos(pos);
    }
}

export default ObjectsInterface;
