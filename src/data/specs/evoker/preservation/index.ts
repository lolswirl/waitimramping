import type { specialization } from '@data/class';
import EVOKER_SPELLS from '@data/specs/evoker/spells';
import PRESERVATION_EVOKER_SPELLS from '@data/specs/evoker/preservation/spells';
import PRESERVATION_EVOKER_TALENTS from '@data/specs/evoker/preservation/talents';
import PRESERVATION_EVOKER_ROTATIONS from '@data/specs/evoker/preservation/rotations';
import { BASE_MASTERY } from '@data/shared/stats';

const MASTERY_COEFFICIENT = 1.8;

const PRESERVATION_EVOKER = ({
  key: "evoker_preservation",
  spells: { ...EVOKER_SPELLS, ...PRESERVATION_EVOKER_SPELLS },
  talents: PRESERVATION_EVOKER_TALENTS,
  icon: 'classicon_evoker_preservation',
  name: 'Preservation',
  class: 'Evoker',
  color: "#175a2e",
  rotations: PRESERVATION_EVOKER_ROTATIONS,
  masteryCoefficient: MASTERY_COEFFICIENT,
  stats: {
    intellect: 0,
    mastery: MASTERY_COEFFICIENT * BASE_MASTERY,
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default PRESERVATION_EVOKER;