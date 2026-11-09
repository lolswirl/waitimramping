import type { specialization } from '@data/class';
import PALADIN_SPELLS from '@data/specs/paladin/spells';
import HOLY_PALADIN_SPELLS from '@data/specs/paladin/holy/spells';
import HOLY_PALADIN_TALENTS from '@data/specs/paladin/holy/talents';
import HOLY_PALADIN_ROTATIONS from '@data/specs/paladin/holy/rotations';
import HOLY_PALADIN_BUGS from '@data/specs/paladin/holy/bugs';
import { BASE_MASTERY } from '@data/shared/stats';

const MASTERY_COEFFICIENT = 1.5;

const HOLY_PALADIN = ({
  key: "paladin_holy",
  spells: { ...PALADIN_SPELLS, ...HOLY_PALADIN_SPELLS },
  talents: HOLY_PALADIN_TALENTS,
  icon: 'spell_holy_holybolt',
  name: 'Holy',
  class: 'Paladin',
  color: "#ffe38e",
  rotations: HOLY_PALADIN_ROTATIONS,
  bugs: HOLY_PALADIN_BUGS,
  masteryCoefficient: MASTERY_COEFFICIENT,
  stats: {
    intellect: 0,
    mastery: MASTERY_COEFFICIENT * BASE_MASTERY,
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default HOLY_PALADIN;