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
    SAVORY_DEVIATE_DELIGHT: {
        name: "Savory Deviate Delight",
        id: 6657,
        icon: "inv_misc_monsterhead_04",
    },
    SPECTRAL_GROG: {
        name: "Spectral Grog",
        id: 104316,
        icon: "inv_drink_31_embalmingfluid",
    },
    ATOMIC_RECALIBRATOR: {
        name: "Atomic Recalibrator",
        id: 198173,
        icon: "inv_mechacycle",
    },
    EFFIGY_OF_DUNDUN: {
        name: "Effigy of Dundun",
        id: 276189,
        icon: "icon_upgradestone_critter_uncommon",
    },
    BLUBBERY_MUFFIN: {
        name: "Blubbery Muffin",
        id: 197767,
        icon: "inv_misc_food_148_cupcake",
    },
} satisfies Record<string, spell>;

export default items;
export { items as ITEMS };