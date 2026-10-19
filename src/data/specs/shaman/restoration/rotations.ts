import type spell from "@data/spells/spell";
import SPELLS from "@data/spells";

const rotations = {
    RIPTIDE: [
        SPELLS.RIPTIDE,
        SPELLS.RIPTIDE,
        SPELLS.RIPTIDE,
        SPELLS.UNLEASH_LIFE,
        SPELLS.CHAIN_HEAL,
    ],
} satisfies Record<string, spell[]>;

export default rotations;
