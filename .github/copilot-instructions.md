# Project Guidelines

## Code Style

- **JS/TS**: Deep reliance on ES modules (`"type": "module"`). React frontend in [apps/app/src/](apps/app/src/) employs functional components in `.tsx` utilizing `.module.css` for scoped styling (e.g., [apps/app/src/components/Hotbar/Hotbar.module.css](apps/app/src/components/Hotbar/Hotbar.module.css)). Configuration rules should extend from the shared `@fishsticks/config` package to guarantee identical lint/format rules.
- **Rust**: Idiomatic Rust structured in [packages/ui-functions/](packages/ui-functions/) utilize `wasm_bindgen` procedural macros to define interfaces for WASM.
- **CSS**: Dedicated styling boundaries separating global ([apps/app/src/styles/globals.css](apps/app/src/styles/globals.css)) from component-specific modules.

## Architecture

A Turborepo-powered monorepo consisting of multiple primary packages:

- **API ([packages/api/](packages/api/))**: Core simulation and rendering engine using `@dimforge/rapier2d-compat` (physics) and `pixi.js` (graphics). We prefer strictly typed `.ts` files over `.js`.
- **App ([apps/app/](apps/app/))**: React 18 frontend built with Vite. Manages UI, injects simulation canvas, and routes GUI interactions to the `api`.
- **UI Functions ([packages/ui-functions/](packages/ui-functions/))**: High-performance Rust library compiled to WebAssembly via `wasm-bindgen` for computationally expensive UI tasks.
- **Server ([apps/server/](apps/server/))**: Minimal Node.js backend proxy/microservice.

## Build and Test

Task running is managed by Turborepo from the root workspace directory. Agents should attempt to run these automatically from the root when needed:

- **Build all packages:** Run `npm run build` (invokes `turbo run build`).
- **Start development servers:** Run `npm run dev`. Turborepo handles building dependencies first (e.g. compiling Rust `ui-functions`) before starting Vite.
- **Test:** Run `npm run test` (invokes tests across workspaces).
- **Manual WASM Build**: `npm run build` inside [packages/ui-functions/](packages/ui-functions/) runs `wasm-pack build --target web`, generating artifacts in `pkg/`.

## Project Conventions

- **Separation of Concerns**: Rendering logic ([packages/api/src/graphics.ts](packages/api/src/graphics.ts)) and physics ([packages/api/src/physics.ts](packages/api/src/physics.ts)) must not handle GUI state. React code maintains local layout but relies upon `packages/api/` methods for simulation interactions via [apps/app/src/gui/](apps/app/src/gui/).
- **File Structure**: React components live strictly in Feature Folders under [apps/app/src/components/](apps/app/src/components/) (e.g., [apps/app/src/components/Sidebar/](apps/app/src/components/Sidebar/)) which must contain both the `.tsx` component and `.module.css` scoped styles.

## Integration Points

- **NPM Workspaces**: Cross-package dependencies are bound using standard workspace references (e.g., `"api": "*"` in [apps/app/package.json](apps/app/package.json)). Turborepo manages the topological run order.
- **WebAssembly Hand-off**: The frontend uses `vite-plugin-wasm` and `vite-plugin-top-level-await` in [apps/app/vite.config.ts](apps/app/vite.config.ts) and [packages/api/vite.config.ts](packages/api/vite.config.ts) to transparently import WebAssembly execution contexts into the JavaScript module graph.

## Security

- Validate interactions routing from React component inputs down to Rust WASM boundaries.
- `ui-functions` leverages `console_error_panic_hook` to surface Rust panics to the JavaScript console. Ensure this is handled properly when optimizing releases.
