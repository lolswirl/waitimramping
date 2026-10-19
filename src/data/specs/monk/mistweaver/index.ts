import '@data/specs/monk/mistweaver/calcs';
import type { specialization } from '@data/class';
import MISTWEAVER_KEY from '@data/specs/monk/mistweaver/key';
import MISTWEAVER_MONK_SPELLS from '@data/specs/monk/mistweaver/spells';
import MISTWEAVER_MONK_TALENTS from '@data/specs/monk/mistweaver/talents';
import MISTWEAVER_MONK_ROTATIONS from '@data/specs/monk/mistweaver/rotations';
import { MISTWEAVER_MONK_BUFFS } from '@data/specs/monk/mistweaver/buffs';
import MISTWEAVER_MONK_BUGS from '@data/specs/monk/mistweaver/bugs';
import MONK_BUGS from '@data/specs/monk/bugs';
import MISTWEAVER_DEFAULT_TALENTS from '@data/specs/monk/mistweaver/defaultTalents';
import corePassive from '@data/specs/monk/mistweaver/core-passive/core-passive';
import corePassive2 from '@data/specs/monk/mistweaver/core-passive/core-passive-2';
import TIER from '@data/items/tier';
import type spell from '@data/spells/spell';

const MISTWEAVER_TIER_SET = new Map<spell, boolean>([
  [TIER.T36_MISTWEAVER_2SET, true],
  [TIER.T36_MISTWEAVER_4SET, true],
]);

export const MASTERY_COEFFICIENT = 31.185;

const MISTWEAVER_MONK = ({
  key: MISTWEAVER_KEY,
  spells: MISTWEAVER_MONK_SPELLS,
  talents: MISTWEAVER_MONK_TALENTS,
  rotations: MISTWEAVER_MONK_ROTATIONS,
  buffs: MISTWEAVER_MONK_BUFFS,
  bugs: MONK_BUGS.concat(MISTWEAVER_MONK_BUGS),
  icon: 'spell_monk_mistweaver_spec',
  name: 'Mistweaver',
  class: 'Monk',
  color: '#4ea55c',
  masteryCoefficient: MASTERY_COEFFICIENT,
  corePassives: [corePassive.MISTWEAVER_MONK, corePassive2.MISTWEAVER_MONK_2],
  defaultTalents: MISTWEAVER_DEFAULT_TALENTS,
  tierSet: MISTWEAVER_TIER_SET,
  stats: {
    intellect: 620,
    mastery: MASTERY_COEFFICIENT * 8, // 249.48%
    crit: 0,
    versatility: 0,
    haste: 0,
    stamina: 4600, 
    totalHp: 92000, // stamina * 20, unsure if we keep hp here
  },
} satisfies specialization)

export default MISTWEAVER_MONK;
