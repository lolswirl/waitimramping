import type spell from "@data/spells/spell";
import SPELLS from "@data/spells";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import type { Player } from "@data/specs/monk/mistweaver/calcs";
import { RAINBOW_COLORS } from "@components/Buttons/RainbowCard";
import {
  modelMeleeRotation,
  modelMeleeRotationAt2Stacks,
  modelSpinningCraneKick,
  modelCracklingJadeLightning,
  modelRSKWithSCK,
  type ModelResult,
} from "./model";

export type RotationConfig = {
  dataKey: string;
  label: string;
  spells: spell[];
  color: string;
  modelFn: (time: number, targets: number, asHealing: boolean, params: Player) => ModelResult;
};

export const cartesian = <T,>(arrays: T[][]): T[][] => {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restCombos = cartesian(rest);
  return first.flatMap(v => restCombos.map(combo => [v, ...combo]));
};

export const buildRotationConfigs = (useRwk: boolean, talents: Player["talents"]): RotationConfig[] =>
  [
    {
      dataKey: 'melee',
      label: 'TP TP BOK ' + (useRwk ? 'RWK' : 'RSK'),
      spells: [SPELLS.TIGER_PALM, SPELLS.TIGER_PALM, SPELLS.BLACKOUT_KICK, useRwk ? TALENTS.RUSHING_WIND_KICK : SPELLS.RISING_SUN_KICK],
      modelFn: modelMeleeRotation,
    },
    {
      dataKey: 'melee2',
      label: 'TP BoK ' + (useRwk ? 'RWK' : 'RSK'),
      spells: [SPELLS.TIGER_PALM, SPELLS.BLACKOUT_KICK, useRwk ? TALENTS.RUSHING_WIND_KICK : SPELLS.RISING_SUN_KICK],
      modelFn: modelMeleeRotationAt2Stacks,
    },
    {
      dataKey: 'sck',
      label: 'SCK',
      spells: [SPELLS.SPINNING_CRANE_KICK],
      modelFn: modelSpinningCraneKick,
    },
    {
      dataKey: 'rskSck',
      label: (useRwk ? 'RWK' : 'RSK') + ' + SCK',
      spells: [useRwk ? TALENTS.RUSHING_WIND_KICK : SPELLS.RISING_SUN_KICK, SPELLS.SPINNING_CRANE_KICK],
      modelFn: modelRSKWithSCK,
    },
    {
      dataKey: 'je',
      label: talents.get(TALENTS.JADE_EMPOWERMENT) ? 'CJL + JE' : 'CJL',
      spells: talents.get(TALENTS.JADE_EMPOWERMENT)
        ? [SPELLS.CRACKLING_JADE_LIGHTNING, TALENTS.JADE_EMPOWERMENT]
        : [SPELLS.CRACKLING_JADE_LIGHTNING],
      modelFn: modelCracklingJadeLightning,
    },
  ].map((e, i) => ({ ...e, color: RAINBOW_COLORS[i % RAINBOW_COLORS.length] }));

export const getBackgroundColor = (color: string) => `${color}33`;
export const getBorderColor = (color: string) => `${color}66`;
export const getCardBg = (color: string) => `${color}12`;
