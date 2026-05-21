# Whispr

Turn **text**, **voice memos**, or **audio/PDF/DOCX uploads** into a multi-chapter audiobook with AI narration.

## Stack

- **App:** Expo + **React Native dev build** (not Expo Go), Expo Router, NativeWind
- **API:** Express, Prisma (SQLite), OpenAI (Whisper + GPT + TTS)

## Do not use Expo Go

This app uses **native modules** (Google Sign-In, etc.). Install a **development build** on your device:

```bash
npm install
npm run android    # first time: generates android/ and installs the app (~5–15 min)
npm run api        # separate terminal — backend on port 3000
npm start          # Metro for dev client (not Expo Go)
```

Open the **Whispr** app installed on your phone/emulator — not the Expo Go scanner app.

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# OPENAI_API_KEY, JWT_SECRET, GOOGLE_WEB_CLIENT_ID (same as app web client)
npm install
npx prisma migrate dev --name init
npm run dev
```

### 2. App environment (repo root)

```bash
cp .env.example .env
```

| Variable | Example |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | `http://192.168.1.9:3000/api` (your PC Wi‑Fi IP — `ipconfig`) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Web OAuth client from Google Cloud |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Android OAuth client (package `com.anonymous.whispr` + SHA-1) |

Phone and PC must be on the **same Wi‑Fi** (not LTE only).

**USB debugging:** `adb reverse tcp:3000 tcp:3000` then `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000/api` and `EXPO_PUBLIC_API_USE_ENV_ONLY=1`.

### 3. First native build (Android)

Requirements: [Android Studio](https://developer.android.com/studio) (SDK), JDK 17, device or emulator.

```bash
npm run android
```

Rebuild after changing native plugins or `app.config.js`:

```bash
npm run prebuild:clean
npm run android
```

### 4. Google Sign-In (native)

1. [Google Cloud Console](https://console.cloud.google.com/) → OAuth clients  
2. **Web client** → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` + `GOOGLE_WEB_CLIENT_ID` (backend)  
3. **Android client** → package `com.anonymous.whispr` + **SHA-1** of your debug keystore:

```bash
cd android && ./gradlew signingReport
```

Copy `SHA1` under `Variant: debug` into the Android OAuth client.

4. Optional local bypass: `DEV_AUTH_BYPASS=1` in `backend/.env`

## Daily development

| Terminal | Command |
|----------|---------|
| API | `npm run api` |
| App | `npm start` then open **Whispr** on device |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run android` | Build & install native Android app |
| `npm run ios` | Build & install native iOS app (macOS + Xcode) |
| `npm start` | Metro with **dev client** |
| `npm run prebuild` | Generate `android/` / `ios/` |
| `npm run api` | Backend watch mode |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `RNGoogleSignin could not be found` | You opened **Expo Go** — use `npm run android` and the installed Whispr app |
| Cannot reach API | Same Wi‑Fi; fix `EXPO_PUBLIC_API_URL`; not `127.0.0.1` on Wi‑Fi without `adb reverse` |
| Google sign-in failed (Android) | Add debug SHA-1 to Android OAuth client |

## Production notes

- Use `eas build` for store builds
- Replace SQLite with PostgreSQL for production
- Disable `DEV_AUTH_BYPASS`
