import type { specialization } from '@data/class';
import HOLY_PRIEST_SPELLS from '@data/specs/priest/holy/spells';
import HOLY_PRIEST_ROTATIONS from '@data/specs/priest/holy/rotations';

const HOLY_PRIEST = ({
  key: "priest_holy",
  spells: HOLY_PRIEST_SPELLS,
  rotations: HOLY_PRIEST_ROTATIONS,
  icon: 'spell_holy_guardianspirit',
  name: 'Holy',
  class: 'Priest',
  color: '#668ea7',
  masteryCoefficient: 0.908437,
  stats: {
    intellect: 0,
    mastery: 0.908437 * 8, // 7.267496%
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default HOLY_PRIEST;