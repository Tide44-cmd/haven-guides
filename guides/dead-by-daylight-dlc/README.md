# Updating the Dead by Daylight trackers

The page has two independent trackers:

- `dlc.json` controls the DLC collection.
- `achievements.json` controls the achievement list, filters and character counts.
- `characters.json` optionally adds a nicer display name or portrait to a character tile.

Progress is saved in the visitor's browser. Exported backups contain both DLC ownership and earned achievements.

## Add or edit an achievement

Each entry in `achievements.json` is a plain object:

```json
{
  "id": "a-stable-unique-id",
  "name": "Achievement name",
  "role": "Killer",
  "character": "The Example",
  "map": "",
  "dlc": "New Chapter",
  "description": "The current in-game requirement."
}
```

Use `Killer`, `Survivor` or `Misc` for `role`. Leave `character` or `map` as an empty string when there is no specific requirement. Keep an existing `id` unchanged when editing an achievement because saved progress is linked to it. For a new achievement, use a short lowercase ID with words separated by hyphens.

Add new entries before the closing `]`, put a comma after the previous entry, and keep the JSON valid. The filters and totals update automatically.

## Add a character portrait

Character tiles are created automatically from `achievements.json`. To add a portrait or friendlier label, add an entry to `characters.json` whose key exactly matches the achievement character:

```json
{
  "The Example": {
    "label": "The Example (Character Name)",
    "image": "https://example.com/portrait.jpg"
  }
}
```

Characters without image metadata use a styled initials tile, so portrait entries are optional.

The portrait catalogue is sourced from the community wiki’s [Killer](https://deadbydaylight.fandom.com/wiki/Killers) and [Survivor](https://deadbydaylight.fandom.com/wiki/Survivors) tables, with newer characters supplied from [Dead by Daylight Wiki on wiki.gg](https://deadbydaylight.wiki.gg/wiki/Characters). Fandom portrait URLs deliberately stop at `.png`, without the wiki revision suffix.

To refresh every portrait after the wiki adds characters, run this from the repository root:

```text
node guides/dead-by-daylight-dlc/update-portraits.mjs
```

The updater preserves records marked with `"source": "wiki.gg"`, so the newer portraits are not replaced by older wiki data. Review `characters.json`, then commit both changed files to `master` as normal.

## Add DLC

The tracker reads its catalogue from `dlc.json`. No HTML or JavaScript changes are needed when a new DLC releases.

Add one object before the closing `]`:

```json
{ "name": "New Chapter Name", "licensed": true }
```

Use `true` for licensed crossover content and `false` for original Dead by Daylight content. Remember to add a comma after the previous object, keep the JSON valid, then commit the changed `dlc.json` to `master`.

Ownership is stored against the DLC name, so avoid renaming an existing entry unless its displayed title is genuinely wrong.
