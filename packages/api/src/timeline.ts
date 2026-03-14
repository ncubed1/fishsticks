import * as PIXI from "pixi.js";

const TIMELINE_T_MAX_SECONDS = 300;

function formatHHMM(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const h = Math.floor(clamped / 3600).toString().padStart(2, "0");
  const m = Math.floor((clamped % 3600) / 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatWithMs(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const ms = Math.round((clamped % 1) * 1000).toString().padStart(3, "0");
  const s = (Math.floor(clamped) % 60).toString().padStart(2, "0");
  const m = (Math.floor(clamped / 60) % 60).toString().padStart(2, "0");
  const h = Math.floor(clamped / 3600);
  if (h > 0) return `${h.toString().padStart(2, "0")}:${m}:${s}.${ms}`;
  return `${m}:${s}.${ms}`;
}

/**
 * Maps pixel distance x from center to seconds.
 * Linear zone [0, b/2]: t = x/50
 * Non-linear zone (b/2, b]: t = max(x/50, b/100 + a*(x-b/2)^2), a = 4*(T_MAX-5)/b^2
 */
function distanceToSeconds(x: number, b: number): number {
  const cx = Math.max(0, Math.min(x, b));
  if (cx <= b / 2) return cx / 50;
  const a = (4 * (TIMELINE_T_MAX_SECONDS - 5)) / (b * b);
  return Math.max(cx / 50, b / 100 + a * (cx - b / 2) ** 2);
}

/** Inverse of distanceToSeconds via binary search. */
function secondsToDistance(seconds: number, b: number): number {
  const target = Math.max(0, seconds);
  let lo = 0, hi = b;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    distanceToSeconds(mid, b) < target ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}

export default class Timeline {
  objects: any;
  app: PIXI.Application;
  container: PIXI.Container;

  private isDragging: boolean = false;
  private dragStartPointerX: number = 0;
  private dragStartTime: number = 0;

  private bgGraphics: PIXI.Graphics;
  private trackContainer: PIXI.Container;
  private ticksGraphics: PIXI.Graphics;
  private sliderGraphics: PIXI.Graphics;
  private sliderText: PIXI.Text;
  private leftText: PIXI.Text;
  private rightText: PIXI.Text;
  private maskGraphics: PIXI.Graphics;

  constructor(objects: any) {
    this.objects = objects;
    this.app = objects.canvas.app;

    this.container = new PIXI.Container();
    this.container.zIndex = 1000;
    this.app.stage.addChild(this.container);

    this.bgGraphics = new PIXI.Graphics();
    this.container.addChild(this.bgGraphics);

    this.maskGraphics = new PIXI.Graphics();
    this.container.addChild(this.maskGraphics);

    this.trackContainer = new PIXI.Container();
    this.container.addChild(this.trackContainer);
    this.trackContainer.mask = this.maskGraphics;

    this.ticksGraphics = new PIXI.Graphics();
    this.trackContainer.addChild(this.ticksGraphics);

    // Slider sits on top - not clipped by the mask
    this.sliderGraphics = new PIXI.Graphics();
    this.container.addChild(this.sliderGraphics);

    const edgeLabelStyle = new PIXI.TextStyle({
      fill: 0xcbd5e1,
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "monospace",
    });

    this.leftText = new PIXI.Text({ text: "00:00", style: edgeLabelStyle });
    this.leftText.anchor.set(0, 0.5);
    this.container.addChild(this.leftText);

    this.rightText = new PIXI.Text({ text: "00:00", style: edgeLabelStyle });
    this.rightText.anchor.set(1, 0.5);
    this.container.addChild(this.rightText);

    this.sliderText = new PIXI.Text({
      text: "00:00.000",
      style: new PIXI.TextStyle({
        fill: 0xffffff,
        fontSize: 11,
        fontWeight: "700",
        fontFamily: "monospace",
        dropShadow: {
          alpha: 0.9,
          angle: Math.PI / 2,
          blur: 3,
          color: 0x0f172a,
          distance: 2,
        },
      }),
    });
    this.sliderText.anchor.set(0.5, 1);
    this.container.addChild(this.sliderText);

    // Drag handled exclusively on the slider handle
    this.sliderGraphics.eventMode = "static";
    this.sliderGraphics.cursor = "ew-resize";
    this.sliderGraphics.on("pointerdown", this.onPointerDown.bind(this));

    this.app.stage.eventMode = "static";
    this.app.stage.on("pointermove", this.onPointerMove.bind(this));
    this.app.stage.on("pointerup", this.onPointerUp.bind(this));
    this.app.stage.on("pointerupoutside", this.onPointerUp.bind(this));

    this.app.ticker.add(this.update.bind(this));
  }

  private onPointerDown(e: PIXI.FederatedPointerEvent) {
    e.stopPropagation();
    this.isDragging = true;
    this.dragStartPointerX = e.global.x;
    this.dragStartTime = this.objects.simulation?.simulationTime ?? 0;
  }

  private onPointerMove(e: PIXI.FederatedPointerEvent) {
    if (!this.isDragging) return;
    const b = Math.max(this.app.screen.width / 2, 1);
    const delta = e.global.x - this.dragStartPointerX;
    // Drag right = forward in time, drag left = backward
    const timeDelta =
      delta >= 0
        ? distanceToSeconds(delta, b)
        : -distanceToSeconds(-delta, b);
    const newTime = Math.max(
      0,
      Math.min(TIMELINE_T_MAX_SECONDS, this.dragStartTime + timeDelta),
    );
    if (this.objects.simulation) {
      this.objects.simulation.simulationTime = newTime;
    }
  }

  private onPointerUp() {
    this.isDragging = false;
  }

  update() {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    const marginBottom = 16;
    const barHeight = 30;
    const labelPadding = 8;

    // Bar spans the full screen width - no side gaps
    const barX = 0;
    const barWidth = screenWidth;
    const b = Math.max(barWidth / 2, 1);
    const centerX = barX + b;
    const centerY = screenHeight - marginBottom - barHeight / 2;

    // Background
    this.bgGraphics.clear();
    this.bgGraphics
      .roundRect(barX, centerY - barHeight / 2, barWidth, barHeight, 15)
      .fill({ color: 0x1e293b, alpha: 0.85 })
      .stroke({ color: 0xffffff, width: 1, alpha: 0.07 });

    // Mask (same shape as bar)
    this.maskGraphics.clear();
    this.maskGraphics
      .roundRect(barX, centerY - barHeight / 2, barWidth, barHeight, 15)
      .fill(0xffffff);

    // Time mapping
    const simulationTime = this.objects.simulation?.simulationTime ?? 0;
    const baseEdgeSeconds = distanceToSeconds(b, b);
    const leftTime  = Math.max(0, simulationTime - baseEdgeSeconds);
    const rightTime = simulationTime + baseEdgeSeconds;

    // Edge labels (inside bar)
    this.leftText.position.set(barX + labelPadding, centerY);
    this.rightText.position.set(barX + barWidth - labelPadding, centerY);
    this.leftText.text  = formatHHMM(leftTime);
    this.rightText.text = formatHHMM(rightTime);

    // Tick marks
    // trackContainer pinned at (centerX, centerY); px=0 = simulationTime = center
    this.trackContainer.position.set(centerX, centerY);
    this.ticksGraphics.clear();

    const firstSecond = Math.ceil(leftTime);
    const lastSecond  = Math.floor(rightTime);
    const MIN_SPACING = 2; // px - prevents tick merging in non-linear far zone

    const drawTick = (px: number, isMajor: boolean) => {
      if (isMajor) {
        this.ticksGraphics
          .rect(px - 0.5, -10, 1, 20)
          .fill({ color: 0xf8fafc, alpha: 0.85 });
      } else {
        this.ticksGraphics
          .rect(px - 0.5, -7, 1, 14)
          .fill({ color: 0x94a3b8, alpha: 0.55 });
      }
    };

    // Left side: center -> left edge (dist increases as s decreases)
    {
      let prevDist = 0;
      for (let s = Math.floor(simulationTime); s >= firstSecond; s--) {
        const dist = secondsToDistance(simulationTime - s, b);
        if (dist - prevDist < MIN_SPACING) continue;
        prevDist = dist;
        drawTick(-dist, s % 5 === 0);
      }
    }

    // Right side: center -> right edge (dist increases as s increases)
    {
      let prevDist = 0;
      for (let s = Math.ceil(simulationTime); s <= lastSecond; s++) {
        const dist = secondsToDistance(s - simulationTime, b);
        if (dist - prevDist < MIN_SPACING) continue;
        prevDist = dist;
        drawTick(dist, s % 5 === 0);
      }
    }

    // Slider handle - always at center, represents current simulationTime
    const sliderX = centerX;
    const handleW = 3;
    const handleH = barHeight + 8;

    this.sliderGraphics.clear();
    // Generous invisible hit-area so the thin line is easy to grab
    this.sliderGraphics.hitArea = new PIXI.Rectangle(
      sliderX - 10,
      centerY - handleH / 2 - 8,
      20,
      handleH + 16,
    );
    // Thin vertical bar
    this.sliderGraphics
      .roundRect(sliderX - handleW / 2, centerY - handleH / 2, handleW, handleH, 2)
      .fill({ color: 0x60a5fa })
      .stroke({ color: 0xffffff, width: 1, alpha: 0.9 });
    // Small top cap
    this.sliderGraphics
      .roundRect(sliderX - 5, centerY - handleH / 2 - 4, 10, 6, 3)
      .fill({ color: 0x60a5fa })
      .stroke({ color: 0xffffff, width: 1, alpha: 0.9 });

    // Tooltip: ms-precision current time, shown while dragging
    this.sliderText.position.set(sliderX, centerY - handleH / 2 - 10);
    this.sliderText.text    = formatWithMs(simulationTime);
    this.sliderText.visible = this.isDragging;
  }

  show() {
    this.container.visible = true;
  }

  hide() {
    this.container.visible = false;
  }
}
