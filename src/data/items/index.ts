import type spell from '@data/spells/spell';
import TIER from "@data/items/tier";

const items = {
    ...TIER,
    NEXUS_KINGS_COMMAND: {
        name: "Nexus-Kings Command",
        id: 242400,
        icon: 'inv_112_raidtrinkets_oathbindersauthority',
    },
    GLYPH_OF_FAELINE_STOMP: {
        name: "Glyph of Faeline Stomp",
        id: 217494,
        icon: "inv_glyph_minormonk",
    },
} satisfies Record<string, spell>;

export default items;
export { items as ITEMS };