# TBC Gear Inspector

A web app and companion WoW addon for looking up any TBC Anniversary character's equipped gear, stats, and GearScore.

## Web App

The web frontend is built with Next.js. Search for any character by name and realm, or link directly via `/character/{realm-slug}/{name}`.

### Setup

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000` by default.

### Environment

The app uses the Blizzard API and NextAuth. You'll need to configure the appropriate environment variables (see `.env.example` or your `.env.local`).

## WoW Addon

The companion addon adds a **"Copy Inspector URL"** option to right-click menus on player unit frames, chat names, guild roster entries, LFG listings, and more. It also supports a slash command.

### Installation

Copy the `addon/TBCInspector` folder into your WoW AddOns directory:

```
World of Warcraft/_anniversary_/Interface/AddOns/TBCInspector/
```

Or use the build script to create a zip for distribution (see below).

### Usage

- **Right-click any player** — a "Copy Inspector URL" menu option appears
- **LFG Browse** — hold the configured modifier key (default: Shift) and right-click an entry
- `/tbcinspect` — copy the Inspector URL for your current target
- `/tbcinspect <name>` — copy the URL for a character on your realm
- `/tbcinspect settings` — open the addon settings panel

### Settings

Open the addon settings via `/tbcinspect settings` or the Interface > AddOns menu. You can change which modifier key is required for the LFG Browse right-click hook (Shift, Ctrl, Alt, or None).

## Building an Addon Release

Run the build script to create a distributable zip:

```bash
./build-addon.sh
```

This produces `TBCInspector-<version>.zip` in the `dist/` directory, ready to upload as a release. The version is read from the `.toc` file automatically.
