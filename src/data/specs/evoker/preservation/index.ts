import type { specialization } from '@data/class';
import PRESERVATION_EVOKER_SPELLS from '@data/specs/evoker/preservation/spells';
import PRESERVATION_EVOKER_ROTATIONS from '@data/specs/evoker/preservation/rotations';

const PRESERVATION_EVOKER = ({
  key: "evoker_preservation",
  spells: PRESERVATION_EVOKER_SPELLS,
  icon: 'classicon_evoker_preservation',
  name: 'Preservation',
  class: 'Evoker',
  color: "#175a2e",
  rotations: PRESERVATION_EVOKER_ROTATIONS,
  masteryCoefficient: 1.8,
  stats: {
    intellect: 0,
    mastery: 1.8 * 8, // 14.4%
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default PRESERVATION_EVOKER;