import type { SCHOOLS } from "@data/shared/schools";
import type { HeroTree } from "@data/heroTalents";
import type { Stats } from "@data/shared/stats";

export const CATEGORY = {
    DAMAGE: "Damage",
    HEALING: "Healing",
    COOLDOWN: "Cooldown",
    OTHER: "Other",
    UTILITY: "Utility",
} as const;

export type SpellCategory = typeof CATEGORY[keyof typeof CATEGORY];

export const CATEGORY_COLORS: Partial<Record<SpellCategory, string>> = {
    [CATEGORY.DAMAGE]: "#f87171",
    [CATEGORY.HEALING]: "#4ade80",
};

export default interface spell {
    category?: SpellCategory;
    exclusive?: number[];
    maxRank?: number;
    heroTalent?: HeroTree;
    name: string;
    id: number;
    spellModifier?: number;
    uuid?: string;
    icon: string;
    castTime?: number;
    cooldown?: number;
    duration?: number;
    replaceGCD?: number;
    maxStacks?: number;
    targets?: number | { damage?: number; healing?: number };
    hasted?: boolean;
    gcd?: boolean;
    empowerLevel?: number;
    school?: (typeof SCHOOLS)[keyof typeof SCHOOLS];

    coeff?: number | { damage?: number; healing?: number };
    formula?: (stats: Stats) => number;
    periodic?: boolean;

    value?: {
        healing?: number;
        damage?: number;
        spellpower?: number;
    };

    effects?: {
        [key: string]: any;
    };

    display?: { // optionally, display this as something else
        name?: string;
        icon?: string;
    };
}

export const GCD = 1.5;
export const GCD_CAP = 0.75;

export const calculateGCD = (haste: number): number => {
    const hasteMultiplier = 1 + haste / 100;
    const adjustedGCD = GCD / hasteMultiplier;
    return Math.max(GCD_CAP, adjustedGCD);
};

export const calculateCastTime = (
    spell: spell,
    haste: number | undefined
): number => {
    let baseCastTime = spell.castTime ?? 0;
    if (baseCastTime === 0) {
        if (spell.gcd !== false) {
            baseCastTime = GCD;
        } else {
            baseCastTime = 0;
        }
    }

    let castTime = baseCastTime;
    if (spell.hasted !== false) {
        const hasteValue = haste ?? 0;
        castTime /= 1 + hasteValue / 100;
    }

    if (spell.empowerLevel) {
        castTime *= spell.empowerLevel / 5;
    }

    return castTime;
};

export const calculateEffectiveCastTime = (
    spell: spell,
    haste: number
): {
    castTime: number;
    effectiveTime: number;
    isGCDConstrained: boolean;
} => {
    const castTime = calculateCastTime(spell, haste);

    if (spell.gcd === false) {
        return {
            castTime,
            effectiveTime: castTime,
            isGCDConstrained: false,
        };
    }

    const baseGCD = calculateGCD(haste);
    const gcd = spell.replaceGCD !== undefined
        ? Math.min(spell.replaceGCD / (1 + haste / 100), baseGCD)
        : baseGCD;
    const effectiveTime = Math.max(castTime, gcd);
    const isGCDConstrained = castTime < gcd;

    return { castTime, effectiveTime, isGCDConstrained };
};

export const calcSpellpower = (baseValue: number, intellect: number) => {
    return (baseValue / intellect) * 100;
};
