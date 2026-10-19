import type spell from '@data/spells/spell';

const talents = {
    WHIRLING_ELEMENTS: {
        name: "Whirling Elements",
        id: 445024,
        icon: 'inv_10_enchanting2_elementalswirl_color1',
    },
    ELEMENTAL_OVERFLOW: {
        name: "Elemental Overflow", 
        id: 1239170,
        icon: 'misc_legionfall_shaman',
    },
    WIND_BARRIER: {
        name: "Wind Barrier",
        id: 445031,
        icon: 'spell_nature_eyeofthestorm',
    },
    CREATION_CORE: {
        name: "Creation Core",
        id: 383012,
        icon: 'inv_artifact_xp03',
    },
    TIDECALLERS_GUARD: {
        name: "Tidecaller's Guard",
        id: 457493,
        icon: 'inv_shield_1h_artifactstormfist_d_04',
    },
    ANCESTRAL_SWIFTNESS: {
        name: "Ancestral Swiftness",
        id: 443454,
        icon: 'inv_ability_farseershaman_ancestralswiftness',
    },
    SPOUTING_SPIRITS: {
        name: "Spouting Spirits",
        id: 279504,
        icon: 'spell_shaman_spiritlink',
    },
    LIVELY_TOTEMS: {
        name: "Lively Totems",
        id: 445034,
        icon: 'spell_fire_searingtotem',
    },
    TIDEWATERS: {
        name: "Tidewaters",
        id: 462424,
        icon: 'ability_shawaterelemental_split',
    },
    LAVA_SURGE: {
        name: "Lava Surge",
        id: 77756,
        icon: 'spell_shaman_lavasurge',
    },
    ACID_RAIN: {
        name: "Acid Rain",
        id: 378443,
        icon: 'spell_nature_acid_01',
    },
    REACTIVE_WARDING: {
        name: "Reactive Warding",
        id: 462454,
        icon: 'inv_10_elementalcombinedfoozles_water',
    },
    THERAZANES_RESILIENCE: {
        name: "Therazane's Resilience",
        id: 1217622,
        icon: 'shaman_pvp_rockshield',
    },
    SPLITSTREAM: {
        name: "Splitstream",
        id: 445035,
        icon: 'ability_rhyolith_lavapool',
    },
    STORMSWELL: {
        name: "Stormswell",
        id: 1268684,
        icon: "inv12_apextalent_shaman_stormstreamtotem",
    }
} satisfies Record<string, spell>;

export default talents;