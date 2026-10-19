import type spell from '@data/spells/spell';
import SPELLS from '@data/spells';

const rotations = {
  FLOURISH_RAMP: [
    SPELLS.SWIFTMEND,
    SPELLS.REJUVENATION,
    SPELLS.WILD_GROWTH,
    SPELLS.REGROWTH,
    SPELLS.REGROWTH,
    SPELLS.REGROWTH
  ]
} satisfies Record<string, spell[]>;

export default rotations;
