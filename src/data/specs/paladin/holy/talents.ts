import type spell from '@data/spells/spell';

const talents = {
    BEACON_OF_FAITH: {
        name: "Beacon of Faith",
        id: 156910,
        icon: 'ability_paladin_beaconsoflight',
    },
    PILLARS_OF_LIGHT: {
        name: "Pillars of Light",
        id: 1232616,
        icon: 'inv_helm_plate_raidpaladindragon_d_01',
    },
    HAMMER_AND_ANVIL: {
        name: "Hammer and Anvil",
        id: 1232617,
        icon: 'inv_10_blacksmithing_consumable_repairhammer_color1',
    },
    POWER_OF_THE_SILVER_HAND: {
        name: "Power of the Silver Hand",
        id: 200474, 
        icon: 'ability_paladin_blessedhands', 
    },
    SUNS_AVATAR: {
        name: "Sun's Avatar",
        id: 431425, 
        icon: 'ability_paladin_holyavenger', 
    },
    RISING_SUNLIGHT: {
        name: "Rising Sunlight",
        id: 461250, 
        icon: 'spell_priest_divinestar_holy', 
    },
    GLEAMING_RAYS: {
        name: "Gleaming Rays",
        id: 431480, 
        icon: 'spell_priest_power-word', 
    },
    EMPYREAL_WARD: {
        name: "Empyreal Ward",
        id: 387791, 
        icon: 'spell_holy_layonhands', 
    },
    SECOND_SUNRISE: {
        name: "Second Sunrise",
        id: 431474, 
        icon: 'ability_priest_halo', 
    },
    DIVINE_PURPOSE: {
        name: "Divine Purpose",
        id: 223817,
        icon: 'spell_holy_divinepurpose',
    },
    DAWNLIGHT: {
        name: "Dawnlight",
        id: 431377, 
        icon: 'inv_ability_heraldofthesunpaladin_dawnlight', 
    },
    BREAKING_DAWN: {
        name: "Breaking Dawn",
        id: 387879, 
        icon: 'spell_holy_rune', 
    },
    LIBERATION: {
        name: "Liberation",
        id: 461287, 
        icon: 'ability_paladin_toweroflight', 
    },
    LIGHT_OF_THE_MARTYR: {
        name: "Light of the Martyr",
        id: 183998,
        icon: 'ability_paladin_lightofthemartyr',
    },
    MASTERWORK: {
        name: "Masterwork",
        id: 1238903, 
        icon: 'inv_mace_1h_gryphonrider_d_02_silver', 
    },
    SOLAR_WRATH: {
        name: "Solar Wrath",
        id: 1236972, 
        icon: 'inv_icon_wing06c', 
    },
    AVENGING_CRUSADER: {
        name: "Avenging Crusader",
        id: 216331,
        icon: 'ability_paladin_veneration',
    },
    LAYING_DOWN_ARMS: {
        name: "Laying Down Arms",
        id: 432866,
        icon: 'ability_paladin_handoflight',
    },
    AWAKENING: {
        name: "Awakening",
        id: 414195,
        icon: 'inv_helm_plate_raidpaladin_n_01',
    },
    RINGING_OF_THE_HEAVENS: {
        name: "Ringing of the Heavens",
        id: 1241542,
        icon: 'paladin_protection',
    },
    REFLECTION_OF_RADIANCE: {
        name: "Reflection of Radiance",
        id: 1271466,
        icon: 'inv_enchanting_70_pet_torch',
    },
    SOLIDARITY: {
        name: "Solidarity",
        id: 432802,
        icon: 'spell_holy_heroism',
    },
    RESOUNDING_STRIKE: {
        name: "Resounding Strike",
        id: 1271553,
        icon: 'inv_11_0_arathordungeon_bell_color1',
    },
    CRUSADERS_MIGHT: {
        name: "Crusader's Might",
        id: 196926,
        icon: 'ability_paladin_swiftretribution',
    },
    SOLAR_GRACE: {
        name: "Solar Grace",
        id: 431404,
        icon: 'ability_malkorok_blightofyshaarj_yellow',
    },
    AURORA: {
        name: "Aurora",
        id: 439760,
        icon: 'spell_holy_rune',
    },
    DIVINE_RESONANCE: {
        name: "Divine Resonance",
        id: 386738,
        icon: 'ability_mount_goatmountwhite',
    },
    AUTHORITATIVE_REBUKE: {
        name: "Authoritative Rebuke",
        id: 469886,
        icon: 'inv_misc_symbolofkings_01',
    },
    HAND_OF_DIVINITY: {
        name: "Hand of Divinity",
        id: 1242008,
        icon: 'spell_holy_vindication',
    },
    COMMANDING_LIGHT: {
        name: "Commanding Light",
        id: 387781,
        icon: 'ability_paladin_beaconoflight',
    },
    BEACON_OF_THE_LIGHTBRINGER: {
        name: "Beacon of the Lightbringer",
        id: 197446,
        icon: 'spell_paladin_clarityofpurpose',
    },
    MOMENT_OF_COMPASSION: {
        name: "Moment of Compassion",
        id: 387786,
        icon: 'spell_holy_flashheal',
    },
    DIVINE_REVELATIONS: {
        name: "Divine Revelations",
        id: 387808,
        icon: 'ability_paladin_infusionoflight',
    },
    GREATER_JUDGMENT: {
        name: "Greater Judgment",
        id: 231644,
        icon: 'spell_holy_righteousfury',
    },
    EMPYREAN_LEGACY: {
        name: "Empyrean Legacy",
        id: 1241358,
        icon: 'item_holyspark',
    },
    SERAPHIC_BARRIER: {
        name: "Seraphic Barrier",
        id: 1241714,
        icon: 'ability_paladin_protectoroftheinnocent',
    },
    VENERATION: {
        name: "Veneration",
        id: 392938,
        icon: 'ability_crown_of_the_heavens_icon',
    },
    INFUSION_OF_LIGHT: {
        name: "Infusion of Light",
        id: 53576,
        icon: 'ability_paladin_infusionoflight',
    },
    DIVINE_FAVOR: {
        name: "Divine Favor",
        id: 1270916,
        icon: 'spell_holy_heal',
    },
    SUN_SEAR: {
        name: "Sun Sear",
        id: 431413,
        icon: 'spell_priest_burningwill',
    },
    LIGHTFORGED_BLESSINGS: {
        name: "Lightforged Blessings",
        id: 406468,
        icon: 'spell_holy_circleofrenewal',
    },
    HOLY_ARMAMENTS: {
        name: "Holy Armaments",
        id: 1289728,
        icon: 'inv_ability_lightsmithpaladin_holybulwark',
    },
    BEACON_OF_THE_SAVIOUR: {
        name: "Beacon of the Saviour",
        id: 1244878,
        icon: 'inv12_apextalent_paladin_beaconofthesavior',
    },
} satisfies Record<string, spell>;
    
export default talents;
export { talents as HOLY_PALADIN_TALENTS };