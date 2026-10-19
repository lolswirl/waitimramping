import type { specialization } from '@data/class';
import DISCIPLINE_PRIEST_SPELLS from '@data/specs/priest/discipline/spells';
import DISCIPLINE_PRIEST_ROTATIONS from '@data/specs/priest/discipline/rotations';

const DISCIPLINE_PRIEST = ({
  key: "priest_discipline",
  spells: DISCIPLINE_PRIEST_SPELLS,
  rotations: DISCIPLINE_PRIEST_ROTATIONS,
  icon: 'spell_holy_powerwordshield',
  name: 'Discipline',
  class: 'Priest',
  color: '#e1cbd2',
  masteryCoefficient: 1.35,
  stats: {
    intellect: 0,
    mastery: 1.35 * 8, // 10.8%
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default DISCIPLINE_PRIEST;
