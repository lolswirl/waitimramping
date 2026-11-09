import type { specialization } from "@data/class";
import SHAMAN_SPELLS from "@data/specs/shaman/spells";
import RESTORATION_SHAMAN_SPELLS from "@data/specs/shaman/restoration/spells";
import RESTORATION_SHAMAN_TALENTS from "@data/specs/shaman/restoration/talents";
import RESTORATION_SHAMAN_ROTATIONS from "@data/specs/shaman/restoration/rotations";
import RESTORATION_SHAMAN_BUGS from "@data/specs/shaman/restoration/bugs";
import { BASE_MASTERY } from "@data/shared/stats";

const MASTERY_COEFFICIENT = 3.0;

const RESTORATION_SHAMAN = ({
  key: "shaman_restoration",
  spells: { ...SHAMAN_SPELLS, ...RESTORATION_SHAMAN_SPELLS },
  talents: RESTORATION_SHAMAN_TALENTS,
  rotations: RESTORATION_SHAMAN_ROTATIONS,
  bugs: RESTORATION_SHAMAN_BUGS,
  icon: "spell_nature_magicimmunity",
  name: "Restoration",
  class: "Shaman",
  color: "#7cb63c",
  masteryCoefficient: MASTERY_COEFFICIENT,
  stats: {
    intellect: 0,
    mastery: MASTERY_COEFFICIENT * BASE_MASTERY,
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default RESTORATION_SHAMAN;
