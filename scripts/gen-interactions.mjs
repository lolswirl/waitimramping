// usage: node scripts/gen-interactions.mjs <class> <spec> <path to SimulationCraft SpellDataDump/<class>.txt> [--with-aura] [--with-hero] [--report]
// for example: node scripts/gen-interactions.mjs monk mistweaver ../simc/SpellDataDump/monk.txt
// reads the "Affected Spells" lists SimC dumps for every spell effect, keeps the edges between spells that
// exist in the spec's data files, adds the hand-written links from the spec's interactions.manual.json when
// it has one, and writes interactions.json next to it. the json holds spell ids and links only; names and
// icons are read from the spec's data when the chart loads, so they can't drift from it
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [className, specName, dumpPath] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
if (!className || !specName || !dumpPath) {
    console.error("usage: node scripts/gen-interactions.mjs <class> <spec> <path to <class>.txt>, e.g. monk mistweaver ...");
    process.exit(1);
}

// "monk mistweaver" lives in src/data/specs/monk/mistweaver, with the class's shared spells and talents beside it
const classDir = `src/data/specs/${className}`;
const specDir = `${classDir}/${specName}`;
if (!existsSync(join(root, specDir))) {
    console.error(`no data folder at ${specDir}`);
    process.exit(1);
}

const DATA_FILES = [`${classDir}/talents.ts`, `${classDir}/spells.ts`, `${specDir}/talents.ts`, `${specDir}/spells.ts`, `${specDir}/buffs.ts`].filter((file) =>
    existsSync(join(root, file)),
);

const manualPath = join(root, `${specDir}/interactions.manual.json`);
const manual = {
    aliases: {},
    extraNodes: [],
    links: [],
    ...(existsSync(manualPath) ? JSON.parse(readFileSync(manualPath, "utf8")) : {}),
};
const siteSpells = new Map();
const heroIds = new Set();
const entry = /name:\s*(["'`])(.+?)\1,\s*id:\s*(\d+),\s*icon:\s*(["'`])(.+?)\4/g;
for (const file of DATA_FILES) {
    const text = readFileSync(join(root, file), "utf8");
    const found = [...text.matchAll(entry)];
    found.forEach((m, i) => {
        // an entry can carry a display name for a variant of another spell, which should stay its own node
        const body = text.slice(m.index, found[i + 1]?.index ?? text.length);
        const display = body.match(/display:\s*\{\s*name:\s*(["'`])(.+?)\1/);
        const name = display ? display[2] : m[2];
        siteSpells.set(Number(m[3]), { id: Number(m[3]), name, icon: m[5] });
        if (/heroTalent:/.test(body)) heroIds.add(Number(m[3]));
    });
}

const dump = readFileSync(dumpPath, "utf8").replace(/\r/g, "");
const build = readFileSync(join(dirname(dumpPath), "build_info.txt"), "utf8")
    .split("\n")[0]
    .trim();

const MODIFIER = /(?:Add (?:Percent|Flat) Modifier(?: w\/ Label)?|Modify [^(|]*?)\s*\(\d+\):\s*([^(|]+)/;

const edges = new Map();
for (const block of dump.split(/\n(?=Name\s*: )/)) {
    const header = block.match(/^Name\s*:\s*.*?\(id=(\d+)\)/);
    if (!header) continue;
    const from = Number(header[1]);
    if (!siteSpells.has(from)) continue;

    let kind = "";
    for (const line of block.split("\n")) {
        const effect = line.match(/^#\d+ \(id=\d+\)\s*:\s*(.*)$/);
        if (effect) {
            const modifier = effect[1].match(MODIFIER);
            kind = modifier
                ? modifier[1].trim()
                : effect[1]
                      .split("|")[0]
                      .replace(/\s*\(\d+\)\s*$/, "")
                      .trim();
            continue;
        }
        const affected = line.match(/^\s+Affected Spells:\s*(.*)$/);
        if (!affected) continue;
        for (const m of affected[1].matchAll(/\((\d+)\)/g)) {
            const to = Number(m[1]);
            if (to === from || !siteSpells.has(to)) continue;
            const key = `${from}>${to}`;
            const kinds = edges.get(key) ?? new Set();
            kinds.add(kind);
            edges.set(key, kinds);
        }
    }
}

// "Apply Aura" alone only says one spell applies an aura that touches another, not what it changes, and
// adding them (--with-aura) makes the chart much denser, so they are left out by default. A source with
// many modifier links is a broad modifier that would bury the real links, so it is left out too
const MAX_TARGETS = 6;
const AURA = "Apply Aura";
const withAura = process.argv.includes("--with-aura");
const all = [...edges].map(([key, kinds]) => {
    const [from, to] = key.split(">").map(Number);
    return { from, to, kinds: [...kinds].filter((k) => withAura || k !== AURA).sort() };
});
const specific = all.filter((l) => l.kinds.some((k) => k !== AURA));
const fanOut = new Map();
for (const l of specific) fanOut.set(l.from, (fanOut.get(l.from) ?? 0) + 1);
const broad = new Set([...fanOut].filter(([, count]) => count > MAX_TARGETS).map(([id]) => id));
const links = all.filter((l) => l.kinds.length > 0 && !broad.has(l.from));

// the same spell can exist twice in the data files (a talent and its spell), so every id is folded onto
// one per name, the first one found
const extraNodes = new Map(manual.extraNodes.map((n) => [n.name, n]));
const canonical = new Map();
for (const s of siteSpells.values()) {
    if (!canonical.has(s.name)) canonical.set(s.name, s.id);
}
// spells that are the same thing on the chart, such as a cleave that is just part of the spell it comes from
for (const [alias, target] of Object.entries(manual.aliases ?? {})) canonical.set(alias, canonical.get(target));
const canonicalId = (id) => canonical.get(siteSpells.get(id).name);

const merged = new Map();
const add = (from, to, kinds) => {
    if (from === to) return;
    const key = `${from}>${to}`;
    const existing = merged.get(key) ?? new Set();
    for (const k of kinds) existing.add(k);
    merged.set(key, existing);
};
for (const l of links) add(canonicalId(l.from), canonicalId(l.to), l.kinds);

// hand-written links for interactions SimC doesn't express as a spell-data modifier
const missing = new Set();
const resolve = (name) => {
    const id = extraNodes.get(name)?.id ?? canonical.get(name);
    if (id === undefined) missing.add(name);
    return id ?? null;
};
// manual links that simc already produces, same spell to same spell, so the manual file doesn't need them
const redundant = [];
for (const [from, to] of manual.links) {
    const a = resolve(from);
    const b = resolve(to);
    if (a === null || b === null) continue;
    if ([...(merged.get(`${a}>${b}`) ?? [])].some((kind) => kind !== "Manual")) redundant.push([from, to]);
    add(a, b, ["Manual"]);
}
if (missing.size > 0) {
    console.error(`not in the data files: ${[...missing].join(", ")}`);
    process.exit(1);
}

// hero talents are left out by default (--with-hero keeps them) to keep the chart small
const withHero = process.argv.includes("--with-hero");
const isHero = (id) => heroIds.has(id);
const allLinks = [...merged]
    .map(([key, kinds]) => {
        const [from, to] = key.split(">").map(Number);
        return { from, to, kinds: [...kinds].sort() };
    })
    .filter((l) => withHero || !(isHero(l.from) || isHero(l.to)));
const droppedHero = new Set([...merged.keys()].flatMap((k) => k.split(">").map(Number)).filter((id) => heroIds.has(id)));
if (!withHero) console.log(`left out as hero talents: ${[...droppedHero].map((id) => siteSpells.get(id).name).join(", ")}`);
const used = new Set(allLinks.flatMap((l) => [l.from, l.to]));
const extraById = new Map([...extraNodes.values()].map((n) => [n.id, n]));
const nameOf = (id) => (extraById.get(id) ?? siteSpells.get(id)).name;
const spellIds = [...used].filter((id) => !extraById.has(id)).sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
const extraUsed = [...used].filter((id) => extraById.has(id)).map((id) => extraById.get(id));
const nodes = [...spellIds, ...extraUsed];

const out = { source: build, nodes: spellIds, extraNodes: extraUsed, links: allLinks };
writeFileSync(join(root, `${specDir}/interactions.json`), `${JSON.stringify(out, null, 2)}\n`);
console.log(
    `${build}\n${siteSpells.size} site spells, ${nodes.length} nodes, ${allLinks.length} edges (${links.length} from SimC, ${manual.links.length} manual)`,
);

if (process.argv.includes("--report")) {
    const name = (id) => siteSpells.get(id).name;
    console.log(`
manual links simc already produces (${redundant.length}):`);
    for (const [from, to] of redundant) console.log(`  ${from} -> ${to}`);
    console.log(`\nbroad modifiers, left out (${broad.size}):`);
    for (const id of broad) {
        const targets = specific.filter((l) => l.from === id).map((l) => `${name(l.to)} [${l.kinds.join(", ")}]`);
        console.log(`  ${name(id)} (${id}) -> ${targets.join("; ")}`);
    }
}
