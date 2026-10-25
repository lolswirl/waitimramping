# interaction charts

the flowchart on `/analysis/interactions`: which spells and talents modify which. one chart per spec, built from
simulationcraft's spell data plus a hand-written list for what spell data can't express.

## how it fits together

| file | what it is |
| --- | --- |
| `scripts/gen-interactions.mjs` | the generator. reads simc's spell dump and your spec data, writes `interactions.json` |
| `src/data/specs/<class>/<spec>/interactions.manual.json` | optional, hand-written. extra links, chart-only nodes, merged spells |
| `src/data/specs/<class>/<spec>/interactions.json` | generated. spell ids and links only. don't edit by hand |
| `src/data/interactions/index.ts` | `getInteractions(spec)`. fills in names and icons from the spell data for the spec's `interactions` |
| `src/data/interactions/types.ts` | the shapes of the stored and resolved chart |
| `app/analysis/interactions/Interactions.tsx` | the page. lays the chart out and draws it |

`interactions.json` stores ids, not names or icons. the registry looks those up in `spells.ts` / `talents.ts` when
the page loads, so renaming a spell or changing its icon there shows up in the chart with no rerun. you only rerun
the generator when links or spells are added or removed.

## generate a chart for a spec

1. get a simc spell dump. it's `SpellDataDump/<class>.txt` in the simulationcraft repo. the generator also reads
   `build_info.txt` from that folder, since its first line is shown under the chart. it always reads that file, so a
   `_ptr` dump would be labelled with the live build.
2. run it:

```
node scripts/gen-interactions.mjs <class> <spec> <path to <class>.txt>

node scripts/gen-interactions.mjs monk mistweaver ../simc/SpellDataDump/monk.txt
```

   `<class>` and `<spec>` are the folder names under `src/data/specs`, so `monk mistweaver` reads
   `src/data/specs/monk/mistweaver`. it also reads the class-level `talents.ts` and `spells.ts` one folder up.
3. put it on the spec object, in the spec's `index.ts` next to `spells` and `talents`:

```ts
import type { StoredInteractions } from '@data/interactions/types';
import MISTWEAVER_MONK_INTERACTIONS from '@data/specs/monk/mistweaver/interactions.json';

const MISTWEAVER_MONK = ({
  ...
  interactions: MISTWEAVER_MONK_INTERACTIONS as StoredInteractions,
} satisfies specialization)
```

a spec with no `interactions` shows "there's no interaction chart for ... yet", so a spec can ship whenever it's
ready.

flags:

| flag | does |
| --- | --- |
| `--report` | also prints the broad modifiers that were left out, with everything they touch |
| `--with-aura` | keeps plain "Apply Aura" links, drawn dashed. it made the mistweaver chart a wall of lines, so it's off |
| `--with-hero` | keeps hero talents, which are left out by default to keep the chart small |

## what the generator keeps

simc lists, for every spell effect, the spells it affects ("Affected Spells"). the generator turns each into a link
from the spell with the effect to the spell it changes, then:

- keeps only links where both spells exist in your data files (class and spec `talents.ts`, `spells.ts`, `buffs.ts`)
- drops a link whose only effect is "Apply Aura", since it says a spell applies something but not what changes
- drops a spell that modifies more than 6 spells ("broad modifier"), since it buries the real links. `--report`
  shows what that removed
- drops anything marked `heroTalent` in your data
- merges entries with the same name into one node. an entry with a `display.name` counts as that name instead, which
  is how a variant (a spiritfont copy, a statue's cast) stays its own node

spec data is read with regular expressions, not imported, so an entry has to look like
`name: "...", id: 123, icon: '...'` in that order to be seen.

## the manual file

simc only knows spell-data modifiers. procs, "after you cast X your next Y" and anything done in code won't be there,
so the interesting links go in `interactions.manual.json`. it's optional; without one the chart is simc only, which
is thin (holy paladin came out as 11 spells and 12 links).

```json
{
    "aliases": { "Blackout Kick (Cleave)": "Blackout Kick" },
    "extraNodes": [
        { "id": -1, "name": "Critical Strike", "iconUrl": "/icons/attribute_criticalstrike.svg" },
        { "id": -3, "name": "Chi Cocoon (Yu'lon / Chi-Ji)", "spellIds": [406139, 406220] }
    ],
    "links": [
        ["Thunder Focus Tea", "Renewing Mist"],
        ["Renewing Mist", "Gust of Mists"]
    ]
}
```

- **links**: `[from, to]` by name, as the arrow reads "from affects to". names are the ones in your data files,
  including `display.name`. a name that isn't found stops the generator and lists it.
- **extraNodes**: chart-only nodes, with a negative id so they can't clash with a spell id. give either an
  `iconUrl` (a stat icon, say) or two `spellIds`, which are drawn as one icon cut along the diagonal using those
  spells' icons.
- **aliases**: folds one name onto another so they are the same node, for example a cleave that is just part of the
  spell it comes from.

link wording that has worked well:

- point at the thing that causes an effect, not the spell you cast. if an effect only happens because of a talent,
  route it through that talent (`Thunder Focus Tea -> Emperor's Elixir -> Soothing Mist`), so hovering the spell
  doesn't suggest it always does that.
- a proc chain reads best as `cast -> talent -> result`.

## icons

spell icons are `public/icons/<icon>.png`. a new spell's icon that isn't there yet falls back to wowhead, so it
still shows. run your icon script (`wowutil/icon_retrieval`) to make them local. stat icons for chart-only nodes are
svgs saved under `public/icons` and named by `iconUrl`.

## checking a new chart

- rerun the generator after adding spells to your data. if the chart is missing a spell, the browser console warns
  `interactions: spell <id> is not in the spell or talent data`.
- the chart is laid out in the browser by elkjs (`Interactions.tsx`); a spell that links to nothing else is moved up
  next to the main chart rather than left in a corner.
