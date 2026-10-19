import type spell from "@data/spells/spell";
import type { TalentMap } from "@data/shared/engine";

export interface AllyState {
    id: number;
    buffs: {
        envelopingMist: {
            remaining: number;
            amp: number;
        };
        renewingMist: {
            remaining: number;
            amp: number;
        };
    };
}

export interface RotationResult {
    id: string;
    name: string;
    hps: number;
    totalHealing: number;
    duration: number;
    spells: spell[];
    breakdown: Array<{
        spellName: string;
        healing: number;
        percentage: number;
        sources: {
            baseHealing?: number;
            chiJiGusts?: number;
            ancientTeachings?: number;
            wayOfTheCrane?: number;
            gustOfMists?: number;
            chiCocoons?: number;
            rapidDiffusion?: number;
        };
    }>;
}

export function isTalentEnabled(
  options: SimulationOptions,
  talent: spell
): boolean {
  return (
    options.specTalents.get(talent) === true ||
    !!options.classTalents.get(talent)
  );
}

export interface SimulationOptions {
    intellect: number;
    totalHp: number;
    crit: number;
    versatility: number;
    mastery: number;
    haste: number;
    enemyCount: number;
    allyCount: number;
    specTalents: Map<spell, boolean>;
    classTalents: TalentMap;
}