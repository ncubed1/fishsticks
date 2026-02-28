
function getProps(e) {
    let clientPosition = { x: e.clientX, y: e.clientY };
    let offsetPosition = { x: e.offsetX, y: e.offsetY };
    let deltaClientPosition = { x: 0, y: 0 };
    return {clientPosition, offsetPosition, deltaClientPosition}
}

function getZoomProps(e1, e2) {
    let pos1 = { x: e1.clientX, y: e1.clientY };
    let pos2 = { x: e2.clientX, y: e2.clientY };
    let deltaDiff = 0;
    let deltaDiffPos = { x: 0, y: 0 };
    let deltaPos = { x: 0, y: 0 };
    let pos = { x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 };
    let diff = Math.sqrt(((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2));
    let prevDiff = 0;
    return {pos1, pos2, deltaDiffPos, deltaPos, pos, deltaDiff, diff,prevDiff}
}
export default class Listener {history: any; source: any; lmbActions: any; lmbDownActions: any; rmbActions: any; mmbActions: any; wheelActions: any; dragActions: any; deleteActions: any; zoomActions: any; lostFocusActions: any; zoomEventCache: any; scrollActions: any;
    constructor(source) {
        this.history = {
            "actions": []
        }

        this.source = source;

        // pointerover - hover over
        // pointerenter - hover over
        // pointerdown - active
        // pointermove - moves
        // pointerup - not active
        // pointercancel - pointer disabled
        // pointerout - not over
        // pointerleave - not over
        // pointerrawupdate - other
        // gotpointercapture
        // lostpointercapture

        this.lmbActions = [];
        this.lmbDownActions = [];
        this.rmbActions = [];
        this.mmbActions = [];
        this.wheelActions = [];
        this.dragActions = [];
        this.deleteActions = [];
        this.zoomActions = [];
        this.lostFocusActions = [];

        this.zoomEventCache = [];

        const onPointerDown = (e) => {
            let button = e.button;
            const props = getProps(e);
            let target = e.target;

            let matchedLmbActions, matchedLmbDownActions, matchedZoomActions, matchedDragActions, matchedMmbActions, matchedRmbActions;

            console.log('pointerdown');
            if (button === 0) { // LMB or touch
                matchedLmbDownActions = this.lmbDownActions.filter(({ element, checker }) => target == element && checker(props));
                if (matchedLmbDownActions.length != 0) {
                    matchedLmbDownActions.forEach(({ action }) => action(props));
                }

                matchedZoomActions = this.zoomActions.filter(({ element, checker }) => target == element && checker(props));

                let isZoom = false;

                if (matchedZoomActions.length != 0) {

                    let prevProps = getZoomProps(e, e);
                    const onPointerMove = (e) => {

                        let index = this.zoomEventCache.findIndex(
                            (cachedEv) => cachedEv.pointerId === e.pointerId,
                        );
                        if (this.zoomEventCache.length < 2) {
                            if (index === -1) this.zoomEventCache.push(e);
                        } else {
                            if (index !== -1) this.zoomEventCache[index] = e;
                            let props = getZoomProps(this.zoomEventCache[0], this.zoomEventCache[1]);
                            if (!isZoom) {
                                isZoom = true;
                            } else {
                                console.log("zoom")
                                // let x1 = this.zoomEventCache[0].clientX
                                // let x2 = this.zoomEventCache[1].clientX
                                // let y1 = this.zoomEventCache[0].clientY
                                // let y2 = this.zoomEventCache[1].clientY
                                // console.log(prevProps)
                                props.deltaDiffPos = { x: props.pos2.x - props.pos1.x - (prevProps.pos2.x - prevProps.pos1.x), y: props.pos2.y - props.pos1.y - (prevProps.pos2.y - prevProps.pos1.y) };
                                props.deltaPos = { x: props.pos.x - prevProps.pos.x, y: props.pos.y - prevProps.pos.y };
                                props.deltaDiff = props.diff - prevProps.diff;
                                props.prevDiff = prevProps.diff;


                                // console.log(props.deltaDiff)
                                matchedZoomActions.forEach(({ action }) => action(props));

                                // Cache the distance for the next move event

                            }
                            prevProps = props;

                            // Calculate the distance between the two pointers
                        }
                    }


                    const onPointerUp = (e) => {
                        const index = this.zoomEventCache.findIndex(
                            (cachedEv) => cachedEv.pointerId === e.pointerId,
                        );
                        this.zoomEventCache.splice(index, 1);

                        // If the number of pointers down is less than two then reset diff tracker
                        if (this.zoomEventCache.length < 2) {
                            source.removeEventListener('pointermove', onPointerMove);
                        }
                    }

                    source.addEventListener('pointermove', onPointerMove);
                    source.addEventListener('pointerup', onPointerUp, { once: true });
                }

                matchedDragActions = this.dragActions.filter(({ element, checker }) => target == element && checker(props));

                let isDrag = false;

                if (matchedDragActions.length != 0) {
                    let initialProps = props;
                    let previousClientPosition = initialProps.clientPosition;

                    const onPointerMove = (e) => {
                        if (!isZoom) {
                            if (!isDrag) {
                                console.log(true)
                                isDrag = true
                                matchedDragActions.forEach(({ grabAction }) => grabAction(initialProps))
                            } else {
                                console.log("move")
                                const props = getProps(e)
                                let deltaClientPosition = { x: props.clientPosition.x - previousClientPosition.x, y: props.clientPosition.y - previousClientPosition.y  }
                                previousClientPosition =  props.clientPosition;
                                // console.log(deltaClientPosition);
                                props.deltaClientPosition = deltaClientPosition;
                                matchedDragActions.forEach(({ dragAction }) => dragAction(props));
                            }
                        }
                    }

                    const onPointerUp = (e) => {
                        const props = getProps(e)
                        if (isDrag && !isZoom) matchedDragActions.forEach(({ dropAction }) => dropAction(props));
                        source.removeEventListener('pointermove', onPointerMove);
                    }

                    source.addEventListener('pointermove', onPointerMove);
                    source.addEventListener('pointerup', onPointerUp, { once: true });
                }

                matchedLmbActions = this.lmbActions.filter(({ element, checker }) => target == element && checker(props));

                if (matchedLmbActions.length != 0) {
                    const onPointerUp = (e) => {
                        if (e.button === button && e.target === target && !isDrag && !isZoom) {
                            console.log('lmb')
                            matchedLmbActions.forEach(({ action }) => action(props));
                        }
                    }
                    source.addEventListener('pointerup', onPointerUp, { once: true });
                }
            } else if (button === 2) { // RMB or //TODO: touch hold
                matchedRmbActions = this.rmbActions.filter(({ element, checker }) => target == element && checker(props));
                if (matchedRmbActions.length != 0) {
                    document.addEventListener("contextmenu", (e) => { e.preventDefault(); return false; }, { "once": true });
                    const onPointerUp = (e) => {
                        if (e.button === button && e.target === target) {
                            console.log('rmb')
                            matchedRmbActions.forEach(({ action }) => action(props));
                        }
                    }
                    source.addEventListener('pointerup', onPointerUp, { once: true });
                }
            } else if (button === 1) { // MMB - currently unused
                matchedMmbActions = this.mmbActions.filter(({ element, checker }) => target == element && checker(props));
                if (matchedMmbActions.length != 0) {
                    const onPointerUp = (e) => {
                        if (e.button === button && e.target === target) {
                            console.log('mmb')
                            matchedMmbActions.forEach(({ action }) => action(props));
                        }
                    }
                    source.addEventListener('pointerup', onPointerUp, { once: true });
                }
            }
        }
        source.addEventListener('pointerdown', onPointerDown);

        const onScroll = (e) => {
            const props = getProps(e);
            this.scrollActions.forEach(({ action, checker }) => { if (checker(props)) action(props) });
        }

        const onKeyUp = (e) => {
            if (e.key === 'Delete') {
                console.log('delete');
                onDelete(e);
            }
        }

        const onDelete = (e) => {
            this.deleteActions.forEach(({ action, checker }) => { if (checker()) action() });
        }

        source.addEventListener('keyup', onKeyUp);

        const onLostFocus = () => {
            if (document.hidden) {
                this.lostFocusActions.forEach(({ action, checker }) => { if (checker()) action() });
            }
        }

        document.addEventListener("visibilitychange", onLostFocus);
    }

    addDragAction(element, checker, grabAction, dragAction, dropAction) {
        this.dragActions.push({element, checker, grabAction, dragAction, dropAction });
    }
    addLmbAction(element, checker, action) {
        this.lmbActions.push({element, checker, action});
    }
    addLmbDownAction(element, checker, action) {
        this.lmbDownActions.push({element, checker, action});
    }
    addRmbAction(element, checker, action) {
        this.rmbActions.push({element, checker, action});
    }
    addWheelAction(element, checker, action) {
        this.wheelActions.push({element, checker, action});
    }
    addDeleteAction(element, checker, action) {
        this.deleteActions.push({element, checker, action});
    }
    addZoomAction(element, checker, action) {
        this.zoomActions.push({element, checker, action});
    }
    addLostFocusAction(checker, action) {
        this.lostFocusActions.push({checker, action});
    }
}

// add deltaClientPosition
// fix other listeners
