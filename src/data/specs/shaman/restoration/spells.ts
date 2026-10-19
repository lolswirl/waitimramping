import type spell from "@data/spells/spell";
import { CATEGORY } from "@data/spells/spell";

const spells = {
    RIPTIDE: {
        name: "Riptide",
        id: 61295,
        icon: "spell_nature_riptide",
        castTime: 0,
        category: CATEGORY.HEALING,
    },
    HEALING_RAIN: {
        name: "Healing Rain",
        id: 73920,
        icon: "spell_nature_giftofthewaterspirit",
        castTime: 2,
        category: CATEGORY.COOLDOWN,
    },
    SURGING_TOTEM: {
        name: "Surging Totem",
        id: 444995,
        icon: "inv_ability_totemicshaman_surgingtotem",
        castTime: 0,
        category: CATEGORY.COOLDOWN,
    },
    DOWNPOUR: {
        name: "Downpour",
        id: 462486,
        icon: "ability_mage_waterjet",
        castTime: 0,
        category: CATEGORY.HEALING,
    },
    EARTH_SHIELD: {
        name: "Earth Shield",
        id: 974,
        icon: "spell_nature_skinofearth",
        castTime: 0,
        category: CATEGORY.HEALING,
    },
    CHAIN_HEAL: {
        name: "Chain Heal",
        id: 1064,
        icon: "inv_1115_shaman_chainheal",
        castTime: 2.5,
        category: CATEGORY.HEALING,
    },
    HEALING_WAVE: {
        name: "Healing Wave",
        id: 77472,
        icon: "spell_nature_healingwavelesser",
        castTime: 2.5,
        category: CATEGORY.HEALING,
    },
    NATURES_SWIFTNESS: {
        name: "Nature's Swiftness",
        id: 378081,
        icon: "spell_nature_ravenform",
        castTime: 0,
        gcd: false,
        category: CATEGORY.COOLDOWN,
    },
    UNLEASH_LIFE: {
        name: "Unleash Life",
        id: 73685,
        icon: "spell_shaman_unleashweapon_life",
        castTime: 0,
        category: CATEGORY.COOLDOWN,
    },
    HEALING_STREAM_TOTEM: {
        name: "Healing Stream Totem",
        id: 5394,
        icon: "inv_spear_04",
        castTime: 0,
        category: CATEGORY.HEALING,
    },
    SPIRIT_LINK_TOTEM: {
        name: "Spirit Link Totem",
        id: 98008,
        icon: "spell_shaman_spiritlink",
        castTime: 0,
        category: CATEGORY.COOLDOWN,
    },
    ASCENDANCE: {
        name: "Ascendance",
        id: 114049,
        icon: "spell_fire_elementaldevastation",
        castTime: 0,
        category: CATEGORY.COOLDOWN,
    },
    HEALING_TIDE_TOTEM: {
        name: "Healing Tide Totem",
        id: 108280,
        icon: "ability_shaman_healingtide",
        castTime: 0,
        category: CATEGORY.COOLDOWN,
    },
    FLAME_SHOCK: {
        name: "Flame Shock",
        id: 188389,
        icon: "spell_fire_flameshock",
        castTime: 0,
        category: CATEGORY.DAMAGE,
    },
    LAVA_BURST: {
        name: "Lava Burst",
        id: 51505,
        icon: "spell_shaman_lavaburst",
        castTime: 0,
        category: CATEGORY.DAMAGE,
    },
    WATER_SHIELD: {
        name: "Water Shield",
        id: 52127,
        icon: "ability_shaman_watershield",
        castTime: 0,
        category: CATEGORY.OTHER,
    },
    STORMSTREAM_TOTEM: {
        name: "Stormstream Totem",
        id: 1267068,
        icon: "inv12_apextalent_shaman_stormstreamtotem",
        castTime: 0,
        category: CATEGORY.HEALING,
    },
} satisfies Record<string, spell>;

export default spells;
export { spells as RESTORATION_SHAMAN_SPELLS };
