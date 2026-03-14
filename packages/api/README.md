# API Package Architecture & Reorganization Plan

This document outlines the architectural plan and required reorganization for the `@fishsticks/api` package. As the core simulation, rendering, and graphing engine, it needs a highly modular structure to support future graphical frontends (like WebGL/Three.js) and advanced calculation systems.

## Proposed Directory Structure

To separate concerns and maintain a clean architecture, the `packages/api/src/` directory will be reorganized into the following modular structure:

```
packages/api/src/
├── objects/     # Core state, physics integration, undo/redo
├── plotter/     # High-precision realtime graphing (D3)
├── canvas/      # Interaction layer, grid, and coordinate systems
├── drawer/      # Rendering abstractions (PixiJS currently)
├── solver/      # Equation reduction and numerical solving (Future)
└── index.ts     # Public API surface
```

---

## Implementation Details & Technical Specifications

The following integrated implementations outline how each module operates internally and interfaces with the others.

### 1. Objects Module (`packages/api/src/objects/`)

**Purpose:** The central nervous system of the simulation. It manages all physics and graphical objects, tracking their kinematics, metadata, and orchestrating interactions among the Plotter, Canvas, Drawer, and the Physics Engine (Rapier2D).

**Technical Implementation:**

- **State Management:** Object data is held in an internal ECS (Entity-Component-System) structural graph or array of strictly typed `SimObject` representations.
- **History (Undo/Redo):** Employs the **Command Pattern** handling interface implementations of `ICommand` (`execute()`, `undo()`). All user-initiated mutations (Create, Delete, Move, Property Change) create a command pushed to a `CommandManager` stack. Instead of rewinding the physics engine (Rapier2D), rolling back physics states relies on restoring absolute snapshot values (`rigidBody.setTranslation()`, `rigidBody.setLinvel()`).
- **Selection API:** Includes boolean evaluators (point-in-polygon queries for arbitrary meshes via collision shapes) exposing `select(x, y)` and `boxSelect(rect)` methods.

### 2. Plotter Module (`packages/api/src/plotter/`)

**Purpose:** Real-time, high-precision scientific visualizations of simulation data.

**Technical Implementation:**

- **Data Ingestion:** Driven by high-performance `Float32Array` or `Float64Array` ring-buffers (`DataStream` class) to ingest simulated kinematic data at 60-120Hz without allocating new memory (`O(1)` garbage collection overhead).
- **Hybrid D3/Canvas Architecture:** Bypasses DOM mutation bottlenecks. Uses D3.js strictly for DOM-based SVG axes (`d3.axisBottom`, `d3.scaleLinear`), tick parsing, and labels. The actual graph data points are mapped using `d3-shape` onto a highly performant `<canvas>` rendered via `requestAnimationFrame`.
- **Data Decimation:** Implements downsampling algorithms like Largest Triangle Three Buckets (LTTB) via a `Decimator` utility. If a buffer tracks 100,000 points, it reduces the dataset to match the screen's pixel resolution (e.g., ~1,000 drawable points).

### 3. Canvas Module (`packages/api/src/canvas/`)

**Purpose:** The interactor, viewport manager, and primary scene stage.

**Technical Implementation:**

- **Event Interception & Transformation:** Captures native DOM events (`pointerdown`, `pointermove`, `wheel`) and computes the affine transformation matrix to convert screen pixels into simulation/world coordinates (Pan and Zoom offsets).
- **Grid and Snapping:** Implements a visual infinite spatial grid. Snapping coordinates are calculated using modular mathematics directly off the pointer event: `snappedPos = Math.round(pointerPos / gridSize) * gridSize`. Provides continuous visual grid feedback and corrected deterministic snapped coordinates to the `Objects` selection/creation endpoints.

### 4. Drawer Module (`packages/api/src/drawer/`)

**Purpose:** Rendering abstraction layer cleanly divorcing API logic from the graphics vendor (e.g., PixiJS, WebGL/Three.js).

**Technical Implementation:**

- **Strict Abstraction:** Defines an `IRenderer` TypeScript interface dictating methods like `drawCircle()`, `drawPolygon()`, `drawVectorLine()`, and `clear()`.
- **PixiJS Implementation:** A `PixiDrawer` class implements `IRenderer`. It aggregates `PIXI.Graphics` contexts.
- All dependencies from `Objects` or `Plotter` depend solely on the abstract `IRenderer` implementation, preventing Pixi-specific context bleeding to other API modules, which guarantees an effortless swap step if transitioning to 3D later.

### 5. Solver Module (Future) (`packages/api/src/solver/`)

**Purpose:** Equation reduction, unit-checking, numerical solving, and parametric definition.

**Technical Implementation:**

- **Symbolic Math Processing:** Integrates an established AST (Abstract Syntax Tree) math engine like `math.js` or `nerdamer`. The solver acts as a translation layer converting internal physics constraints into parsable string equations.
- **Reduction and SI Computation:** Handles dimensional homogeneity by passing unit-tagged variables (e.g., `math.unit(5, 'kg')`).
- **Numerical Approaches:** In cases of non-linear constraint solving, numerical solvers (Newton-Raphson or Runge-Kutta estimators) will be implemented as discrete utility classes (`NumericalSolver.solve()`).
