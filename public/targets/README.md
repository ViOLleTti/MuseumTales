Place the final printed target images for `mind-ar-js` here.

Required files:

- `plate.jpeg` -> `E1` Peking University School of Pharmacy Commemorative Plate
- `coin.jpeg` -> `E2` CUHK-Shenzhen Commemorative Coin
- `silk.jpeg` -> `E3` Silk Textile
- `elephant.jpeg` -> `E4` Mingzhou Yue Kiln Celadon Elephant
- `chess.jpeg` -> `E5` Chess Set
- `horses.jpeg` -> `E6` Qin Dynasty Chariot from Xi'an Jiaotong University
- `calligraphy.jpeg` -> `E7` Handwritten Celebration Calligraphy
- `ship.jpeg` -> `E8` Canal Boat Model and Ceremonial Key

These filenames are already wired into the exhibit metadata in `src/lib/narrative-rules.json`.
When the actual image files are added here, they will be served at `/targets/<filename>`.

Optional but recommended:

- Compile the 8 jpeg files above in the same order into a single `targets.mind`
- Save it as `public/targets/targets.mind`

The current scan page expects `targets.mind` to be available before starting MindAR.
