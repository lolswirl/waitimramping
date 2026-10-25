import SPELLS from "@data/spells";
import TALENTS from "@data/talents";
import type spell from "@data/spells/spell";
import type { specialization } from "@data/class";
import type { InteractionData, InteractionNode, StoredInteractions } from "./types";

export type { InteractionData, InteractionLink, InteractionNode, StoredInteractions } from "./types";

const spellsById = new Map<number, spell>();
for (const s of [...Object.values(SPELLS), ...Object.values(TALENTS)] as spell[]) {
    if (!spellsById.has(s.id)) spellsById.set(s.id, s);
}

const resolve = (stored: StoredInteractions, withHero: boolean): InteractionData => {
    const hero = new Set(stored.heroNodes);
    const nodes: InteractionNode[] = [];
    for (const id of stored.nodes) {
        if (!withHero && hero.has(id)) continue;
        const found = spellsById.get(id);
        if (!found) {
            console.warn(`interactions: spell ${id} is not in the spell or talent data, rerun scripts/gen-interactions.mjs`);
            continue;
        }
        nodes.push({ id, name: found.display?.name ?? found.name, icon: found.display?.icon ?? found.icon });
    }
    for (const extra of stored.extraNodes) {
        const [first, second] = (extra.spellIds ?? []).map((id) => spellsById.get(id)?.icon ?? "");
        nodes.push({
            id: extra.id,
            name: extra.name,
            icon: first ?? "",
            iconUrl: extra.iconUrl,
            splitIcons: first && second ? [first, second] : undefined,
        });
    }
    const ids = new Set(nodes.map((n) => n.id));
    const links = stored.links.filter((l) => ids.has(l.from) && ids.has(l.to));
    // switching hero talents off can leave a spell whose only links were to them, which would float on its own
    const linked = new Set(links.flatMap((l) => [l.from, l.to]));
    return { source: stored.source, nodes: nodes.filter((n) => linked.has(n.id)), links };
};

// kept per spec and hero setting so the chart gets the same object back, which the page uses to know nothing changed
const resolved = new WeakMap<StoredInteractions, Record<"with" | "without", InteractionData>>();

// a spec with no `interactions` on it has no chart yet
export const getInteractions = (spec: specialization, withHero: boolean): InteractionData | undefined => {
    if (!spec.interactions) return undefined;
    let cached = resolved.get(spec.interactions);
    if (!cached) {
        cached = { with: resolve(spec.interactions, true), without: resolve(spec.interactions, false) };
        resolved.set(spec.interactions, cached);
    }
    return withHero ? cached.with : cached.without;
};
