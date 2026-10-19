import SPELLS from '@data/spells';
import TALENTS from '@data/talents';
import { type Bug, SEVERITY, STATUS } from "@data/bugs";
import { TAGS } from "@data/shared/tags";
import SpellLink from '@components/SpellLink';

const BUGS: Bug[] = [
    {
        spell: TALENTS.STILLSTEP_COIL,
        severity: SEVERITY.LOW,
        title: <>Stillstep Coil requires melee range</>,
        description: <>Player must be in melee range when <SpellLink spell={SPELLS.LEG_SWEEP}/> expires otherwise <SpellLink spell={SPELLS.DISABLE}/> is not applied</>,
        buildsTested: ["63728", "65337"],
        notes: "I assume bug because it says 'Leg Sweep applies' rather than 'When Leg Sweep ends, player applies'",
        tags: [],
        status: STATUS.FIXED,
    },
    {
        spell: SPELLS.TOUCH_OF_DEATH,
        severity: SEVERITY.LOW,
        title: <>Usable during <SpellLink spell={SPELLS.CELESTIAL_CONDUIT}/> channel</>,
        description: <><SpellLink spell={SPELLS.TOUCH_OF_DEATH}/> is usable during the <SpellLink spell={SPELLS.CELESTIAL_CONDUIT}/> channel, despite canceling on damage/healing abilities</>,
        buildsTested: ["65727", "65769", "65848", "67186"],
        logs: [{ label: "", url: "https://www.warcraftlogs.com/reports/vkLZ3MzFDa7GRdY8?fight=26&type=summary&source=6&view=events&start=3553847&end=3557704" }],
        tags: [TAGS.CONDUIT],
    },
    {
        spell: SPELLS.TIGERS_LUST,
        severity: SEVERITY.MEDIUM,
        title: <>Global cooldown after casting is unhasted</>,
        description: <>The global cooldown after casting <SpellLink spell={SPELLS.TIGERS_LUST}/> is unhasted, meaning it is a full 1.5s global.</>,
        buildsTested: ["67088", "67186", "68209"],
        notes: "This makes for awkward gameplay with higher haste levels.",
        status: STATUS.FIXED,
    },
    {
        spell: SPELLS.TRANSCENDENCE_LINKED_SPIRITS,
        severity: SEVERITY.LOW,
        title: <>Recasting <SpellLink spell={SPELLS.TRANSCENDENCE}/> removes the link, but doesn't reapply it</>,
        description: <>If you currently have a <SpellLink spell={SPELLS.TRANSCENDENCE_LINKED_SPIRITS}/> link active, recasting <SpellLink spell={SPELLS.TRANSCENDENCE}/> will remove the buff from your previous link but not reapply it to your new target until your next <SpellLink spell={SPELLS.TRANSCENDENCE}/> cast (10s cooldown).</>,
        buildsTested: ["67314"],
    },
    {
        spell: SPELLS.TRANSCENDENCE_LINKED_SPIRITS,
        severity: SEVERITY.LOW,
        title: <>Multiple monks can't have the same linked spirit</>,
        description: <>Multiple monks placing a <SpellLink spell={SPELLS.TRANSCENDENCE_LINKED_SPIRITS}/> link on the same target will not stack, and only the most recent link will remain active, removing the older link.</>,
        buildsTested: ["67823"],
    },
    {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING,
        severity: SEVERITY.LOW,
        title: <>Knockback on melee attackers is non-existent or incredibly low</>,
        description: <>The knockback effect of <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING}/> on melee attackers is either non-existent or incredibly low, after multiple minutes of receiving melee hits getting 0 knockbacks.</>,
        buildsTested: ["68235"],
    },
    {
        spell: TALENTS.IMPROVED_TOUCH_OF_DEATH,
        severity: SEVERITY.LOW,
        title: <><SpellLink spell={SPELLS.TOUCH_OF_DEATH}/> does not execute under max HP threshold</>,
        description: <>Attempting to execute a mob with <SpellLink spell={SPELLS.TOUCH_OF_DEATH}/> while the target is below your max hp threshold instead deals 35% of your max hp as damage. Works fine above the threshold, as the talent states.</>,
        buildsTested: ["68453"],
    }
];

export default BUGS;
