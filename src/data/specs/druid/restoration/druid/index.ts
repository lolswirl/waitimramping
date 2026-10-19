import type { specialization } from '@data/class';
import RESTORATION_DRUID_SPELLS from '@data/specs/druid/restoration/druid/spells';
import RESTORATION_DRUID_ROTATIONS from '@data/specs/druid/restoration/druid/rotations';

const RESTORATION_DRUID = ({
  key: "druid_restoration",
  spells: RESTORATION_DRUID_SPELLS,
  rotations: RESTORATION_DRUID_ROTATIONS,
  icon: 'spell_nature_healingtouch',
  name: 'Restoration',
  class: 'Druid',
  color: '#29ab30',
  masteryCoefficient: 1.14,
  stats: {
    intellect: 0,
    mastery: 1.14 * 8, // 9.12%
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default RESTORATION_DRUID;