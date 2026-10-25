import DamageComparison from "./analysis/mw-damage/DamageComparison";
import SpellReference from "./analysis/spell-reference/SpellReference";
import ChiJiPage from "./analysis/chi-ji/ChiJiPage";
import HotJS from "./analysis/heart-of-the-jade-serpent/HotJS";
import RisingSunKickResets from "./analysis/rising-sun-kick-resets/RisingSunKickResets";
import Conduit from "./analysis/celestial-conduit/Conduit";
import HarmonicSurge from "./analysis/harmonic-surge/HarmonicSurge";
import SheilunVsDocJ from "./analysis/sheilun-vs-docj/SheilunVsDocJ";
import SheilunsGiftBreakdown from "./analysis/sheiluns-gift-breakdown/SheilunsGiftBreakdown";
import RushingWindKickComparison from "./analysis/rushing-wind-kick/RushingWindKick";
import MistyCoalescence from "./analysis/misty-coalescence/MistyCoalescence";
import AbsorbVsDRCompare from "./analysis/external-comparison/AbsorbVsDRCompare";
import WhenDoIRamp from "./when-do-i-ramp/WhenDoIRamp";
import Timeline from "./timeline/Timeline";
import Interactions from "./analysis/interactions/Interactions"
import SPELLS from "@data/spells";
import SpellLink from "@components/SpellLink";
import TALENTS from "@data/talents";
import { date } from "@util/stringManipulation";

export interface AnalysisPage {
  label: React.ReactNode;
  path: string;
  preview: string;
  description: React.ReactNode;
  extra?: string;
  tags: string[];
  createdDate: Date;
  component: React.ComponentType<{ title: React.ReactNode; description: React.ReactNode }>;
}

export const externalComparison = {
  label: "Absorb vs. Damage Reduction",
  path: "/analysis/external-comparison",
  preview: "/previews/external-comparison.png",
  description: "Compare the effectiveness of Damage Reduction to find how damage can scale past Absorbs",
  tags: ["Damage Reduction"],
  createdDate: date(2025, 3, 10),
  component: AbsorbVsDRCompare
};


export const mwDamage = {
  label: "Mistweaver Damage Comparison",
  path: "/analysis/mw-damage",
  preview: "/previews/mw-damage.png",
  description: "Evaluate formulated damage output of Mistweaver rotations",
  tags: ["Rotation", "Damage"],
  createdDate: date(2025, 3, 26),
  component: DamageComparison
};

export const harmonicSurge = {
  label: <SpellLink spell={TALENTS.HARMONIC_SURGE}/>,
  path: "/analysis/harmonic-surge",
  preview: "/previews/harmonic-surge.png",
  description: <>
    Analyze <SpellLink spell={TALENTS.HARMONIC_SURGE}/>'s spellpower output compared to the other <SpellLink spell={TALENTS.ANCIENT_TEACHINGS}/> abilities
  </>,
  tags: ["Procs", "Monk"],
  createdDate: date(2025, 6, 28),
  component: HarmonicSurge
};

export const risingSunKickResets = {
  label: <>
    <SpellLink spell={SPELLS.RISING_SUN_KICK}/> Resets
  </>,
  path: "/analysis/rising-sun-kick-resets",
  preview: "/previews/rising-sun-kick-resets.png",
  description: <>
    Find the probabilities of <SpellLink spell={SPELLS.RISING_SUN_KICK}/> resets based on input rotations
  </>,
  tags: ["Probability", "Monk", "Rotation"],
  createdDate: date(2025, 7, 10),
  component: RisingSunKickResets
};

export const chiJi = {
  label: <>
    <SpellLink spell={SPELLS.CHI_JI}/> "Simulation"
  </>,
  path: "/analysis/chi-ji",
  preview: "/previews/chi-ji.png",
  description: <>
    Simulate the theoretical HPS of rotations inside <SpellLink spell={SPELLS.CHI_JI}/>
  </>,
  tags: ["Healing", "Monk", "Rotation"],
  createdDate: date(2025, 7, 12),
  component: ChiJiPage
};

export const heartOfTheJadeSerpent = {
  label: <SpellLink spell={TALENTS.HEART_OF_THE_JADE_SERPENT}/>,
  path: "/analysis/heart-of-the-jade-serpent",
  preview: "/previews/heart-of-the-jade-serpent.png",
  description: <>
    Analyze the effects of <SpellLink spell={TALENTS.HEART_OF_THE_JADE_SERPENT}/>'s increased cooldown recovery rate to find how many extra casts you get during a fight
  </>,
  tags: ["Monk"],
  createdDate: date(2025, 8, 1),
  component: HotJS
};

export const celestialConduit = {
  label: <>
    <SpellLink spell={SPELLS.CELESTIAL_CONDUIT}/> Comparison
  </>,
  path: "/analysis/celestial-conduit",
  preview: "/previews/celestial-conduit.png",
  description: <>
    Analyze <SpellLink spell={SPELLS.CELESTIAL_CONDUIT}/>'s output compared to other spells and abilities
  </>,
  tags: ["Monk"],
  createdDate: date(2025, 9, 16),
  component: Conduit
};

export const mistyCoalescence = {
  label: <SpellLink spell={TALENTS.MISTY_COALESCENCE}/>,
  path: "/analysis/misty-coalescence",
  preview: "/previews/misty-coalescence.png",
  description: <>
    Graph <SpellLink spell={SPELLS.RENEWING_MIST}/>'s healing increase based on group size with <SpellLink spell={TALENTS.MISTY_COALESCENCE}/>
  </>,
  tags: ["Healing", "Monk"],
  createdDate: date(2026, 1, 25),
  component: MistyCoalescence
};

export const jadefireTeachingsRwk = {
  label: <>
    <SpellLink spell={TALENTS.JADEFIRE_TEACHINGS}/> vs. <SpellLink spell={TALENTS.RUSHING_WIND_KICK}/>
  </>,
  path: "/analysis/rushing-wind-kick",
  preview: "/previews/jft-rwk.png",
  description: <>
    Compare <SpellLink spell={SPELLS.RISING_SUN_KICK}/> (<SpellLink spell={TALENTS.JADEFIRE_TEACHINGS}/>) and <SpellLink spell={TALENTS.RUSHING_WIND_KICK}/> damage and healing output
  </>,
  tags: ["Healing", "Monk"],
  createdDate: date(2026, 2, 15),
  component: RushingWindKickComparison
};

export const sheilunVsDocj = {
  label: <>
    <SpellLink spell={SPELLS.SHEILUNS_GIFT}/> vs. <SpellLink spell={TALENTS.DANCE_OF_CHI_JI}/>
  </>,
  path: "/analysis/sheilun-vs-docj",
  preview: "/previews/sg-docj.png",
  description: <>
    Compare the healing output of <SpellLink spell={SPELLS.SHEILUNS_GIFT}/> main target to a <SpellLink spell={TALENTS.DANCE_OF_CHI_JI}/> proc (1 Friendly Only)
  </>,
  tags: ["Healing", "Monk"],
  createdDate: date(2026, 4, 15),
  component: SheilunVsDocJ
};

export const sheilunsGiftBreakdown = {
  label: <>
    <SpellLink spell={SPELLS.SHEILUNS_GIFT}/> Breakdown
  </>,
  path: "/analysis/sheiluns-gift-breakdown",
  preview: "/previews/sg-breakdown.png",
  description: <>
    Break down <SpellLink spell={SPELLS.SHEILUNS_GIFT}/>'s healing distribution
  </>,
  tags: ["Healing", "Monk"],
  createdDate: date(2026, 4, 22),
  component: SheilunsGiftBreakdown
};

export const whenDoIRamp = {
  label: "When Do I Ramp?",
  path: "/when-do-i-ramp",
  preview: "/previews/when-do-i-ramp.png",
  description: "Calculate when to start your ramp before a mechanic",
  tags: ["Healing", "Damage", "Rotation"],
  createdDate: date(2025, 2, 28),
  component: WhenDoIRamp
};

export const spellTimeline = {
  label: "Spell Timeline",
  path: "/timeline",
  preview: "/previews/timeline.png",
  description: "Create customized timelines for spell casts and cooldowns",
  tags: ["Healing", "Damage", "Rotation"],
  createdDate: date(2025, 3, 10),
  component: Timeline
};

export const spellReference = {
  label: "Spell Reference",
  path: "/analysis/spell-reference",
  preview: "/previews/spell-reference.png",
  description: "Spellpower for every spell and talent, with your stats and talents applied",
  tags: [],
  createdDate: date(2026, 5, 31),
  component: SpellReference,
};

export const interactions = {
    label: "Interactions",
    path: "/analysis/interactions",
    preview: "/previews/interactions.png",
    description: "Flowchart of spell and talent interactions",
    tags: [],
    createdDate: date(2026, 10, 25),
    component: Interactions,
}

export const analysisPages: AnalysisPage[] = [
    spellReference,
    externalComparison,
    mwDamage,
    harmonicSurge,
    risingSunKickResets,
    chiJi,
    heartOfTheJadeSerpent,
    celestialConduit,
    mistyCoalescence,
    jadefireTeachingsRwk,
    sheilunVsDocj,
    sheilunsGiftBreakdown,
    whenDoIRamp,
    spellTimeline,
    interactions
];
