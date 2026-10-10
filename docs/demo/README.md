# Recording the demo

This script captures the deployed app at [https://unicode-atlas.vercel.app](https://unicode-atlas.vercel.app). It uses real browser interactions, eased cursor movement, short pauses, and camera zooms.

Use Node.js 20.9 or newer and FFmpeg on your PATH. From the repository root, run:

```bash
npm ci --prefix docs/demo
npm exec --prefix docs/demo -- playwright install chromium
node docs/demo/record.mjs
```

The script replaces `docs/images/demo.gif` and `docs/images/demo.mp4`. It does not start a development server. The recording dependencies are separate from the app's dependencies.

Edit the tour in [record.mjs](record.mjs) to change the actions. Shared timing, cursor, camera, and encoding settings are in [studio.mjs](studio.mjs). Browser timers advance one frame at a time so capture speed does not change playback speed. Zooms crop the captured pixels without changing the app layout.

The MP4 is 960 x 600 at 18 fps. The smaller GIF is 720 x 450 at 10 fps. Captured frames stay in an OS temporary directory. `capture.json` contains the tour timings and local frame path for debugging; it is not intended for committing.
