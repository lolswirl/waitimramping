import type CorePassive from "@data/core-passives/core-passive";
import SPELLS from "@data/spells";
import TALENTS from "@data/talents";

// TODO: make these better
const HEALING_SPELLS = [
    SPELLS.VIVIFY.id,
    // SPELLS.EXPEL_HARM.id, removed in midnight
    //451968, // Expel Harm (alt id), removed in midnight
    SPELLS.SOOTHING_MIST.id,
    TALENTS.SPIRITFONT_SOOTHING_MIST.id,
    TALENTS.JADE_SERPENT_STATUE_SOOTHING_MIST.id,
    SPELLS.REVIVAL.id,
    //297850, // Revival (alt id)
    SPELLS.ENVELOPING_MIST.id,
    //274062, // Enveloping Mist (alt id)
    //325209, // Enveloping Breath, removed in midnight
    //358560, // Enveloping Breath (alt id), removed in midnight
    //SPELLS.RESTORAL.id, meh
    SPELLS.SHEILUNS_GIFT.id,
    //SPELLS.HEALING_SPHERES.id, pvp lol
    //274774, // Strength of Spirit, azerite talent and expel harm removed from game
    //311123, // Weapons of Order, not used by mw anymore
    //345727, // Faeline Stomp (heal), its called jadefire stomp now
    TALENTS.HARMONIC_SURGE.id,
    //1271045, // Harmonic Surge (alt spell id)
    //TALENTS.INSURANCE.id, old tier set
    //1215544, // Insurance! (alt id)
    //1215545, // Insurance! (alt id)
    //130654, // Chi Burst (heal), removed from mw in midnight
    SPELLS.CELESTIAL_CONDUIT.id,
    //443039, // Celestial Conduit (alt spell id)
    TALENTS.MANTRA_OF_PURITY.id,
    TALENTS.RUSHING_WIND_KICK.id,
    //1269159, // Rushing Wind Kick (heal alt spell id)
    //SPELLS.HEALING_SPHERE.id, pvp lol
    SPELLS.RENEWING_MIST.id,
    //448430, // Renewing Mist (alt id)
    //1238851, // Renewing Mist (alt id)
    TALENTS.CHI_WAVE.id,
    //132463, // Chi Wave (heal alt spell id)
    //TALENTS.REFRESHING_JADE_WIND.id, no longer mw toolkit
    TALENTS.GUST_OF_MISTS.id,
    //191894, // Gust of Mists (alt spell id)
    //328748, // Gust of Mists (alt spell id)
    //343819, // Gust of Mists (alt spell id)
    TALENTS.ZEN_PULSE.id,
    //198487, // Zen Pulse (heal alt spell id)
    //388668, // Zen Pulse (alt id)
    //SPELLS.CELESTIAL_BREATH.id, removed in bfa
    //227344, // Surging Mist, removed in LEGION
    TALENTS.OVERFLOWING_MISTS.id,
    //273354, // Overflowing Mists (alt spell id)
    //388514, // Overflowing Mists (alt id)
    TALENTS.RISING_MIST.id,
    //274912, // Rising Mist (alt spell id)
    //278564, // Burst of Life, won't even implement this, this thing sucks
    //399230, // Burst of Life (alt id)
    TALENTS.YULONS_WHISPER.id,
    //337268, // Yu'lon's Whisper (alt spell id)
    //388044, // Yu'lon's Whisper (alt id)
    TALENTS.TEAR_OF_MORNING.id,
    //337993, // Tear of Morning (alt spell id)
    //387995, // Tear of Morning (alt id)
    TALENTS.SOOTHING_BREATH.id,
    TALENTS.JADEFIRE_STOMP.id,
    //388207, // Jadefire Stomp (alt spell id, shared with damage)
    //TALENTS.THUNDEROUS_FOCUS_TEA.id, pvp talent cba
    //407058, // Thunderous Focus Tea (alt id)
    //TALENTS.SPHERE_OF_HOPE.id, pvp
    TALENTS.INVIGORATING_MISTS.id,
    //425804, // Invigorating Mists (alt spell id)
    TALENTS.FLIGHT_OF_THE_RED_CRANE.id,
    //443611, // Flight of the Red Crane (alt id)
    TALENTS.RESTORAL.id,
    //388615, // Restoral (alt id)
];

const DAMAGE_SPELLS = [
    SPELLS.TIGER_PALM.id,
    //331433, // Tiger Palm (alt id)
    //468605, // Glyph of Tiger Palm
    SPELLS.BLACKOUT_KICK.id,
    //205523, // Blackout Kick (alt id)
    //228649, // Blackout Kick (alt id)
    SPELLS.SPINNING_CRANE_KICK.id,
    //330903, // Spinning Crane Kick (alt id)
    //1250999, // Spinning Crane Kick (alt id)
    //113656, // Fists of Fury, ww only
    //117418, // Fists of Fury (alt id), ww only
    //115181, // Breath of Fire, bm only
    SPELLS.CRACKLING_JADE_LIGHTNING.id,
    //121253, // Keg Smash, bm only
    //330911, // Keg Smash (alt id), bm only
    //123586, // Flying Serpent Kick, ww only
    //124081, // Zen Pulse (damage), ww only
    //388609, // Zen Pulse (alt id)
    //132467, // Chi Wave (damage)
    //148135, // Chi Burst (damage)
    //148187, // Rushing Jade Wind, ww only
    //158221, // Whirling Dragon Punch, ww only
    //451767, // Whirling Dragon Punch (alt id), ww only
    SPELLS.RISING_SUN_KICK.id,
    //196733, // Special Delivery, bm only
    //227291, // Stomp, bm only
    //1242373, // Stomp (alt id), bm only
    //275673, // Sunrise Technique, ww only
    //288636, // Glory of the Dawn, ww only
    //392959, // Glory of the Dawn (alt id), ww only
    //325153, // Exploding Keg, bm only
    //388867, // Exploding Keg (alt id), bm only
    //327264, // Faeline Stomp (damage), its called jadefire stomp now
    //345727, // Faeline Stomp (alt id)
    TALENTS.JADEFIRE_STOMP.id, // 388207
    //388201, // Jadefire Stomp (alt id)
    //1248815, // Jadefire Stomp (alt id)
    //337342, // Chi Explosion, ww only
    //393056, // Chi Explosion (alt id), ww only
    //393566, // Thunderfist, ww only
    //395519, // Strike of the Windlord, ww only
    //395521, // Strike of the Windlord (alt id), ww only
    //418360, // Press the Advantage, ww only
    SPELLS.CELESTIAL_CONDUIT.id, // note: should be different id from healing (443038)
    TALENTS.COURAGE_OF_THE_WHITE_TIGER.id, // 443088
    //457917, // Courage of the White Tiger (alt id)
    //443127, // Strength of the Black Ox, cotc only
    //443611, // Flight of the Red Crane, cotc only
    //450617, // Flurry Strike, ww only
    //451250, // Flurry Strike (alt id), ww only
    //451839, // Dual Threat, ww only
    //452130, // Flurry of Xuen, ww only
    TALENTS.RUSHING_WIND_KICK.id, // 467307
    //468179, // Rushing Wind Kick (alt id)
    //1217411, // Slicing Winds, ww only
    //1262765, // Empty the Cellar, bm only
    //1263667, // Celestial Flames, cotc only
    TALENTS.HARMONIC_SURGE.id, // main cast id, damage component is 1271011
    //1272696, // Zenith Stomp, ww only
];

// TODO: fix these to use IDs correctly for dmg/healing
const corePassive = {
    MISTWEAVER_MONK: {
        name: "Mistweaver Monk",
        id: 137024,
        icon: "ability_mage_firestarter",
        effects: [
            {
                type: "Apply Aura: Modifies Healing Done",
                value: -5,
                pvpMultiplier: 1,
                affectedSpells: HEALING_SPELLS,
                effectId: 179708,
            },
            {
                type: "Apply Aura: Modifies Periodic Healing Done",
                value: -5,
                pvpMultiplier: 1,
                affectedSpells: HEALING_SPELLS,
                effectId: 191104,
            },
            {
                type: "Apply Aura: Modifies Damage Done",
                value: 90,
                pvpMultiplier: 1,
                affectedSpells: DAMAGE_SPELLS,
                effectId: 191105,
            },
            {
                type: "Apply Aura: Modifies Periodic Damage Done",
                value: 90,
                pvpMultiplier: 1,
                affectedSpells: DAMAGE_SPELLS,
                effectId: 191106,
            },
            {
                type: "Apply Aura: Mod Guardian Damage %",
                pvpMultiplier: 1,
                effectId: 191107,
            },
            {
                type: "Apply Aura: Mod Auto Attack Damage %",
                pvpMultiplier: 1,
                effectId: 260828,
            },
            {
                type: "Apply Aura: Modifies Healing Done",
                value: 121,
                pvpMultiplier: 0.77,
                affectedSpells: [SPELLS.VIVIFY.id],
                effectId: 260829,
            },
            {
                type: "Apply Aura: Add Modifier - % (Label): Modifies Damage/Healing Done",
                pvpMultiplier: 1,
                affectedSpells: [TALENTS.INVIGORATING_MISTS.id],
                effectId: 260830,
            },
            {
                type: "Apply Aura: Modifies Damage Done",
                value: 41,
                pvpMultiplier: 0.447,
                affectedSpells: [
                    SPELLS.RISING_SUN_KICK.id,
                    TALENTS.RUSHING_WIND_KICK.id,
                ],
                effectId: 260832,
            },
            {
                type: "Apply Aura: Modifies Damage Done",
                value: 56,
                pvpMultiplier: 1,
                affectedSpells: [SPELLS.BLACKOUT_KICK.id],
                effectId: 260833,
            },
            {
                type: "Apply Aura: Modifies Damage Done",
                value: -17,
                pvpMultiplier: 0.325,
                affectedSpells: [SPELLS.TIGER_PALM.id],
                effectId: 260834,
            },
            {
                type: "Apply Aura: Modifies Damage Done",
                value: 193,
                pvpMultiplier: 1,
                affectedSpells: [SPELLS.SPINNING_CRANE_KICK.id],
                effectId: 260835,
            },
            {
                type: "Apply Aura: Modifies Periodic Damage Done",
                value: 242,
                pvpMultiplier: 1,
                affectedSpells: [SPELLS.CRACKLING_JADE_LIGHTNING.id],
                effectId: 741702,
            },
            {
                type: "Apply Aura: Add Modifier - % (Label): Modifies Damage Done",
                value: -20,
                pvpMultiplier: 1,
                affectedSpells: [SPELLS.CELESTIAL_CONDUIT.id],
                effectId: 1266574,
            },
            {
                type: "Apply Aura: Allows Cast while Moving",
                pvpMultiplier: 1,
                affectedSpells: [SPELLS.CRACKLING_JADE_LIGHTNING, SPELLS.SOOTHING_MIST],
                effectId: 1313361,
            }
        ],
    } as CorePassive,
};

export default corePassive;
export { HEALING_SPELLS, DAMAGE_SPELLS };
