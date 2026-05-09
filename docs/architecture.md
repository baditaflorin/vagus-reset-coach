# Architecture

Live site: https://baditaflorin.github.io/vagus-reset-coach/

Repository: https://github.com/baditaflorin/vagus-reset-coach

## Context

```mermaid
C4Context
  title Vagus Reset Coach Context
  Person(user, "User", "Runs a private two-minute reset in the browser")
  System_Boundary(pages, "GitHub Pages") {
    System(app, "Static React App", "Webcam rPPG, breath pacing, local history")
  }
  SystemDb(local, "Browser Storage", "IndexedDB")
  Rel(user, app, "Uses over HTTPS")
  Rel(app, local, "Stores sessions locally")
```

## Container

```mermaid
flowchart LR
  subgraph pages["GitHub Pages boundary"]
    shell["React session UI"]
    rppg["rPPG engine"]
    breath["Breath pacer + Web Audio"]
    duck["DuckDB-WASM analytics"]
    sw["Service worker"]
  end
  storage["IndexedDB"]
  camera["Webcam"]
  speaker["Audio output"]
  shell --> rppg
  shell --> breath
  shell --> duck
  rppg --> camera
  breath --> speaker
  duck --> storage
  shell --> storage
  sw --> pages
```

## Boundaries

- No backend exists in v1.
- Camera frames are processed in memory and are never persisted.
- Session summaries are local browser data only.
