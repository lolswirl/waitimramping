import type { specialization } from "@data/class";
import RESTORATION_SHAMAN_SPELLS from "@data/specs/shaman/restoration/spells";
import RESTORATION_SHAMAN_ROTATIONS from "@data/specs/shaman/restoration/rotations";
import RESTORATION_SHAMAN_BUGS from "@data/specs/shaman/restoration/bugs";

const RESTORATION_SHAMAN = ({
  key: "shaman_restoration",
  spells: RESTORATION_SHAMAN_SPELLS,
  rotations: RESTORATION_SHAMAN_ROTATIONS,
  bugs: RESTORATION_SHAMAN_BUGS,
  icon: "spell_nature_magicimmunity",
  name: "Restoration",
  class: "Shaman",
  color: "#7cb63c",
  masteryCoefficient: 3.0,
  stats: {
    intellect: 0,
    mastery: 3.0 * 8, // 24%
    crit: 0,
    versatility: 0,
    haste: 0,
  },
} satisfies specialization);

export default RESTORATION_SHAMAN;
