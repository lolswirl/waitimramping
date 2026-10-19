import type spell from '@data/spells/spell';
import { CATEGORY } from '@data/spells/spell';
import { SCHOOLS } from '@data/shared/schools';
import { HERO_TREES } from '@data/heroTalents';
const COTC = HERO_TREES.CONDUIT_OF_THE_CELESTIALS;

const spells = {
    // damaging abilities
    TIGER_PALM: {
        name: 'Tiger Palm',
        id: 100780,
        icon: 'ability_monk_tigerpalm',
        castTime: 0,
        school: SCHOOLS.PHYSICAL,
        coeff: 0.936,
        category: CATEGORY.DAMAGE,
    },
    BLACKOUT_KICK: {
        name: 'Blackout Kick',
        id: 100784,
        icon: 'ability_monk_roundhousekick',
        castTime: 0,
        cooldown: 3,
        school: SCHOOLS.PHYSICAL,
        coeff: 0.8809,
        category: CATEGORY.DAMAGE,
    },
    RISING_SUN_KICK: {
        name: 'Rising Sun Kick',
        id: 185099,
        icon: 'ability_monk_risingsunkick',
        castTime: 0,
        cooldown: 12,
        school: SCHOOLS.PHYSICAL,
        coeff: 1.4955,
        category: CATEGORY.DAMAGE,
    },
    CRACKLING_JADE_LIGHTNING: {
        name: 'Crackling Jade Lightning',
        id: 117952,
        icon: 'ability_monk_cracklingjadelightning',
        castTime: 3,
        school: SCHOOLS.NATURE,
        coeff: 0.23296 * 1.2504, // base x multi to get to matched ingame value, not sure where its scaled
        category: CATEGORY.DAMAGE,
        periodic: true,
    },
    SPINNING_CRANE_KICK: {
        name: 'Spinning Crane Kick',
        id: 107270,
        icon: 'ability_monk_cranekick_new',
        school: SCHOOLS.PHYSICAL,
        castTime: 1.5,
        coeff: 0.104 * 4,
        category: CATEGORY.DAMAGE,
    },

    // healing abilities
    RENEWING_MIST: {
        name: 'Renewing Mist',
        id: 119611,
        icon: 'ability_monk_renewingmists',
        castTime: 0,
        cooldown: 9,
        school: SCHOOLS.NATURE,
        coeff: 1.9665,
        duration: 20,
        category: CATEGORY.HEALING,
        periodic: true,
    },
    SOOTHING_MIST: {
        name: 'Soothing Mist',
        id: 115175,
        icon: 'ability_monk_soothingmists',
        castTime: 1,
        school: SCHOOLS.NATURE,
        coeff: 2.10 * 12, // 210 sp% per sec, pip turns this into 12s baseline
        replaceGCD: 1,
        category: CATEGORY.HEALING,
        periodic: true,
    },
    ENVELOPING_MIST: {
        name: 'Enveloping Mist',
        id: 124682,
        icon: 'spell_monk_envelopingmist',
        castTime: 2,
        school: SCHOOLS.NATURE,
        coeff: 8.6112, // total
        duration: 6,
        effects: {
            amp: 1.1,
        },
        category: CATEGORY.HEALING,
        periodic: true,
    },
    VIVIFY: {
        name: 'Vivify',
        id: 116670,
        icon: 'ability_monk_vivify',
        castTime: 1.5,
        school: SCHOOLS.NATURE,
        coeff: 2.58 * 1.95, // spell has 1.95 scalar on it for some reason
        category: CATEGORY.HEALING,
    },
    SHEILUNS_GIFT: {
        name: "Sheilun's Gift",
        id: 399491,
        icon: 'inv12_ability_monk_sheilunsgift',
        castTime: 2,
        school: SCHOOLS.NATURE,
        coeff: 4.79504,
        targets: 3,
        maxStacks: 10,
        effects: {
            coeffPerStack: 0.05,
        },
        category: CATEGORY.HEALING,
    },

    // cooldowns
    THUNDER_FOCUS_TEA: {
        name: 'Thunder Focus Tea',
        id: 116680,
        icon: 'ability_monk_thunderfocustea',
        castTime: 0,
        cooldown: 30,
        gcd: false,
        category: CATEGORY.COOLDOWN,
    },
    CHI_JI: {
        name: 'Chi-Ji',
        id: 325197,
        icon: 'inv_pet_cranegod',
        castTime: 0,
        duration: 12,
        category: CATEGORY.COOLDOWN,
        exclusive: [322118],
    },
    YULON: {
        name: "Yu'lon",
        id: 322118,
        icon: 'ability_monk_dragonkick',
        castTime: 0,
        duration: 12,
        category: CATEGORY.COOLDOWN,
        exclusive: [325197],
    },
    REVIVAL: {
        name: 'Revival',
        id: 115310,
        icon: 'spell_monk_revival',
        castTime: 0,
        coeff: 59.8828,
        school: SCHOOLS.NATURE,
        category: CATEGORY.COOLDOWN,
    },
    LIFE_COCOON: {
        name: 'Life Cocoon',
        id: 116849,
        icon: 'ability_monk_chicocoon',
        castTime: 0,
        cooldown: 120,
        gcd: false,
        formula: (stats) => (stats.totalHp ?? 0) * 48 / 100 * (1 + stats.versatility / 100),
        category: CATEGORY.COOLDOWN,
    },
    CELESTIAL_CONDUIT: {
        name: 'Celestial Conduit',
        id: 443028,
        icon: 'inv_ability_conduitofthecelestialsmonk_celestialconduit',
        heroTalent: COTC,
        castTime: 4,
        cooldown: 90,
        school: SCHOOLS.NATURE,
        coeff: {
            damage: 1.716 * 5,
            healing: 11 * 5,
        },
        effects: {
            maxTargets: 5,
        },
        category: CATEGORY.COOLDOWN,
    },

} satisfies Record<string, spell>;

const CHIJI_ABILITIES = [
    // direct interaction
    spells.CHI_JI,
    spells.ENVELOPING_MIST,
    spells.TIGER_PALM,
    spells.BLACKOUT_KICK,
    spells.RISING_SUN_KICK,
    spells.SPINNING_CRANE_KICK,

    // indirect interactions
    spells.RENEWING_MIST,
    spells.VIVIFY,
    spells.THUNDER_FOCUS_TEA,
];

export default spells;
export { spells as MISTWEAVER_SPELLS, CHIJI_ABILITIES };
