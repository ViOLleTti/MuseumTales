Place the final printed target images for `mind-ar-js` here.

Required files:

- `plate.jpeg` -> `E1` 北大药学院纪念盘
- `coin.jpeg` -> `E2` 港中深纪念币
- `silk.jpeg` -> `E3` 丝织品
- `elephant.jpeg` -> `E4` 明州越窑青瓷象
- `chess.jpeg` -> `E5` 国际象棋套装
- `horses.jpeg` -> `E6` 西安交大秦代马车
- `calligraphy.jpeg` -> `E7` 手写庆祝书法
- `ship.jpeg` -> `E8` 运河船模型 + 交接钥匙

These filenames are already wired into the exhibit metadata in `src/lib/narrative-rules.json`.
When the actual image files are added here, they will be served at `/targets/<filename>`.

Optional but recommended:

- Compile the 8 jpeg files above in the same order into a single `targets.mind`
- Save it as `public/targets/targets.mind`

If `targets.mind` is missing, the scan page will attempt to compile the jpeg files in the browser at runtime before starting MindAR.
