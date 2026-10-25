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

const resolve = (stored: StoredInteractions): InteractionData => {
    const nodes: InteractionNode[] = [];
    for (const id of stored.nodes) {
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
    return { source: stored.source, nodes, links: stored.links.filter((l) => ids.has(l.from) && ids.has(l.to)) };
};

// kept per spec so the chart gets the same object back, which the page uses to know nothing changed
const resolved = new WeakMap<StoredInteractions, InteractionData>();

// a spec with no `interactions` on it has no chart yet
export const getInteractions = (spec: specialization): InteractionData | undefined => {
    if (!spec.interactions) return undefined;
    let data = resolved.get(spec.interactions);
    if (!data) {
        data = resolve(spec.interactions);
        resolved.set(spec.interactions, data);
    }
    return data;
};
