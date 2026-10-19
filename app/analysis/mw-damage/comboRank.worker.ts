import TALENTS from "@data/specs/monk/mistweaver/talents";
import SHARED from "@data/specs/monk/talents";
import SPELLS from "@data/spells";
import { CLASSES } from "@data/class";
import type spell from "@data/spells/spell";
import {
  modelMeleeRotation,
  modelMeleeRotationAt2Stacks,
  modelSpinningCraneKick,
  modelCracklingJadeLightning,
  modelRSKWithSCK,
  type ModelResult,
} from "./model";
import type { Player } from "@data/specs/monk/mistweaver/calcs";
import { RAINBOW_COLORS } from "@components/Buttons/RainbowCard";

export type ComboResultSerialized = {
  talentIds: number[];
  rotationDataKey: string;
  rotationLabel: string;
  rotationColor: string;
  rotationSpellIds: number[];
  value: number;
};

const cartesian = <T,>(arrays: T[][]): T[][] => {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restCombos = cartesian(rest);
  return first.flatMap(v => restCombos.map(combo => [v, ...combo]));
};

type RotationDef = {
  dataKey: string;
  label: (useRwk: boolean, useJe: boolean) => string;
  spells: (useRwk: boolean, useJe: boolean) => spell[];
  color: string;
  modelFn: (time: number, targets: number, asHealing: boolean, player: Player) => ModelResult;
};

const rsk = (useRwk: boolean) => useRwk ? TALENTS.RUSHING_WIND_KICK : SPELLS.RISING_SUN_KICK;

const ROTATION_DEFS: RotationDef[] = [
  { dataKey: 'melee', label: (rwk) => 'TP TP BOK ' + (rwk ? 'RWK' : 'RSK'), spells: (rwk) => [SPELLS.TIGER_PALM, SPELLS.TIGER_PALM, SPELLS.BLACKOUT_KICK, rsk(rwk)], color: RAINBOW_COLORS[0], modelFn: modelMeleeRotation },
  { dataKey: 'melee2', label: (rwk) => 'TP BoK ' + (rwk ? 'RWK' : 'RSK'), spells: (rwk) => [SPELLS.TIGER_PALM, SPELLS.BLACKOUT_KICK, rsk(rwk)], color: RAINBOW_COLORS[1], modelFn: modelMeleeRotationAt2Stacks },
  { dataKey: 'sck', label: () => 'SCK', spells: () => [SPELLS.SPINNING_CRANE_KICK], color: RAINBOW_COLORS[2], modelFn: modelSpinningCraneKick },
  { dataKey: 'rskSck', label: (rwk) => (rwk ? 'RWK' : 'RSK') + ' + SCK', spells: (rwk) => [rsk(rwk), SPELLS.SPINNING_CRANE_KICK], color: RAINBOW_COLORS[3], modelFn: modelRSKWithSCK },
  { dataKey: 'je', label: (_, je) => je ? 'CJL + JE' : 'CJL', spells: (_, je) => je ? [SPELLS.CRACKLING_JADE_LIGHTNING, TALENTS.JADE_EMPOWERMENT] : [SPELLS.CRACKLING_JADE_LIGHTNING], color: RAINBOW_COLORS[4], modelFn: modelCracklingJadeLightning },
];

self.onmessage = (e: MessageEvent<{ targetCount: number; asHealing: boolean }>) => {
  const { targetCount, asHealing } = e.data;
  const MODEL_TIME = 500;
  const mistweaver = CLASSES.MONK.SPECS.MISTWEAVER;

  const specExclusivePairs: [spell, spell][] = [
    [TALENTS.JADEFIRE_TEACHINGS, TALENTS.RUSHING_WIND_KICK],
    [TALENTS.JADE_EMPOWERMENT, TALENTS.MORNING_BREEZE],
  ];
  const specIndependent: spell[] = [TALENTS.WAY_OF_THE_CRANE, TALENTS.SPIRITFONT];
  const exclusivePairCombos: [boolean, boolean][] = [[true, false], [false, true], [false, false]];
  const specPairCombos = specExclusivePairs.map(() => exclusivePairCombos);
  const specIndepCombos: boolean[][] = specIndependent.map(() => [true, false]);

  const cotcTalents: spell[] = [TALENTS.TEMPLE_TRAINING, TALENTS.YULONS_KNOWLEDGE];
  const mohTalents: spell[] = [TALENTS.MEDITATIVE_FOCUS, TALENTS.HARMONIC_SURGE];
  const heroCombos: Map<spell, boolean>[] = [];
  for (const tree of [cotcTalents, mohTalents]) {
    const m = new Map<spell, boolean>();
    cotcTalents.forEach(t => m.set(t, false));
    mohTalents.forEach(t => m.set(t, false));
    tree.forEach(t => m.set(t, true));
    heroCombos.push(m);
  }

  const classTalentList = [SHARED.FAST_FEET, SHARED.FEROCITY_OF_XUEN, SHARED.CHI_PROFICIENCY, SHARED.MARTIAL_INSTINCTS];
  const classTalentIdSet = new Set(classTalentList.map(t => t.id));

  const totalIterations =
    specPairCombos[0].length *
    specPairCombos[1].length *
    cartesian(specIndepCombos).length *
    heroCombos.length *
    ROTATION_DEFS.length;

  const results: ComboResultSerialized[] = [];
  let done = 0;
  let lastReportTime = performance.now();

  for (const [p1a, p1b] of specPairCombos[0]) {
    for (const [p2a, p2b] of specPairCombos[1]) {
      for (const indepVals of cartesian(specIndepCombos)) {
        for (const heroMap of heroCombos) {
          const talentMap = new Map<spell, boolean>();
          talentMap.set(specExclusivePairs[0][0], p1a);
          talentMap.set(specExclusivePairs[0][1], p1b);
          talentMap.set(specExclusivePairs[1][0], p2a);
          talentMap.set(specExclusivePairs[1][1], p2b);
          specIndependent.forEach((t, i) => talentMap.set(t, indepVals[i]));
          heroMap.forEach((v, t) => talentMap.set(t, v));
          classTalentList.forEach(t => talentMap.set(t, true));

          const player: Player = { talents: talentMap, stats: mistweaver.stats, corePassives: mistweaver.corePassives };
          const useRwk = talentMap.get(TALENTS.RUSHING_WIND_KICK) === true;
          const useJe = talentMap.get(TALENTS.JADE_EMPOWERMENT) === true;
          const activeTalentIds = [...talentMap.entries()].filter(([t, v]) => v && !classTalentIdSet.has(t.id)).map(([t]) => t.id);

          for (const def of ROTATION_DEFS) {
            const result = def.modelFn(MODEL_TIME, targetCount, asHealing, player);
            const val = result.points.length > 0 ? result.points[result.points.length - 1].damage / MODEL_TIME : 0;
            results.push({
              talentIds: activeTalentIds,
              rotationDataKey: def.dataKey,
              rotationLabel: def.label(useRwk, useJe),
              rotationColor: def.color,
              rotationSpellIds: def.spells(useRwk, useJe).map(s => s.id),
              value: val,
            });
            done++;
            const now = performance.now();
            if (now - lastReportTime >= 50) {
              lastReportTime = now;
              self.postMessage({ type: 'progress', pct: done / totalIterations });
            }
          }
        }
      }
    }
  }

  self.postMessage({ type: 'progress', pct: 1 });
  results.sort((a, b) => b.value - a.value);
  self.postMessage({ type: 'done', results });
};
