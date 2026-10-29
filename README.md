# Haven Guide

Static GitHub Pages website containing interactive guides for **The Darkness**, **State of Decay 2**, and **Dead by Daylight**.

## Deploy to GitHub Pages

The repository publishes from `master` → `/ (root)` through GitHub Pages. Commit changes to `master` and GitHub Pages will publish them.

Expected URLs:
- Homepage: `https://tide44-cmd.github.io/haven-guides/`
- The Darkness: `https://tide44-cmd.github.io/haven-guides/guides/the-darkness/`
- State of Decay 2: `https://tide44-cmd.github.io/haven-guides/guides/state-of-decay-2/`
- Dead by Daylight DLC tracker: `https://tide44-cmd.github.io/haven-guides/guides/dead-by-daylight-dlc/`

## New guides

1. Add `guides/new-game/index.html` (plus any extra scripts and data).
2. Add a new object in `games.json` with a title, platform, year, description, URL and tag. The homepage automatically generates a game tile.

## Current features

- Larger, original-style cards, typography, task spacing and checklist format
- Warning triangles on especially missable tasks
- Phone numbers at top in two independent, collapsible sections (73 collectibles and 18 Keeper of Secrets)
- Progress stored automatically with `localStorage`
- Export / import progress to move browsers, reset progress, incomplete-only filter
- **Compatible with existing tracker progress**, if old tracker was previously on the same GitHub Pages domain (reuses `darkness-tracker-v1` localStorage key and original checkbox IDs)
- State of Decay 2 completion route with locally saved playthrough objectives
- Dead by Daylight DLC ownership tracker with search, filters and a catalogue maintained in `dlc.json`

**Note:** Opening `index.html` directly from your file system can prevent JSON loads in some browsers. Use GitHub Pages or a local web server for testing.

The source chapter text is taken from the supplied checklist, and not every game location has been independently checked. The Darkness page credits the GameFAQs walkthrough used for supporting route and phone-number details. This website does not claim to be an officially licensed game guide.
