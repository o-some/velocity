# Photographic crowd and desert atmosphere

Eight generated spectator cutouts are packed into a shared 4x2 atlas and drawn in eight instanced batches per track. Alpha testing removes the background; opaque photo impostors do not require per-person transparent sorting. People face inward toward the race surface and sit over the retained seat locations. They are photographic planar impostors, not full 3D people or animated individual faces. Sparse mode halves their instance counts. The crowd is hidden until its image loads, avoiding opaque fallback rectangles.

Concrete terraces now have three actual stepped levels. Seats have instanced backrests, and covered grandstand roofs use a corrugated physical material. Existing safety fences, car physics, HUD, saved games and steering are unchanged.

The desert has 160 bounded wind-drifting sand points in Detail mode, 90 in Balanced mode, and eight very low-opacity heat/haze veils. These are a lightweight atmospheric approximation, not refractive post-processing. Rain, Sparse mode and reduced-motion preferences disable them; pausing freezes time. Dust movement uses one shader uniform, without moving buffers or unbounded emissions. Enlarged geometry bounds cover shader displacement. No extra render target or second race pass was added.

Source and generator prompt: dist/assets/textures/spectators-v1.json. Built-in image generation, followed only by RGBA resize and WebP encoding. The actual image decodes with alpha 0..255. Automated simulation/geometry/event tests and shader-source checks are required; no actual GPU compilation, iPhone visual playtest or measured FPS is claimed.
