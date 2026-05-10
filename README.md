# Museum AR Narrative Web

This is a mobile-first interactive storytelling web project for a museum visit. Players start from a launch page, choose a role, scan exhibits, talk to NPCs, collect clues, reconstruct a story, and reach an ending. The project also includes a profile page and leaderboard for recording final results.

## Live URL

The deployed web application is available at:

https://museum-tales.vercel.app/

## Source Code Repositories

- Final high-fidelity version: https://github.com/ViOLleTti/MuseumTales
- Low-fidelity / initial prototype: https://github.com/ViOLleTti/museum_tales_low_fidelity-

## User Flow

1. Launch page: plays a welcome animation and automatically enters role selection.
2. Role selection: players choose one of four narrative perspectives.
3. Home: shows the current role, task hints, clue progress, and activity log.
4. Chat / NPC: players tap different NPCs to trigger dialogue and gain role-specific clues based on the most recently scanned exhibit.
5. Scan: uses MindAR to identify exhibit target images and grant scan clues.
6. Story reconstruction: once enough clues are collected, players complete a fill-in reconstruction challenge.
7. Ending page: shows the story result, score grade, and ranking submission option.
8. Profile: shows the player nickname, latest result, and global or role leaderboard.

## Main Features

- Core feature 1, AR exhibit scanning: users scan museum exhibit targets to unlock exhibit observations, clue keywords, and scan-based progress.
- Core feature 2, NPC dialogue: after scanning, users talk to different NPCs. Valid role-exhibit-NPC combinations unlock additional story clues.
- Core feature 3, multiple endings: different clue combinations unlock different story outcomes. Players reconstruct a story and receive an ending with score, grade, and leaderboard submission.
- Four player roles: History Archivist, Global Buddy, Press Fellow, and Gallery Guide.
- Eight exhibit recognition targets mapped to exhibit IDs `E1` to `E8`.
- Three NPCs: History Archivist, British Exchange Student, and Security Guard.
- A clue system split between scan clues and NPC dialogue clues, with rules maintained in `src/lib/narrative-rules.json`.
- English-first UI with the existing Chinese/English language toggle preserved.
- Zustand stores the current run state, including role, scanned exhibits, collected clues, dialogue log, and viewed endings.
- Supabase stores anonymous players and submitted runs for leaderboard generation.
- MindAR and A-Frame provide browser-based AR image recognition.

## Responsive Design

The interface is designed with a mobile-first approach for museum visits. The app uses a phone-sized layout, bottom navigation, large touch-friendly buttons, card-based sections, and vertically scrollable mobile panels. This makes the prototype suitable for smartphone interaction while users move through an exhibition space.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- Supabase
- MindAR / A-Frame
- Vercel Analytics

## Pages And Routes

| Route | Description |
| --- | --- |
| `/` | Launch page |
| `/role` | Role selection page |
| `/home` | Mission hub |
| `/npc` | NPC dialogue page |
| `/scan` | AR exhibit scanning page |
| `/reconstruct/[storyId]` | Story reconstruction page |
| `/end/[storyId]` | Ending page |
| `/profile` | Profile and leaderboard page |

## API

| Route | Method | Description |
| --- | --- | --- |
| `/api/player/init` | POST | Creates an anonymous player. Nicknames must use 2-10 English letters. |
| `/api/run/submit` | POST | Submits the story result, duration, score, and collected clue data for the current run. |
| `/api/leaderboard` | GET | Fetches the global leaderboard, role leaderboard, or bundled leaderboard data. |

## Data Handling

The system manages both local interaction state and server-side leaderboard data.

- Local gameplay state is stored with Zustand, including selected role, scanned exhibits, collected clues, dialogue history, and viewed endings.
- Browser storage is used for temporary run tracking, player ID, nickname, and the latest submitted result.
- Supabase stores anonymous players and submitted story runs, including score, grade, duration, collected clue IDs, and scanned exhibit IDs.
- The profile page retrieves global and role-based leaderboard data through Next.js API routes.
- The ending page submits completed runs to the backend only after the player enters a valid nickname.

## Local Development

```bash
npm install
npm run dev
```

After the development server starts, visit `http://localhost:3000`.

Useful commands:

```bash
npm run build
npm run start
npm run lint
```

## Environment Variables

Leaderboard and player submission features depend on Supabase. Configure `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is used for server-side leaderboard writes and queries. If it is not configured, the code falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## AR Assets

The scan page loads:

- `/vendor/aframe.min.js`
- `/vendor/mindar-image-aframe.prod.js`
- `/targets/targets.mind`

Place exhibit target images in `public/targets/`. Filenames must match the configuration in `src/lib/narrative-rules.json`:

| File | Exhibit ID | Exhibit |
| --- | --- | --- |
| `plate.jpeg` | `E1` | Peking University School of Pharmacy Commemorative Plate |
| `coin.jpeg` | `E2` | CUHK-Shenzhen Commemorative Coin |
| `silk.jpeg` | `E3` | Silk Textile |
| `elephant.jpeg` | `E4` | Mingzhou Yue Kiln Celadon Elephant |
| `chess.jpeg` | `E5` | Chess Set |
| `horses.jpeg` | `E6` | Qin Dynasty Chariot from Xi'an Jiaotong University |
| `calligraphy.jpeg` | `E7` | Handwritten Celebration Calligraphy |
| `ship.jpeg` | `E8` | Canal Boat Model and Ceremonial Key |

It is recommended to compile the eight target images into `public/targets/targets.mind` before deployment. If `targets.mind` is missing, the current scanner component will show an initialization error, so the final deployed version should include that file.

## Project Structure

```text
src/app/                      Pages and API routes
src/components/               Shared UI and AR scanner components
src/lib/game-data.ts          Role and NPC metadata
src/lib/game-store.ts         Game state and current-run progress
src/lib/narrative-rules.json  Exhibit, clue, NPC trigger, and ending rules
src/lib/server/               Supabase server logic
src/lib/supabase/             Supabase server client setup
public/targets/               AR target images and targets.mind
public/vendor/                A-Frame and MindAR scripts
ai-logs/                      Primary AI-assisted development prompts
```

## Notes

- The project is designed mainly for phone-sized screens and uses `phone-stage` and `phone-shell` to simulate a mobile display.
- AR scanning needs browser camera permission and should be tested on HTTPS or localhost.
- Narrative rules are driven by `narrative-rules.json`; add new exhibits, clues, or endings there first.
- Players must enter a valid English nickname on the ending page before submitting a leaderboard result.
- AI-assisted development prompts are documented in `ai-logs/`.
