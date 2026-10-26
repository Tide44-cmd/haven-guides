# Haven Guide

Static GitHub Pages website, containing the interactive **The Darkness (Xbox 360)** walkthrough.

## Deploy to GitHub Pages

Upload the contents of this ZIP **to the root of your `haven-guide` repository**, preserving the folder structure. Your repository is currently publishing from `master` → `/ (root)`; **leave this setting as-is**. Commit the files and GitHub Pages will publish them.

Expected URLs:
- Homepage: `https://tide44-cmd.github.io/haven-guide/`
- The Darkness: `https://tide44-cmd.github.io/haven-guide/guides/the-darkness/`

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

**Note:** Opening `index.html` directly from your file system can prevent JSON loads in some browsers. Use GitHub Pages or a local web server for testing.

The source chapter text is taken from the supplied checklist, and not every game location has been independently checked. This website does not claim to be an officially licensed game guide.
