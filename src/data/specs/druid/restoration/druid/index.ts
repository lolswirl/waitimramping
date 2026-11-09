import type { specialization } from '@data/class';
import DRUID_SPELLS from '@data/specs/druid/spells';
import RESTORATION_DRUID_SPELLS from '@data/specs/druid/restoration/druid/spells';
import RESTORATION_DRUID_TALENTS from '@data/specs/druid/restoration/druid/talents';
import RESTORATION_DRUID_ROTATIONS from '@data/specs/druid/restoration/druid/rotations';
import { BASE_MASTERY } from '@data/shared/stats';

const MASTERY_COEFFICIENT = 1.311;

const RESTORATION_DRUID = ({
  key: "druid_restoration",
  spells: { ...DRUID_SPELLS, ...RESTORATION_DRUID_SPELLS },
  talents: RESTORATION_DRUID_TALENTS,
  rotations: RESTORATION_DRUID_ROTATIONS,
  icon: 'spell_nature_healingtouch',
  name: 'Restoration',
  class: 'Druid',
  color: '#29ab30',
  masteryCoefficient: MASTERY_COEFFICIENT,
  stats: {
    intellect: 0,
    mastery: MASTERY_COEFFICIENT * BASE_MASTERY,
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default RESTORATION_DRUID;