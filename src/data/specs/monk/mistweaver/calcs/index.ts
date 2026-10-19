import type spell from "@data/spells/spell";
import { CATEGORY } from "@data/spells/spell";
import TALENTS from "../talents";
import SHARED from "@data/specs/monk/talents";
import SPELLS from "@data/spells";
import { SCHOOLS } from "@data/shared/schools";
import { registerSpecEngine } from "@data/shared/specEngines";
import MISTWEAVER_KEY from "../key";
import {
    type TalentMap,
    type Player,
    type TalentRule,
    isTalentEnabled,
    calculateSpellDamageMultiplier,
    calculateSpellHealingMultiplier,
    calcSpellValue,
} from "@data/shared/engine";
import * as Engine from "@data/shared/engine";
import { TIER } from "@data/items/tier";

export type { TalentMap, Player };
export { isTalentEnabled, calcSpellValue, calculateSpellDamageMultiplier, calculateSpellHealingMultiplier };

const DAMAGE_MULTIPLIER_RULES: TalentRule[] = [
    {
        talent: SHARED.FEROCITY_OF_XUEN,
        getValue: (_stats, rank) => rank * SHARED.FEROCITY_OF_XUEN.effects.damageIncrease,
        appliesTo: (spell) => spell.category === CATEGORY.DAMAGE
    },
    {
        talent: SHARED.FAST_FEET,
        getValue: () => SHARED.FAST_FEET.effects.risingSunKickIncrease,
        appliesTo: (spell) =>
            spell.id === SPELLS.RISING_SUN_KICK.id ||
            spell.id === TALENTS.RUSHING_WIND_KICK.id
    },
    {
        talent: SHARED.FAST_FEET,
        getValue: () => SHARED.FAST_FEET.effects.spinningCraneKickIncrease,
        appliesTo: (spell) => spell.id === SPELLS.SPINNING_CRANE_KICK.id
    },
    {
        talent: SHARED.CHI_PROFICIENCY,
        getValue: (_stats, rank) => rank * SHARED.CHI_PROFICIENCY.effects.magicDamageIncrease,
        appliesTo: (spell) => spell.school === SCHOOLS.NATURE
    },
    {
        talent: SHARED.MARTIAL_INSTINCTS,
        getValue: (_stats, rank) => rank * SHARED.MARTIAL_INSTINCTS.effects.damageIncrease,
        appliesTo: (spell) => spell.school === SCHOOLS.PHYSICAL
    },
    {
        talent: TALENTS.YULONS_KNOWLEDGE,
        getValue: () => TALENTS.YULONS_KNOWLEDGE.effects.rskDamageIncrease,
        appliesTo: (spell) =>
            spell.id === SPELLS.RISING_SUN_KICK.id ||
            spell.id === TALENTS.RUSHING_WIND_KICK.id
    },
    {
        talent: TALENTS.MORNING_BREEZE,
        getValue: (stats) => ((stats?.mastery ?? 0) / 100 * TALENTS.MORNING_BREEZE.effects.masteryMultiplier),
        appliesTo: (spell) =>
            spell.id === SPELLS.RISING_SUN_KICK.id ||
            spell.id === TALENTS.RUSHING_WIND_KICK.id
    },
    {
        talent: TALENTS.SPIRITFONT,
        getValue: (_stats, rank) => TALENTS.SPIRITFONT.effects.rskIncreaseByRank[rank],
        appliesTo: (spell) =>
            spell.id === SPELLS.RISING_SUN_KICK.id ||
            spell.id === TALENTS.RUSHING_WIND_KICK.id
    },
    {
        talent: TIER.T36_MISTWEAVER_2SET,
        getValue: () => TIER.T36_MISTWEAVER_2SET.effects.rskDamageIncrease,
        appliesTo: (spell) => spell.id === SPELLS.RISING_SUN_KICK.id
    },
];

const HEALING_MULTIPLIER_RULES: TalentRule[] = [
    {
        talent: TALENTS.SPIRITFONT,
        getValue: (_stats, rank) => TALENTS.SPIRITFONT.effects.envmIncreaseByRank[rank],
        appliesTo: (spell) => spell.id === SPELLS.ENVELOPING_MIST.id
    },
    {
        talent: SHARED.CHI_PROFICIENCY,
        getValue: (_stats, rank) => rank * SHARED.CHI_PROFICIENCY.effects.healingDoneIncrease,
        appliesTo: (spell) => spell.category === CATEGORY.HEALING || spell.category === CATEGORY.COOLDOWN || spell.id === TALENTS.RUSHING_WIND_KICK.id || spell.id === TALENTS.HARMONIC_SURGE.id
    },
    { // this isn't entirely correct, since amp rush is just from rems
        talent: TALENTS.AMPLIFIED_RUSH,
        getValue: () => TALENTS.AMPLIFIED_RUSH.effects.gustOfMistsIncrease,
        appliesTo: (spell) => spell.id === TALENTS.GUST_OF_MISTS.id
    },
    {
        talent: TALENTS.TEAR_OF_MORNING,
        getValue: () => TALENTS.TEAR_OF_MORNING.effects.sheilunsGiftIncrease,
        appliesTo: (spell) => spell.id === SPELLS.SHEILUNS_GIFT.id
    },
    {
        talent: TALENTS.TEAR_OF_MORNING,
        getValue: () => TALENTS.TEAR_OF_MORNING.effects.invigoratingMistsIncrease,
        appliesTo: (spell) => spell.id === TALENTS.INVIGORATING_MISTS.id
    },
    {
        talent: TALENTS.WAY_OF_THE_SERPENT,
        getValue: () => TALENTS.WAY_OF_THE_SERPENT.effects.sheilunsGiftIncrease,
        appliesTo: (spell) => spell.id === SPELLS.SHEILUNS_GIFT.id
    },
    {
        talent: TALENTS.WAY_OF_THE_SERPENT,
        getValue: () => TALENTS.WAY_OF_THE_SERPENT.effects.renewingMistIncrease,
        appliesTo: (spell) => spell.id === SPELLS.RENEWING_MIST.id
    },
    {
        talent: TALENTS.UPLIFTED_SPIRITS,
        getValue: () => TALENTS.UPLIFTED_SPIRITS.effects.revivalIncrease,
        appliesTo: (spell) => spell.id === SPELLS.REVIVAL.id || spell.id == TALENTS.RESTORAL.id,
    },
    {
        talent: TALENTS.VITAL_EXPENDITURE,
        getValue: () => TALENTS.VITAL_EXPENDITURE.effects.soomIncrease,
        appliesTo: (spell) => 
            spell.id === SPELLS.SOOTHING_MIST.id || 
            spell.id === TALENTS.SPIRITFONT_SOOTHING_MIST.id
    },
    {
        talent: TIER.T36_MISTWEAVER_2SET,
        getValue: () => TIER.T36_MISTWEAVER_2SET.effects.rwkHealingIncrease,
        appliesTo: (spell) => spell.id === TALENTS.RUSHING_WIND_KICK.id
    },
];

export const calculateSpellDamage = (spell: spell, player: Player): number =>
    Engine.calculateSpellDamage(spell, player, DAMAGE_MULTIPLIER_RULES);

export const calculateSpellHealing = (spell: spell, player: Player): number =>
    Engine.calculateSpellHealing(spell, player, HEALING_MULTIPLIER_RULES);


export const calculateGustOfMists = (player: Player): number => {
    const gom = TALENTS.GUST_OF_MISTS;
    const pseudoGom = { ...gom, coeff: player.stats.mastery / 100 } as spell;
    return Engine.calculateSpellHealing(pseudoGom, player, HEALING_MULTIPLIER_RULES);
};

export const getAncientTeachingsBaseTransfer = (): number => {
    return TALENTS.ANCIENT_TEACHINGS.effects.transferRate;
};

export const getAncientTeachingsArmorModifier = (): number => {
    return TALENTS.ANCIENT_TEACHINGS.effects.armorModifier;
};

export const getJadefireTeachingsTransfer = (): number => {
    return TALENTS.JADEFIRE_TEACHINGS.effects.transferRate;
};

export const getMeditativeFocusTransfer = (): number => {
    return TALENTS.MEDITATIVE_FOCUS.effects.transferRate;
};

export const getCombinedTeachingsTransfer = (player: Player, includeJadefire: boolean = true): number => {
    let transfer = getAncientTeachingsBaseTransfer();

    if (includeJadefire && isTalentEnabled(player.talents, TALENTS.JADEFIRE_TEACHINGS)) {
        transfer += getJadefireTeachingsTransfer();
    }

    if (isTalentEnabled(player.talents, TALENTS.MEDITATIVE_FOCUS)) {
        transfer += getMeditativeFocusTransfer();
    }

    return transfer;
};

export const getWayOfTheCraneTransferPerTarget = (): number => {
    return TALENTS.WAY_OF_THE_CRANE.effects.transferRate;
};

export const getWayOfTheCraneTargets = (): number => {
    return TALENTS.WAY_OF_THE_CRANE.effects.targetsPerSCK;
};

export const getWayOfTheCraneArmorModifier = (): number => {
    return TALENTS.WAY_OF_THE_CRANE.effects.armorModifier;
};

export const getWayOfTheCraneTransfer = (): number => {
    return getWayOfTheCraneTransferPerTarget() * getWayOfTheCraneTargets();
};

export const calculateAncientTeachingsData = (
    spell: spell,
    player: Player,
    includeJadefire: boolean = true,
): { damage: number; healing: number } => {
    const damage = calculateSpellDamage(spell, player);
    const healing = calculateAncientTeachingsHealing(damage, player, includeJadefire, spell);
    return { damage, healing };
};

export const calculateAncientTeachingsHealing = (
    damage: number,
    player: Player,
    includeJadefire: boolean = true,
    sourceSpell?: spell
): number => {
    const transfer = getCombinedTeachingsTransfer(player, includeJadefire);
    const armorModifier = sourceSpell?.school === SCHOOLS.NATURE ? 1 : getAncientTeachingsArmorModifier();
    return damage * transfer * armorModifier;
};

export const calculateWayOfTheCraneHealing = (
    damage: number,
): number => {
    const transfer = getWayOfTheCraneTransfer();
    const armorModifier = getWayOfTheCraneArmorModifier();
    return damage * transfer * armorModifier;
};

registerSpecEngine(MISTWEAVER_KEY, {
    calculateSpellDamage,
    calculateSpellHealing,
    resolveSpellValue: (spell, player) => {
        if (spell.id === TALENTS.GUST_OF_MISTS.id) {
            return calculateGustOfMists(player);
        }
        return null;
    },
    getSpellModifiers: (spell, player, type) =>
        Engine.getSpellModifiers(spell, player, type, type === 'damage' ? DAMAGE_MULTIPLIER_RULES : HEALING_MULTIPLIER_RULES),
});
