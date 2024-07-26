class Vectors {
    constructor(object, simulation, canvas) {
        this.object = object;
        this.physicsObj = object.physicsObj;
        this.graphicsObj = object.graphicsObj;
        this.simulation = simulation;
        this.canvas = canvas;
        this.vectors = [];
        this.s = 100;
        this.relativeS = 1;
    }

    createVector(id, props) {
        let vector = new Vector(id, this, props);
        return vector;
    }

    putVector(vector) {
        this.vectors.push(vector)
        this.canvas.put(vector.pixiGraphics);
    }

    removeAllVectors() {
        this.vectors.forEach(v => this.removeVector(v));
    }

    removeVector(vector) {
        this.vectors =  this.vectors.filter(v => v !== vector);
        this.canvas.remove(vector.pixiGraphics);
    }

    removeVectorsFromId(id) {
        let vectorsToRemove = this.vectors.filter(v => v.id === id);
        vectorsToRemove.forEach(vector => this.removeVector(vector));
    }

    updateVectors() {
        this.vectors.forEach(v => this.updateVector(v, this.simulation.simulationTime));
    }

    updateVector(vector) {
        let simTime = this.simulation.simulationTime;
        if (vector.expr === "") {
            return;
        }

        let scalarVars = {
            m: this.physicsObj.getMass(),
        }
        let varsX = {
            v: this.physicsObj.linvel().x,
            a: simTime - vector.prevTime === 0 ? 0 : (this.physicsObj.linvel().x - vector.prevV.x) / (simTime - vector.prevTime)
        }
        let varsY = {
            v: this.physicsObj.linvel().y,
            a: simTime - vector.prevTime === 0 ? 0 : (this.physicsObj.linvel().y - vector.prevV.y) / (simTime - vector.prevTime)
        }
        varsX = {...varsX, ...scalarVars};
        varsY = {...varsY, ...scalarVars};

        vector.prevV = { x: varsX.v, y: varsY.v};
        vector.prevTime = simTime;

        let resultX = vector.expr.evaluate(varsX);
        let resultY = vector.expr.evaluate(varsY);
        let result = {x: resultX, y: resultY};
        vector.mag(result);
        vector.angle(result);
        vector.pos({ x: this.physicsObj.translation().x, y: this.physicsObj.translation().y });
    }

    updateVectorScale(vector) {
        let canvasScaleX = this.canvas.pixiCanvas.scale.x;
        let canvasScaleY = this.canvas.pixiCanvas.scale.y;
        let textScaleX = 0.6/canvasScaleX;
        let textScaleY = 0.6/canvasScaleY;
        // textScaleX = Math.min(textScaleX, 0.25);
        // textScaleY = Math.min(textScaleY, 0.25);
        vector.pixiGraphics.scale = {x: textScaleX, y: textScaleY};
    }

    updateVectorsScale() {
        this.vectors.forEach(v => this.updateVectorScale(v));
    }

    changeRelativeScale(factor) {
        if (factor > 0) {
            this.relativeS *= factor;
        }
    }

    updateVectorRelativeScale(vector) {
        vector.shaft.width *= this.relativeS / vector.relativeS;
        vector.head.position.x *= this.relativeS / vector.relativeS;
        vector.text.position.x = (vector.text.position.x - 25) * this.relativeS / vector.relativeS + 25;
        vector.relativeS = this.relativeS;
    }

    updateVectorsRelativeScale() {
        this.vectors.forEach(v => this.updateVectorRelativeScale(v));
    }

    m2pos(pos) {
        let x = pos.x * this.s;
        let y = -pos.y * this.s;
        return {x, y};
    }

}

class Vector {
    constructor(id, vectors, props) {
        const {
            expr = "",
            color = 0xffffff,
            showId = false,
            showMag = false
        } = props;

        this.id = id;
        this.showId = showId;
        this.showMag = showMag;
        this.expr = math.compile(expr);

        this.vecsPut = vectors.putVector.bind(vectors);
        this.vecsRemove = vectors.removeVector.bind(vectors);
        this.vecsUpdate = vectors.updateVector.bind(vectors)
        this.vecsUpdateScale = vectors.updateVectorScale.bind(vectors)
        this.m2pos = vectors.m2pos.bind(vectors);

        this.relativeS = vectors.relativeS;
        this.s = vectors.s;

        const vectShaft = new PIXI.Graphics();
        const vectHead = new PIXI.Graphics();
        vectShaft.beginFill(color);
        vectShaft.drawRect(0, -8/2, 1, 8);
        vectShaft.endFill();

        vectHead.beginFill(color);
        vectHead.moveTo(0, -12);
        vectHead.lineTo(0, 12);
        vectHead.lineTo(12, 0);
        vectHead.endFill();
        vectHead.position = {x: 1, y: 0};

        const vect = new PIXI.Container();
        vect.zIndex = 5;
        vect.sortableChildren = true
        vect.addChild(vectHead);
        vect.addChild(vectShaft);
        vectHead.zIndex =11;
        vectShaft.zIndex =11;
        this.head = vectHead;
        this.shaft = vectShaft;
        this.pixiGraphics = vect;
        this.pixiGraphics.scale = {x: 0.1, y: 0.1};

        const vectText = new PIXI.Text('e', {fontFamily : 'Arial', fontSize: 28, fill: "black", align : 'left'});
        vectText.anchor = {x: 0.08, y: 0.5};
        vectText.resolution = 2;
        vect.addChild(vectText);
        vectText.zIndex = 15;
        this.text = vectText;

        this.prevV = { x: vectors.physicsObj.linvel().x, y: vectors.physicsObj.linvel().y };
        this.prevTime = vectors.simulation.simulationTime;
        this.update()
        this.updateScale()
    }

    pos(pos) {
        let position = this.m2pos(pos);
        this.pixiGraphics.position = position
    }

    mag(vec) {
        let mag = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        if (mag === 0) {
            this.pixiGraphics.visible = false;
            return;
        } else {
            this.pixiGraphics.visible = true;
        }
        let newMag = mag * this.relativeS * this.s;
        this.shaft.width = newMag;
        this.head.position = {x: newMag, y: 0};
        this.text.position = {x: newMag + 25, y: 0};

        if (this.showMag && this.showId) {
            this.text.text = `${this.id} = ${mag.toFixed(2)}`;
        } else if (this.showMag) {
            this.text.text = mag.toFixed(2);
        } else if (this.showId) {
            this.text.text = this.id;
        } else {
            this.text.text = "";
        }
    }

    angle(vec) {
        let angle = Math.atan2(vec.y, vec.x);
        this.pixiGraphics.rotation = -angle;
        this.text.rotation = angle;
    }

    hide() {
        this.pixiGraphics.visible = false;
    }

    show() {
        this.pixiGraphics.visible = true;
    }

    put() {
        this.vecsPut(this);
    }

    remove() {
        this.vecsRemove(this);
    }

    update() {
        this.vecsUpdate(this)
    }

    updateScale() {
        this.vecsUpdateScale(this)
    }
}

export { Vectors };