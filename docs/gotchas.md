# Gotchas

> **Read before starting.** Write when you hit something unexpected.

<!-- Add new entries below. Most recent at top. -->

### drei Html `scale` vs `distanceFactor` for orthographic cameras
**Symptom:** Html content rendered as a tiny dot on a 3D plane — invisible at normal zoom
**Cause:** The `scale` prop on drei's `<Html transform>` maps pixels to 3D units directly. With an orthographic camera at zoom 70, a scale of 0.038 makes 280px = ~10 3D units in theory, but the orthographic projection scaling makes the math unintuitive and fragile.
**Fix:** Use `distanceFactor` instead of `scale`. It handles the camera projection math internally. `distanceFactor={5-7}` worked well for our ortho camera at zoom 70.
**Avoid:** Never use `scale` on `<Html transform>` with orthographic cameras. Always use `distanceFactor`.

### Hidden HTML elements at opacity:0 dim WebGL canvas
**Symptom:** The desk scene appeared slightly dimmer/less warm after the loading cover faded out
**Cause:** The loading cover (`position: absolute; inset: 0; z-index: 15; background: #b5905a`) was set to `opacity: 0` but remained in the DOM. On macOS, the browser's GPU compositing of a transparent full-screen element over a WebGL canvas can cause subtle brightness shifts.
**Fix:** Remove the element from the DOM entirely when hidden (`{!sceneReady && <div ... />}`) instead of using `opacity: 0` or `visibility: hidden`.
**Avoid:** For full-screen overlays on top of WebGL canvases, conditionally render (mount/unmount) rather than hiding with CSS.

### Single-mesh GLBs cannot be partially animated
**Symptom:** Tried to clip the baked flap off a GLB envelope and replace it with a procedural triangle — resulted in teal interior exposed, mismatched textures, and z-fighting
**Cause:** The GLB was a single mesh (414K vertices) with the flap, seal, and body all baked together. Clipping planes cut through the entire mesh, exposing interior geometry. Procedural replacement geometry can't match the baked material's UV mapping.
**Fix:** Pivoted away from the approach entirely. Used the GLB as static decoration and built the interaction with a simpler flat plane.
**Avoid:** Before attempting to animate or modify parts of a GLB, traverse the scene and log mesh names/counts. If it's one mesh, don't try to separate parts — redesign the approach.

### R3F debug meshes block pointer events on siblings
**Symptom:** The envelope became unclickable/unhoverable after adding debug spheres
**Cause:** Debug spheres (without event handlers) positioned above the envelope intercepted raycasts. In R3F, events bubble to parents, not siblings — so the ray hitting a sphere never reaches the sibling `<primitive>`.
**Fix:** Removed debug spheres. Alternatively, set `raycast={() => null}` on debug meshes to make them invisible to raycasting.
**Avoid:** Always disable raycasting on debug/helper meshes: `<mesh raycast={() => null}>`.

### JSX rotation props reset useFrame mutations on React re-render
**Symptom:** The envelope flap snapped back to its closed position when the phase changed
**Cause:** The flap group had `rotation={[0, 0, Math.PI]}` in JSX. When phase state changed, React re-rendered the component, and R3F reapplied the JSX rotation prop, overwriting the useFrame animation's imperatively set value.
**Fix:** Manage rotation entirely in useFrame across all phases. Don't set the animated property as a JSX prop.
**Avoid:** If a property is animated by useFrame, never also set it as a JSX prop. Use useFrame to set the initial value too.

### PlaneGeometry texture appears rotated 90° after mesh rotation
**Symptom:** The fox meadow postcard image (1200x600 landscape) appeared sideways/portrait on the plane
**Cause:** `planeGeometry args=[w, h]` maps texture U to X and V to Y. After `rotation={[-PI/2, 0, 0]}` to lay the plane flat, X stays X but Y maps to -Z. The texture's U (width/1200px) ends up along the screen vertical axis instead of horizontal.
**Fix:** Rotate the texture itself: `texture.center.set(0.5, 0.5); texture.rotation = Math.PI / 2;`
**Avoid:** When laying a textured plane flat with -PI/2 X rotation, always check if the texture orientation needs compensating. The texture rotation is separate from the mesh rotation.

### ExtrudeGeometry needed for top-down visibility of thin objects
**Symptom:** The procedural envelope flap disappeared when at ~90° rotation (edge-on to top-down camera)
**Cause:** ShapeGeometry has zero thickness. From a top-down orthographic camera, any surface perpendicular to the desk is edge-on and invisible.
**Fix:** Use ExtrudeGeometry with a small depth (0.1-0.12 units) instead of ShapeGeometry. Center the extrusion with `geo.translate(0, 0, -depth/2)`.
**Avoid:** In top-down scenes, never use ShapeGeometry for objects that rotate — always extrude for minimum thickness.
