import { GCD } from "@data/spells/spell";
import type spell from "@data/spells/spell";
import SPELLS from "@data/spells";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import TIER from "@data/items/tier";
import {
  calculateAncientTeachingsHealing,
  calculateAncientTeachingsData,
  calculateWayOfTheCraneHealing,
  calculateSpellDamage,
  calculateSpellHealing,
  type Player,
  type TalentMap,
} from "@data/specs/monk/mistweaver/calcs";

type DamagePoint = { time: number; damage: number };
type RotationState = Record<string, number>;

export type AbilityEntry = { total: number; sub?: Map<spell, number> };
export type ModelResult = { points: DamagePoint[]; perAbility: Map<spell, AbilityEntry> };

interface RotationAction {
  spell: spell;
  priority: number;
  cooldown: number;
  castTime?: number;
  getValue?: (state: RotationState) => number;
  getBreakdown?: (state: RotationState) => Map<spell, number>;
  canCast?: (state: RotationState) => boolean;
  onCast?: (state: RotationState, cooldowns: number[]) => void;
}

const addToMap = (map: Map<spell, number>, key: spell, value: number) => {
  map.set(key, (map.get(key) ?? 0) + value);
};

const runRotation = (
  actions: RotationAction[],
  totalTime: number,
  initialState: RotationState = {}
): ModelResult => {
  const cooldowns = actions.map(() => 0);
  const state = { ...initialState };
  const sorted = [...actions.keys()].sort((a, b) => actions[a].priority - actions[b].priority);
  let currentTime = 0;
  let cumulativeDamage = 0;
  const points: DamagePoint[] = [];
  const perAbility = new Map<spell, AbilityEntry>();

  while (currentTime < totalTime) {
    for (const i of sorted) {
      if (cooldowns[i] > 0) continue;
      if (actions[i].canCast && !actions[i].canCast!(state)) continue;

      const actionSpell = actions[i].spell;
      const existing = perAbility.get(actionSpell) ?? { total: 0 };
      let value: number;
      if (actions[i].getBreakdown) {
        const castBreakdown = actions[i].getBreakdown!(state);
        value = [...castBreakdown.values()].reduce((a, b) => a + b, 0);
        const sub = existing.sub ?? new Map<spell, number>();
        for (const [s, v] of castBreakdown) addToMap(sub, s, v);
        perAbility.set(actionSpell, { total: existing.total + value, sub });
      } else {
        value = actions[i].getValue!(state);
        perAbility.set(actionSpell, { total: existing.total + value });
      }
      cumulativeDamage += value;
      points.push({ time: currentTime, damage: cumulativeDamage });

      cooldowns[i] = actions[i].cooldown;
      actions[i].onCast?.(state, cooldowns);

      const castTime = actions[i].castTime ?? GCD;
      currentTime += castTime;
      for (let j = 0; j < cooldowns.length; j++) {
        cooldowns[j] = Math.max(0, cooldowns[j] - castTime);
      }
      break;
    }
  }

  return { points, perAbility };
};

const resolveRskValue = (
  targets: number,
  asHealing: boolean,
  player: Player
): number => {
  if (player.talents.get(TALENTS.RUSHING_WIND_KICK) === true) {
    const rwk = TALENTS.RUSHING_WIND_KICK;
    const rwkBaseDamage = calculateSpellDamage(rwk, player);
    const rwkDamage = rwkBaseDamage * (1 + rwk.effects.damageIncrease * Math.min(targets, rwk.effects.maxDamageTargets));
    if (asHealing) {
      const atHealing = calculateAncientTeachingsHealing(rwkDamage, player, false, rwk);
      // assuming 4.5 rems on avg for efficiency
      const directHealing = calculateSpellHealing(rwk, player) * rwk.targets.healing * 0.9;
      return atHealing + directHealing;
    }
    return rwkDamage;
  }
  const rskDamage = calculateSpellDamage(SPELLS.RISING_SUN_KICK, player);
  return asHealing
    ? calculateAncientTeachingsHealing(rskDamage, player, true, SPELLS.RISING_SUN_KICK)
    : rskDamage;
};

const bokProcsReset = (hits: number): boolean => {
  const totmResetChance = TALENTS.TEACHINGS_OF_THE_MONASTERY.effects.resetChance;
  for (let i = 0; i < hits; i++) if (Math.random() < totmResetChance) return true;
  return false;
};

const rskTierProcsReset = (player: Player): boolean => {
  if (player.talents.get(TIER.T36_MISTWEAVER_4SET) !== true) return false;
  return Math.random() < TIER.T36_MISTWEAVER_4SET.effects.resetChance;
};

const chosenRsk = (talents: TalentMap): spell & { cooldown: number } => {
  return (
    talents.get(TALENTS.RUSHING_WIND_KICK) === true
      ? TALENTS.RUSHING_WIND_KICK
      : SPELLS.RISING_SUN_KICK
    // typescript for whatever reason doesn't want to see .cooldown -is- available
  ) as spell & { cooldown: number };
}

const sqrtScaledDamage = (baseValue: number, targets: number, cap: number = 5): number =>
  targets <= cap
    ? baseValue * targets
    : baseValue * targets * Math.sqrt(cap / targets);

const calculateHarmonicSurgeValue = (
  stacks: number,
  targets: number,
  asHealing: boolean,
  player: Player,
): number => {
  const hs = TALENTS.HARMONIC_SURGE;
  const perChargeDamage = calculateSpellDamage(hs, player);
  const perChargeHealing = calculateSpellHealing(hs, player);
  const totalDamage = sqrtScaledDamage(perChargeDamage * stacks, targets);
  const totalHealing = perChargeHealing * stacks * hs.targets.healing;
  return asHealing ? totalHealing : totalDamage;
};

const modelMeleeRotationWithStacks = (
  totalTime: number,
  targets: number,
  asHealing: boolean,
  player: Player,
  bokMinStacks: number,
): ModelResult => {
  const hasWotC = player.talents.get(TALENTS.WAY_OF_THE_CRANE) === true;
  const hasHarmonicSurge = player.talents.get(TALENTS.HARMONIC_SURGE) === true;
  const tpHits = hasWotC ? TALENTS.WAY_OF_THE_CRANE.effects.tigerPalmHits : 1;
  const tpDamage = calculateSpellDamage(SPELLS.TIGER_PALM, player);
  const bokDamage = calculateSpellDamage(SPELLS.BLACKOUT_KICK, player);
  const tpValue = (asHealing
    ? calculateAncientTeachingsHealing(tpDamage, player, true, SPELLS.TIGER_PALM)
    : tpDamage) * tpHits;
  const bokValue = asHealing
    ? calculateAncientTeachingsHealing(bokDamage, player, true, SPELLS.BLACKOUT_KICK)
    : bokDamage;
  const bokCleaveTargets = hasWotC ? Math.min(targets - 1, 2) : 0;
  const bokCleaveEffectiveness = TALENTS.WAY_OF_THE_CRANE.effects.blackoutKickEffectiveness;
  const rskSpell = chosenRsk(player.talents);
  const rskValue = resolveRskValue(targets, asHealing, player);

  const initialState: RotationState = { totmStacks: 0 };
  if (hasHarmonicSurge) initialState.potentialEnergyStacks = 0;

  const actions: RotationAction[] = [
    {
      spell: rskSpell,
      priority: 0,
      cooldown: rskSpell.cooldown,
      getValue: () => rskValue,
      onCast: (state, cooldowns) => {
        if (hasHarmonicSurge) {
          state.potentialEnergyStacks = Math.min(state.potentialEnergyStacks + 1, TALENTS.HARMONIC_SURGE.maxStacks);
        }
        if (rskTierProcsReset(player)) cooldowns[0] = 0;
      },
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      priority: 1,
      cooldown: SPELLS.BLACKOUT_KICK.cooldown,
      canCast: (state) => state.totmStacks >= bokMinStacks,
      getBreakdown: (state) => {
        const waves = 1 + state.totmStacks;
        const mainTargetVal = bokValue * waves;
        const cleaveVal = mainTargetVal * bokCleaveEffectiveness * bokCleaveTargets;
        const breakdown = new Map<spell, number>([[SPELLS.BLACKOUT_KICK, mainTargetVal]]);
        if (cleaveVal > 0) addToMap(breakdown, TALENTS.BLACKOUT_KICK_CLEAVE, cleaveVal);
        return breakdown;
      },
      onCast: (state, cooldowns) => {
        const hits = (1 + state.totmStacks) * (1 + bokCleaveTargets);
        state.totmStacks = 0;
        if (bokProcsReset(hits)) cooldowns[0] = 0;
      },
    },
    {
      spell: SPELLS.TIGER_PALM,
      priority: 2,
      cooldown: 0,
      getBreakdown: (state) => {
        const breakdown = new Map<spell, number>([[SPELLS.TIGER_PALM, tpValue]]);
        if (hasHarmonicSurge && state.potentialEnergyStacks > 0) {
          const hsValue = calculateHarmonicSurgeValue(state.potentialEnergyStacks, targets, asHealing, player);
          addToMap(breakdown, TALENTS.HARMONIC_SURGE, hsValue);
        }
        return breakdown;
      },
      onCast: (state) => {
        state.totmStacks += tpHits;
        if (hasHarmonicSurge) state.potentialEnergyStacks = 0;
      },
    },
  ];

  return runRotation(actions, totalTime, initialState);
};

export const modelMeleeRotation = (
  totalTime: number,
  targets: number,
  asHealing: boolean,
  player: Player
): ModelResult =>
  modelMeleeRotationWithStacks(
    totalTime, targets, asHealing, player,
    TALENTS.TEACHINGS_OF_THE_MONASTERY.maxStacks
  );

export const modelMeleeRotationAt2Stacks = (
  totalTime: number,
  targets: number,
  asHealing: boolean,
  player: Player
): ModelResult =>
  modelMeleeRotationWithStacks(totalTime, targets, asHealing, player, TALENTS.TEACHINGS_OF_THE_MONASTERY.maxStacks / 2);

export const modelSpinningCraneKick = (
  totalTime: number,
  targets: number,
  asHealing: boolean,
  player: Player
): ModelResult => {
  const hasWotC = player.talents.get(TALENTS.WAY_OF_THE_CRANE) === true;
  const baseValue = calculateSpellDamage(SPELLS.SPINNING_CRANE_KICK, player);

  const actions: RotationAction[] = [
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      priority: 0,
      cooldown: 0,
      getValue: () => {
        const raw = sqrtScaledDamage(baseValue, targets);
        return asHealing ? (hasWotC ? calculateWayOfTheCraneHealing(raw) : 0) : raw;
      },
    },
  ];

  return runRotation(actions, totalTime);
};

export const calculateJadeEmpowermentData = (
  targets: number,
  player: Player
): { damage: number; healing: number } => {
  const jadeEmpowerment = TALENTS.JADE_EMPOWERMENT;
  const cjl = SPELLS.CRACKLING_JADE_LIGHTNING;
  const effectiveTargets = Math.min(targets, 5);
  const jeMultiplier = (1 + jadeEmpowerment.effects.spellpowerIncrease / 100)
    * (1 + jadeEmpowerment.effects.chainVal * (effectiveTargets - 1));
  const channelData = calculateAncientTeachingsData(cjl, player);
  return {
    damage: channelData.damage * jeMultiplier,
    healing: channelData.healing * jeMultiplier,
  };
};

export const modelCracklingJadeLightning = (
  totalTime: number,
  targets: number,
  asHealing: boolean,
  player: Player
): ModelResult => {
  const cjl = SPELLS.CRACKLING_JADE_LIGHTNING;
  const tickInterval = 1.5; // not really 1.5s, actual is every 0.75 but graphing it is weird here
  const ticksPerChannel = cjl.castTime / tickInterval;
  const channelData = player.talents.get(TALENTS.JADE_EMPOWERMENT)
    ? calculateJadeEmpowermentData(targets, player)
    : calculateAncientTeachingsData(cjl, player);
  const tickValue = (asHealing ? channelData.healing : channelData.damage) / ticksPerChannel;

  const actions: RotationAction[] = [
    {
      spell: SPELLS.CRACKLING_JADE_LIGHTNING,
      priority: 0,
      cooldown: 0,
      castTime: tickInterval,
      getValue: () => tickValue,
    },
  ];

  return runRotation(actions, totalTime);
};

export const modelRSKWithSCKAndBok = (
  totalTime: number,
  targets: number,
  asHealing: boolean,
  player: Player
): ModelResult => {
  const hasWotC = player.talents.get(TALENTS.WAY_OF_THE_CRANE) === true;
  const rskSpell = chosenRsk(player.talents);
  const rskValue = resolveRskValue(targets, asHealing, player);
  const sckBase = calculateSpellDamage(SPELLS.SPINNING_CRANE_KICK, player);
  const bokDamage = calculateSpellDamage(SPELLS.BLACKOUT_KICK, player);
  const bokCleaveTargets = hasWotC ? Math.min(targets - 1, 2) : 0;
  const bokCleaveEffectiveness = TALENTS.WAY_OF_THE_CRANE.effects.blackoutKickEffectiveness;
  const bokValue = asHealing
    ? calculateAncientTeachingsHealing(bokDamage, player, true, SPELLS.BLACKOUT_KICK)
    : bokDamage;

  const actions: RotationAction[] = [
    {
      spell: rskSpell,
      priority: 0,
      cooldown: rskSpell.cooldown,
      getValue: () => rskValue,
      onCast: (_state, cooldowns) => {
        if (rskTierProcsReset(player)) cooldowns[0] = 0;
      },
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      priority: 1,
      cooldown: SPELLS.BLACKOUT_KICK.cooldown,
      getBreakdown: () => {
        const mainTargetVal = bokValue;
        const cleaveVal = mainTargetVal * bokCleaveEffectiveness * bokCleaveTargets;
        const breakdown = new Map<spell, number>([[SPELLS.BLACKOUT_KICK, mainTargetVal]]);
        if (cleaveVal > 0) addToMap(breakdown, TALENTS.BLACKOUT_KICK_CLEAVE, cleaveVal);
        return breakdown;
      },
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      priority: 2,
      cooldown: 0,
      getValue: () => {
        const raw = sqrtScaledDamage(sckBase, targets);
        return asHealing ? (hasWotC ? calculateWayOfTheCraneHealing(raw) : 0) : raw;
      },
    },
  ];

  return runRotation(actions, totalTime);
};

export const modelRSKWithSCK = (
  totalTime: number,
  targets: number,
  asHealing: boolean,
  player: Player
): ModelResult => {
  const hasWotC = player.talents.get(TALENTS.WAY_OF_THE_CRANE) === true;
  const rskSpell = chosenRsk(player.talents);
  const rskValue = resolveRskValue(targets, asHealing, player);
  const sckBase = calculateSpellDamage(SPELLS.SPINNING_CRANE_KICK, player);

  const actions: RotationAction[] = [
    {
      spell: rskSpell,
      priority: 0,
      cooldown: rskSpell.cooldown,
      getValue: () => rskValue,
      onCast: (_state, cooldowns) => {
        if (rskTierProcsReset(player)) cooldowns[0] = 0;
      },
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      priority: 1,
      cooldown: 0,
      getValue: () => {
        const raw = sqrtScaledDamage(sckBase, targets);
        return asHealing ? (hasWotC ? calculateWayOfTheCraneHealing(raw) : 0) : raw;
      },
    },
  ];

  return runRotation(actions, totalTime);
};
