# Haven Guide

A mobile-friendly, standalone guide hub. The first guide is an interactive tracker for **The Darkness** on Xbox 360.

## Included

- Homepage with a tile linking to The Darkness guide
- Original chapter-by-chapter achievement checklist
- 73 collectible telephone numbers
- 18 Keeper of Secrets numbers
- Local progress saving for every tracker
- Progress export/import
- Responsive layout with no dependencies or build step

## Open locally

Keep all files together and open `index.html` in a browser.

## Publish with GitHub Pages from `master`

1. Upload `index.html`, `darkness.html`, `styles.css`, `darkness.js`, and this `README.md` to the root of the `haven-guide` repository.
2. Make sure the files are committed to the `master` branch.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Choose **master** and **/(root)**, then select **Save**.
6. GitHub will show the public site URL when deployment finishes.

## Progress storage

Progress is saved in the browser on the current device using `localStorage`. It does not sync automatically between browsers or devices. Use **Export progress** and **Import progress** on the Darkness page to transfer it.

## Note

The achievement route is preserved from the original tracker. Some location details have not been independently verified against a primary walkthrough.
