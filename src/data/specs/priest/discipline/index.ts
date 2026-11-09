import type { specialization } from '@data/class';
import PRIEST_SPELLS from '@data/specs/priest/spells';
import DISCIPLINE_PRIEST_SPELLS from '@data/specs/priest/discipline/spells';
import DISCIPLINE_PRIEST_TALENTS from '@data/specs/priest/discipline/talents';
import DISCIPLINE_PRIEST_ROTATIONS from '@data/specs/priest/discipline/rotations';
import { BASE_MASTERY } from '@data/shared/stats';

const MASTERY_COEFFICIENT = 1.35;

const DISCIPLINE_PRIEST = ({
  key: "priest_discipline",
  spells: { ...PRIEST_SPELLS, ...DISCIPLINE_PRIEST_SPELLS },
  talents: DISCIPLINE_PRIEST_TALENTS,
  rotations: DISCIPLINE_PRIEST_ROTATIONS,
  icon: 'spell_holy_powerwordshield',
  name: 'Discipline',
  class: 'Priest',
  color: '#e1cbd2',
  masteryCoefficient: MASTERY_COEFFICIENT,
  stats: {
    intellect: 0,
    mastery: MASTERY_COEFFICIENT * BASE_MASTERY,
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default DISCIPLINE_PRIEST;
