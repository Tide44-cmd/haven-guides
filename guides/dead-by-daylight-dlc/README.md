# Updating the Dead by Daylight DLC list

The tracker reads its catalogue from `dlc.json`. No HTML or JavaScript changes are needed when a new DLC releases.

Add one object before the closing `]`:

```json
{ "name": "New Chapter Name", "licensed": true }
```

Use `true` for licensed crossover content and `false` for original Dead by Daylight content. Remember to add a comma after the previous object, keep the JSON valid, then commit the changed `dlc.json` to `master`.

Ownership is stored against the DLC name, so avoid renaming an existing entry unless its displayed title is genuinely wrong.
