import type { specialization } from '@data/class';
import HOLY_PALADIN_SPELLS from '@data/specs/paladin/holy/spells';
import HOLY_PALADIN_ROTATIONS from '@data/specs/paladin/holy/rotations';
import HOLY_PALADIN_BUGS from '@data/specs/paladin/holy/bugs';

const HOLY_PALADIN = ({
  key: "paladin_holy",
  spells: HOLY_PALADIN_SPELLS,
  icon: 'spell_holy_holybolt',
  name: 'Holy',
  class: 'Paladin',
  color: "#ffe38e",
  rotations: HOLY_PALADIN_ROTATIONS,
  bugs: HOLY_PALADIN_BUGS,
  masteryCoefficient: 1.5,
  stats: {
    intellect: 0,
    mastery: 1.5 * 8, // 12%
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default HOLY_PALADIN;