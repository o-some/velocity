# Harbor material update

Reference: user's iPhone Neon Harbor racing screenshot, 8 October 2026.

The glitched-looking plain high-rise walls now use a generated 1024x1024 RGB architectural facade on all four vertical sides. World-scaled UVs keep floor spacing consistent across differently shaped towers; roofs and bases do not have window textures. Towers retain their previous locations, footprints and heights and have additional corner mullions, stone bases, roof plant and antennas. Roof details disappear in the existing sparse graphics mode.

The asphalt tile scale was reduced from 170 to 32 world units to reduce oversized aggregate; subtle bump scale is 0.08. Runoff sand tiling is finer. Red/white kerbs and concrete walls now have lightly mottled physical paint materials. Harbor sunlight is warm to match the dusk palette. Race cars reuse the existing bounded showroom environment, with its existing fallback; no extra PMREM bake or race reflection pass was added.

The steering patch, HUD, physics, collision rules, saves and podium are unchanged. Full `node tests/verify.cjs` passes with renderer/image/DOM doubles and real Three.js geometry. Added checks cover all four facade sides, world-scaled asphalt UVs, sparse-mode detail visibility and the new asset hash. No post-update GPU render, actual iPhone playtest, visual score or measured FPS is claimed.

Asset and complete generation prompt: `dist/assets/textures/harbor-facade-v1.json`. Built-in image generation, then only RGB resize/WebP encoding. No external asset license or paid API service was added.
