# 3D Positioning Workflow

> Rules for working with GLB models and 3D object orientation in this project. Read before touching any Three.js code.

## Axes Reference

```
Camera: orthographic, position [0, 20, 0], zoom 70, looking straight down

     -Z (screen top)
          ↑
          |
-X ←————— + ————→ +X
(left)    |      (right)
          ↓
     +Z (screen bottom)

Y axis: +Y = toward camera, -Y = toward desk
Objects at Y ≈ 0 are flat on the desk surface
```

## Rules

### 1. Never guess GLB dimensions
When loading any new GLB model, **always** log its bounding box first:
```ts
const box = new THREE.Box3().setFromObject(scene);
const size = new THREE.Vector3();
const center = new THREE.Vector3();
box.getSize(size);
box.getCenter(center);
console.log("Size:", size.toArray());
console.log("Center:", center.toArray());
```
Use those exact numbers for positioning child elements. Do not estimate.

### 2. One change at a time
Make ONE orientation/position change, then ask for a screenshot. Do not batch multiple rotation changes — the results of compound rotations are unintuitive and debugging them wastes time.

### 3. Rotation order matters
Euler rotation order is XYZ in Three.js. After an X rotation, subsequent Y and Z rotations happen in the **new local axes**, not world axes. This means:
- **X rotation** → lays objects flat on the desk (tilts from standing to laying)
- **Z rotation** → spins objects on the desk surface (rotates in the XZ plane)
- **Avoid Y rotation after X rotation** — this causes objects to point toward the camera instead of staying flat on the desk

### 4. Confirm axes before applying changes
When the user says "move left" or "rotate clockwise," confirm which axis using the diagram above before writing code. Always describe changes in screen terms:
- "move left" = decrease X
- "move right" = increase X
- "move up on screen" = decrease Z
- "move down on screen" = increase Z
- "rotate clockwise on the desk" = negative Y rotation (or adjust Z euler depending on context)

### 5. Describe what you see vs what you want
When reporting positioning issues, describe the current state and desired state in screen terms rather than rotation degrees. Example: "the stamp handle is pointing up, should be pointing right" is more useful than "rotate 90° on X."
