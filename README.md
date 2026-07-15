# For Bhinni 🌸

A private, offline, PIN-locked app to keep everything about Bhinni in one calm little place — her likes and preferences, photos, important dates, and love notes.

Everything is stored **only on your phone** (IndexedDB), nothing is ever sent anywhere. There's no backend, no login, no internet needed once installed.

## How the APK gets built (no Android Studio needed)

This repo builds the Android APK using **GitHub Actions** — GitHub's free cloud servers do the heavy lifting, so your laptop never has to run Android Studio or Gradle.

### One-time setup

1. Create a new **private** GitHub repository (private, since this is personal).
2. Push this whole folder to it:
   ```bash
   cd for-bhinni
   git init
   git add .
   git commit -m "for bhinni"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. On GitHub, go to the **Actions** tab of your repo. A workflow called "Build Android APK" will start automatically (it runs on every push to `main`). It takes about 4–6 minutes.
4. When it finishes (green checkmark), click into that run → scroll to **Artifacts** → download `for-bhinni-apk`. Unzip it — inside is `app-debug.apk`.
5. Send that APK to your phone (Google Drive, WhatsApp to yourself, USB, whatever's easiest), open it, and tap install. You'll need to allow "install unknown apps" for whichever app you used to open it — Android will prompt you for this the first time.

### Making changes later

Just edit the files in `src/`, then:
```bash
git add .
git commit -m "update"
git push
```
GitHub Actions will automatically rebuild the APK. Grab the new one from the Actions tab the same way.

You can also manually trigger a build anytime from the **Actions** tab → "Build Android APK" → **Run workflow**.

## First launch

The app asks you to set a 4-digit PIN the first time you open it — that's the passcode that'll protect everything after. There's no "forgot PIN" recovery by design (nothing is stored on a server to recover it from), so pick something you'll remember.

## Backing up your data

Since everything lives only on your phone, go to **Home → ⚙ Settings → Export backup** every so often, especially before switching phones or reinstalling. It saves a `.json` file you can restore from later via **Settings → Restore from backup**.

## What's inside

- **Her Likes** — categorized preferences (food, movies, colors, gift ideas, anything you make a category for)
- **Gallery** — photos, stored locally, compressed automatically so they don't eat storage
- **Dates** — birthdays, anniversaries, any date, with a live countdown
- **Notes** — a running journal of small memories

## Tech stack

React + Vite for the UI, Capacitor to wrap it as a native Android app, IndexedDB for storage. No external servers, no analytics, no ads.
