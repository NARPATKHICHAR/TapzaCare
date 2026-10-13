# Tapza Care — React Native CLI 

This is a source overlay for a fresh React Native CLI TypeScript project. It includes a config-driven home, festival switch, mock API, booking flow, prescriptions/dose tracking, latency/failure controls, config caching, and basic tests.

## 1. Create the native project

```bash
npx @react-native-community/cli@latest init TapzaCare --version 0.82.0
cd TapzaCare
```

Copy the `App.tsx` and `src/` files from this archive into the generated project. Copy `AI_LOG.md`, `README.md`, and `__tests__/` as well.

## 2. Install the one runtime dependency

```bash
npm install @react-native-async-storage/async-storage react-native-linear-gradient
```

## 3. Run Android

Start an Android emulator in Android Studio Device Manager, then:

```bash
npm start
```

In another terminal:

```bash
npm run android
```

## 4. Tests and type checking

```bash
npm test -- --runInBand
npx tsc --noEmit
```

If the generated RN 0.82 template uses a different Jest preset/config, keep the template's config and adjust the test command only after checking `package.json`.

## Included requirements

- Two runtime configs: normal day and Diwali.
- Theme, tabs, ordered sections and per-section solid/gradient/image backgrounds.
- Unknown section types safely return `null`.
- Home sections: hero, category chips, quick actions, service grid, doctor carousel, offer strip.
- Scroll-responsive compact header and section entrance fade.
- Mock endpoints: config, doctors, slots, booking, prescriptions.
- Config cache with AsyncStorage fallback.
- Latency, forced failure and empty-prescription developer controls.
- Date selection and a PanResponder-driven slot sheet.
- Optimistic booking UI, then mock reconciliation and conflict/error handling.
- Prescription detail and morning/afternoon/night dose checklist.
- English/Hindi copy toggle (starter i18n layer).
- Config validation, section renderer and booking state tests.
- AI_LOG and honest limitations.

## Before submission

1. Run on an Android emulator/device and fix any environment-specific errors.
2. Add real screenshots/video under `docs/`.
3. Build and install an APK; attach it to a GitHub Release.
4. Commit in meaningful milestones, not as one final commit.
5. Verify visual contrast, font scaling and 44dp touch targets on device.

## Honest limitations in this starter

- Backend is in-memory and resets on app restart.
- No real clinic authentication, server persistence, real payment, or actual push/local notification scheduling.
- `bannerImageUrl` is represented in config but the starter falls back to gradients when no valid remote image is supplied.
- Demo date/slots are mock data. Expand the slot generator for arbitrary future dates before presenting a production claim.
