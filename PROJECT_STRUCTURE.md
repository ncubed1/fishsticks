# Project Structure

The `fishsticks` project is a monorepo consisting of multiple primary packages across different directories. Each directory serves a distinct role within the full-stack architecture.

## High-Level Overview

```text
fishsticks/
├── apps/
│   ├── app/            # Frontend (React + Vite)
│   └── server/         # Backend proxy/microservice
├── packages/
│   ├── api/            # Core physics/rendering engine
│   ├── config/         # Shared ESLint/TS configs
│   └── ui-functions/   # High-performance Rust/WASM UI data processing
├── package.json        # Root workspace definition
└── turbo.json          # Task runner configuration
```

---

## 1. Core Engine (`/packages/api`)

This package contains the core simulation, rendering logic, and 2D physical engine.

- **Language**: TypeScript
- **Key Dependencies**: `@dimforge/rapier2d-compat` (physics) and `pixi.js` (graphics rendering).
- **Core Files/Folders**:
  - `src/physics.ts`: Handles 2D rigid-body and collision simulation.
  - `src/graphics.ts`: Responsible for rendering updates using PixiJS.
  - `vite.config.ts`: Configures the Vite build, including WASM/top-level await plugins.

## 2. Frontend Application (`/apps/app`)

The graphical user interface for interacting with the simulation environments.

- **Language**: TypeScript & React 18
- **Tooling**: Built with Vite.
- **Core Files/Folders**:
  - `src/components/`: Modular React UI elements. Architected by feature folders (e.g., `Hotbar/`, `Sidebar/`, `Controls/`). Each contains its `.tsx` logic and `.module.css` scoped styles.
  - `src/gui/`: Handles interactions between user events and the core API engine.
  - `src/styles/`: Global stylesheets (`globals.css`).

## 3. WebAssembly Processing (`/packages/ui-functions`)

A Rust-based library compiled to WebAssembly (WASM). Hand-rolled to optimize computationally expensive UI data tasks that string Pure JavaScript.

- **Language**: Rust
- **Key Dependencies**: `wasm-bindgen` (facilitates easy JS/WASM interop).
- **Core Files/Folders**:
  - `src/lib.rs` & `src/utils.rs`: Entry points for the Rust business logic.
  - `pkg/`: Generated WASM artifacts alongside `.js` & `.d.ts` glue code (after running `wasm-pack build`).

## 4. Backend Server (`/apps/server`)

A minimal microservice or hosting proxy.

- **Language**: Node.js
- **Core Files/Folders**:
  - `src/server.js`: The central server executable.

## 5. Shared Configuration (`/packages/config`)

Centralized and shared configuration for the monorepo.

- **Core Files/Folders**:
  - `eslint.config.js`: Shared ESLint configurations.
  - `tsconfig.base.json`: Base TypeScript compiler options.

---

## Internal Integrations

- **Workspaces**: The project uses Workspaces (via npm/pnpm/yarn) and Turborepo for task management instead of fragile relative paths.
- **`apps/app` -> `packages/api`**: Bound using standard workspace references (`"api": "*"`).
- **`apps/app` -> `packages/ui-functions`**: The frontend bridges direct WebAssembly methods generated to power complex computations safely isolated from the main thread rendering step.
