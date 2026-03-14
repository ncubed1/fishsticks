export interface Position {
  x: number;
  y: number;
}

export interface ActionProps {
  clientPosition: Position;
  offsetPosition: Position;
  deltaClientPosition: Position;
  deltaY?: number;
}

export interface ZoomProps {
  pos1: Position;
  pos2: Position;
  deltaDiffPos: Position;
  deltaPos: Position;
  pos: Position;
  deltaDiff: number;
  diff: number;
  prevDiff: number;
}

export type Action<T = ActionProps> = (props: T) => void;
export type Checker<T = ActionProps> = (props: T) => boolean;

export interface PointerAction {
  element: EventTarget;
  checker: Checker;
  action: Action;
}

export interface ZoomAction {
  element: EventTarget;
  checker: Checker;
  action: Action<ZoomProps>;
}

export interface DragAction {
  element: EventTarget;
  checker: Checker;
  grabAction: Action;
  dragAction: Action;
  dropAction: Action;
}

export interface GlobalAction {
  checker: () => boolean;
  action: () => void;
}

function getProps(e: PointerEvent | MouseEvent | WheelEvent): ActionProps {
  return {
    clientPosition: { x: e.clientX, y: e.clientY },
    offsetPosition: { x: e.offsetX, y: e.offsetY },
    deltaClientPosition: { x: 0, y: 0 },
    deltaY: "deltaY" in e ? (e as WheelEvent).deltaY : 0,
  };
}

function getZoomProps(e1: PointerEvent, e2: PointerEvent): ZoomProps {
  const pos1 = { x: e1.clientX, y: e1.clientY };
  const pos2 = { x: e2.clientX, y: e2.clientY };
  const pos = { x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 };
  const diff = Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);

  return {
    pos1,
    pos2,
    deltaDiffPos: { x: 0, y: 0 },
    deltaPos: { x: 0, y: 0 },
    pos,
    deltaDiff: 0,
    diff,
    prevDiff: 0,
  };
}

export default class Listener {
  history: { actions: any[] } = { actions: [] };
  source: HTMLElement;

  lmbActions: PointerAction[] = [];
  lmbDownActions: PointerAction[] = [];
  rmbActions: PointerAction[] = [];
  mmbActions: PointerAction[] = [];

  wheelActions: PointerAction[] = [];
  scrollActions: PointerAction[] = [];
  dragActions: DragAction[] = [];
  deleteActions: GlobalAction[] = [];
  zoomActions: ZoomAction[] = [];
  lostFocusActions: GlobalAction[] = [];

  private zoomEventCache: PointerEvent[] = [];

  // Active state trackers
  private activeDrags: {
    action: DragAction;
    props: ActionProps;
    previousPos: Position;
    isDragging: boolean;
  }[] = [];
  private activeZooms: ZoomAction[] = [];
  private isZooming: boolean = false;
  private prevZoomProps: ZoomProps | null = null;
  private activeTarget: EventTarget | null = null;
  private pendingClickActions: {
    lmb: PointerAction[];
    rmb: PointerAction[];
    mmb: PointerAction[];
    button: number;
  } | null = null;

  constructor(source: HTMLElement) {
    this.source = source;

    // Bind methods to ensure context is kept when adding/removing event listeners
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onLostFocus = this.onLostFocus.bind(this);

    // Initial listener attachments
    this.source.addEventListener("pointerdown", this.onPointerDown);
    this.source.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("visibilitychange", this.onLostFocus);
  }

  private onPointerDown(e: PointerEvent) {
    const button = e.button;
    const props = getProps(e);
    const target = e.target;
    this.activeTarget = target;

    // Attach document-level move/up listeners to track drags seamlessly anywhere
    if (this.zoomEventCache.length === 0) {
      document.addEventListener("pointermove", this.onPointerMove);
      document.addEventListener("pointerup", this.onPointerUp);
      document.addEventListener("pointercancel", this.onPointerUp);
    }

    // Update zoom pointer cache
    const existingIndex = this.zoomEventCache.findIndex(
      (cachedEv) => cachedEv.pointerId === e.pointerId,
    );
    if (existingIndex !== -1) {
      this.zoomEventCache[existingIndex] = e;
    } else if (this.zoomEventCache.length < 2) {
      this.zoomEventCache.push(e);
    }

    if (button === 0) {
      // LMB or Touch (Primary)
      // Call down actions
      const matchedLmbDown = this.lmbDownActions.filter(
        ({ element, checker }) => target === element && checker(props),
      );
      matchedLmbDown.forEach(({ action }) => action(props));

      // Prep zoom
      const matchedZoom = this.zoomActions.filter(
        ({ element, checker }) => target === element && checker(props),
      );
      if (matchedZoom.length > 0) {
        for (const action of matchedZoom) {
          if (!this.activeZooms.includes(action)) {
            this.activeZooms.push(action);
          }
        }
      }

      if (this.activeZooms.length > 0 && this.zoomEventCache.length >= 2) {
        this.prevZoomProps = getZoomProps(
          this.zoomEventCache[0],
          this.zoomEventCache[1],
        );
        this.isZooming = true;
      }

      // Prep drag
      const matchedDrag = this.dragActions.filter(
        ({ element, checker }) => target === element && checker(props),
      );
      if (matchedDrag.length > 0) {
        this.activeDrags = matchedDrag.map((d) => ({
          action: d,
          props, // initial props
          previousPos: props.clientPosition,
          isDragging: false, // hasn't moved yet
        }));
      }

      // Prep potential clicks
      const lmb = this.lmbActions.filter(
        ({ element, checker }) => target === element && checker(props),
      );
      this.pendingClickActions = { lmb, rmb: [], mmb: [], button: 0 };
    } else if (button === 2) {
      // RMB
      const rmb = this.rmbActions.filter(
        ({ element, checker }) => target === element && checker(props),
      );
      this.pendingClickActions = { lmb: [], rmb, mmb: [], button: 2 };

      if (rmb.length > 0) {
        document.addEventListener("contextmenu", this.onContextMenu, {
          once: true,
        });
      }
    } else if (button === 1) {
      // MMB
      const mmb = this.mmbActions.filter(
        ({ element, checker }) => target === element && checker(props),
      );
      this.pendingClickActions = { lmb: [], rmb: [], mmb, button: 1 };
    }
  }

  private onPointerMove(e: PointerEvent) {
    const index = this.zoomEventCache.findIndex(
      (cachedEv) => cachedEv.pointerId === e.pointerId,
    );
    if (index !== -1) {
      this.zoomEventCache[index] = e;
    }

    // Process Zoom
    if (
      this.zoomEventCache.length >= 2 &&
      this.isZooming &&
      this.prevZoomProps
    ) {
      const currentProps = getZoomProps(
        this.zoomEventCache[0],
        this.zoomEventCache[1],
      );

      currentProps.deltaDiffPos = {
        x:
          currentProps.pos2.x -
          currentProps.pos1.x -
          (this.prevZoomProps.pos2.x - this.prevZoomProps.pos1.x),
        y:
          currentProps.pos2.y -
          currentProps.pos1.y -
          (this.prevZoomProps.pos2.y - this.prevZoomProps.pos1.y),
      };
      currentProps.deltaPos = {
        x: currentProps.pos.x - this.prevZoomProps.pos.x,
        y: currentProps.pos.y - this.prevZoomProps.pos.y,
      };
      currentProps.deltaDiff = currentProps.diff - this.prevZoomProps.diff;
      currentProps.prevDiff = this.prevZoomProps.diff;

      this.activeZooms.forEach(({ action }) => action(currentProps));

      this.prevZoomProps = currentProps;
      return; // Do not emit drag events when zooming
    }

    // Process Drag
    if (this.activeDrags.length > 0 && !this.isZooming) {
      const props = getProps(e);
      this.activeDrags.forEach((dragState) => {
        if (!dragState.isDragging) {
          dragState.isDragging = true;
          dragState.action.grabAction(dragState.props);
          this.pendingClickActions = null; // moving cancels a simple click
        }

        const delta = {
          x: props.clientPosition.x - dragState.previousPos.x,
          y: props.clientPosition.y - dragState.previousPos.y,
        };
        const currentProps = { ...props, deltaClientPosition: delta };
        dragState.previousPos = props.clientPosition;

        dragState.action.dragAction(currentProps);
      });
    }
  }

  private onPointerUp(e: PointerEvent) {
    const props = getProps(e);

    // Drop Active Drags
    if (this.activeDrags.length > 0 && !this.isZooming) {
      this.activeDrags.forEach((dragState) => {
        if (dragState.isDragging)
          dragState.action.dropAction({
            ...props,
            deltaClientPosition: { x: 0, y: 0 },
          });
      });
      this.activeDrags = [];
    }

    // Zoom cache cleanup
    const index = this.zoomEventCache.findIndex(
      (cachedEv) => cachedEv.pointerId === e.pointerId,
    );
    if (index !== -1) {
      this.zoomEventCache.splice(index, 1);
    }

    if (this.zoomEventCache.length < 2) {
      this.isZooming = false;
      this.prevZoomProps = null;
    }

    // Process click if not cancelled by drag/zoom movement
    if (
      this.pendingClickActions &&
      e.button === this.pendingClickActions.button
    ) {
      if (e.button === 0)
        this.pendingClickActions.lmb.forEach(({ action }) => action(props));
      else if (e.button === 2)
        this.pendingClickActions.rmb.forEach(({ action }) => action(props));
      else if (e.button === 1)
        this.pendingClickActions.mmb.forEach(({ action }) => action(props));
    }

    this.pendingClickActions = null; // reset clicks

    // Remove global listeners once all pointers are lifted
    if (this.zoomEventCache.length === 0) {
      this.activeTarget = null;
      this.activeZooms = [];
      document.removeEventListener("pointermove", this.onPointerMove);
      document.removeEventListener("pointerup", this.onPointerUp);
      document.removeEventListener("pointercancel", this.onPointerUp);
    }
  }

  private onContextMenu(e: Event) {
    e.preventDefault();
  }

  private onWheel(e: WheelEvent) {
    const props = getProps(e);
    const target = e.target;

    // Simulate zoom using wheel scrolling for desktop support
    const matchedZoom = this.zoomActions.filter(
      ({ element, checker }) => target === element && checker(props),
    );

    if (matchedZoom.length > 0) {
      e.preventDefault(); // Prevent page scroll when zooming canvas

      const pos = props.clientPosition;

      // Simulate delta diff from wheel scroll
      // Scrolling down (positive deltaY) means zoom out (negative deltaDiff)
      const deltaDiff = -(e.deltaY * 0.5);
      // Arbitrary base diff
      const baseDiff = 1000;

      const zoomProps: ZoomProps = {
        pos1: pos,
        pos2: pos,
        deltaDiffPos: { x: 0, y: 0 },
        deltaPos: { x: 0, y: 0 },
        pos,
        deltaDiff,
        diff: baseDiff + deltaDiff,
        prevDiff: baseDiff,
      };

      matchedZoom.forEach(({ action }) => action(zoomProps));
    }

    const matchedWheel = this.wheelActions.filter(
      ({ element, checker }) => target === element && checker(props),
    );
    matchedWheel.forEach(({ action }) => action(props));

    const matchedScroll = this.scrollActions.filter(
      ({ element, checker }) => target === element && checker(props),
    );
    matchedScroll.forEach(({ action }) => action(props));
  }

  private onKeyUp(e: KeyboardEvent) {
    if (e.key === "Delete") {
      this.deleteActions.forEach(({ action, checker }) => {
        if (checker()) action();
      });
    }
  }

  private onLostFocus() {
    if (document.hidden) {
      this.lostFocusActions.forEach(({ action, checker }) => {
        if (checker()) action();
      });
    }
  }

  addDragAction(
    element: EventTarget,
    checker: Checker,
    grabAction: Action,
    dragAction: Action,
    dropAction: Action,
  ) {
    this.dragActions.push({
      element,
      checker,
      grabAction,
      dragAction,
      dropAction,
    });
  }

  addLmbAction(element: EventTarget, checker: Checker, action: Action) {
    this.lmbActions.push({ element, checker, action });
  }

  addLmbDownAction(element: EventTarget, checker: Checker, action: Action) {
    this.lmbDownActions.push({ element, checker, action });
  }

  addRmbAction(element: EventTarget, checker: Checker, action: Action) {
    this.rmbActions.push({ element, checker, action });
  }

  addMmbAction(element: EventTarget, checker: Checker, action: Action) {
    this.mmbActions.push({ element, checker, action });
  }

  addWheelAction(element: EventTarget, checker: Checker, action: Action) {
    this.wheelActions.push({ element, checker, action });
  }

  addScrollAction(element: EventTarget, checker: Checker, action: Action) {
    this.scrollActions.push({ element, checker, action });
  }

  addDeleteAction(
    element: EventTarget,
    checker: () => boolean,
    action: () => void,
  ) {
    this.deleteActions.push({ checker, action });
  }

  addZoomAction(
    element: EventTarget,
    checker: Checker,
    action: Action<ZoomProps>,
  ) {
    this.zoomActions.push({ element, checker, action });
  }

  addLostFocusAction(checker: () => boolean, action: () => void) {
    this.lostFocusActions.push({ checker, action });
  }

  destroy() {
    this.source.removeEventListener("pointerdown", this.onPointerDown);
    this.source.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("keyup", this.onKeyUp);
    document.removeEventListener("visibilitychange", this.onLostFocus);

    this.source.removeEventListener("pointermove", this.onPointerMove);
    this.source.removeEventListener("pointerup", this.onPointerUp);
    this.source.removeEventListener("pointercancel", this.onPointerUp);
  }
}
