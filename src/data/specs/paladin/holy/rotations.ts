import type spell from '@data/spells/spell';
import SPELLS from '@data/spells';

const rotations = {
  DIVINE_TOLL_RISING_SUNLIGHT: [
    SPELLS.BEACON_OF_VIRTUE,
    SPELLS.DIVINE_TOLL,
    SPELLS.ETERNAL_FLAME,
    SPELLS.HOLY_SHOCK,
    SPELLS.ETERNAL_FLAME,
    SPELLS.HOLY_SHOCK,
    SPELLS.ETERNAL_FLAME,
  ]
} satisfies Record<string, spell[]>;

export default rotations;
