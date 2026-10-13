# Tapza Care

A React Native CLI prototype for clinic patients, prepared as part of the React Native developer assignment for Potla Tech Solutions.

> **Project status:** Prototype using mock services. Replace the placeholders below and verify every listed feature against the final build before submitting.

## Repository contents

```text
.
├── App.tsx
├── src/
│   ├── api.ts
│   ├── config.ts
│   ├── i18n.ts
│   ├── theme.ts
│   └── components/
│       └── SectionRenderer.tsx
├── __tests__/
├── docs/
│   ├── README.md
│   ├── DEMO_SCRIPT.md
│   └── screenshots/             # Add real screenshots here
├── AI_LOG.md
├── README.md
└── README_SETUP.md              # Keep if supplied with the project
```

Update this structure to match the actual repository before submission.

## Requirements

- Node.js and npm
- Android Studio and Android SDK
- Java version compatible with the React Native version in this project
- Android emulator or physical Android device

## Setup and run

1. Clone this repository.
2. Follow `README_SETUP.md` if the project is supplied as source overlays rather than a complete React Native CLI project.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start Metro in one terminal:

   ```bash
   npm start
   ```

5. In another terminal, launch Android:

   ```bash
   npx react-native run-android
   ```

If `package.json` defines an `android` script, `npm run android` may be used instead. Follow the setup instructions in the repository if they differ.

## Architecture and decisions

- **Config-driven UI:** home sections are described by configuration so layouts and ordering can change without rewriting the screen.
- **Typed models:** TypeScript types describe the main config and domain data.
- **Mock API layer:** local mock functions imitate endpoint behavior and can simulate latency/failure without a live server.
- **Theme tokens:** component styling should use values derived from the active theme/config instead of duplicating colors.
- **Safe rendering:** unknown section types should be ignored rather than crashing the app.
- **Local config cache:** AsyncStorage stores the last known-good configuration for fallback when config loading fails.
- **Lightweight interactions:** React Native core `Animated` and `PanResponder` are used where implemented.

Confirm these decisions against the final code and remove anything that is not present.

## Implemented scope

Verify these against the final build and keep only features that work:
- Normal and festival/Diwali home configurations
- Dynamic theme and section ordering
- Doctor/service selection and date/slot selection
- Booking confirmation and failure handling
- Prescription details and marking doses as taken
- English/Hindi language toggle
- Loading, empty, and error states
- Demo controls for latency, forced failures, and empty prescriptions

## Tests and validation

Run the checks below from the project root and record the real outcome:

```bash
npx tsc --noEmit
npm test -- --runInBand
```

Do not report a check as passing unless it completed successfully. If tests are not configured or a command fails, document that accurately.

## Installable Android APK

Attach the tested APK to a GitHub Release and add its release URL here:

**APK download:** `REPLACE_WITH_GITHUB_RELEASE_URL`

Install steps:
1. Open the release link on the Android device.
2. Download the APK asset.
3. If Android prompts, allow installation from that source.
4. Open the downloaded APK and install it.
5. Launch Tapza Care.

Only share an APK built from the same commit as this repository's submitted source. Do not commit signing keys or secrets.

## Screenshots and demo

See [`docs/README.md`](docs/README.md) and [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md). Add genuine screenshots and a 2–3 minute recording under `docs/` before submitting.

## What was cut and why

This prototype intentionally uses mock services rather than a production backend. Authentication, real clinic data, real notification scheduling, offline booking queue, and deep links are not included unless implemented in the final branch. These would require backend/product decisions and additional integration work beyond the prototype scope.

Update this section to reflect the actual build; do not claim omitted features are implemented.

## Time spent

**Actual time spent:** `REPLACE_WITH_YOUR_HONEST_TOTAL_HOURS`

Include coding, debugging, testing, documentation, and demo recording if that is how you tracked your time. Do not estimate retrospectively as an exact number if you are unsure; use an honest approximate value.

## AI assistance

See [`AI_LOG.md`](AI_LOG.md) for an honest record of AI-assisted work and verification performed.

## Submission links

- GitHub repository: `REPLACE_WITH_REPOSITORY_URL`
- GitHub Release / APK: `REPLACE_WITH_RELEASE_URL`
- Demo video: `REPLACE_WITH_VIDEO_OR_REPO_PATH`
