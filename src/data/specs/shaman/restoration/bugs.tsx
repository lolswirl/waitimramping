import TALENTS from '@data/specs/shaman/restoration/talents';
import spells from '@data/specs/shaman/restoration/spells';
import { type Bug, SEVERITY, STATUS } from "@data/bugs";
import { TIER } from '@data/items/tier';
import SpellLink from '@components/SpellLink';

const BUGS: Bug[] = [
    {
        spell: TALENTS.WIND_BARRIER,
        severity: SEVERITY.HIGH,
        title: <>Sometimes reapplies every 0.1 seconds instead of every 30</>,
        description: <><SpellLink spell={TALENTS.WIND_BARRIER} /> occasionally enters a broken state where it reapplies to the caster every 0.1 seconds rather than the intended 30 second interval.</>,
        buildsTested: ["67823"],
        notes: "Fixed in 12.1.5.",
        status: STATUS.FIXED,
        logs: [
            { label: "Hypnocham", url: "https://www.warcraftlogs.com/reports/vAVGFyL19MQhNJdp?fight=29&type=healing&source=2" },
            { label: "Rober", url: "https://www.warcraftlogs.com/reports/QwGrJRgnWZ1kYKjM?fight=last&type=healing&source=4" },
            { label: "Catalina", url: "https://www.warcraftlogs.com/reports/VWFXwA9bLntRM4QT?fight=58&type=auras&start=122817133&end=124582470&source=536&ability=457387&view=events" },
            { label: "Harrek", url: "https://www.warcraftlogs.com/reports/PTQJ38XhKHrZBGag?fight=4&type=auras&source=1&ability=457387" },
            { label: "Chihao", url: "https://www.warcraftlogs.com/reports/LpA39QBhn4V8PzcH?fight=12&type=healing&source=21" },
        ],
    },
    {
        spell: spells.WATER_SHIELD,
        affectedSpells: [TALENTS.THERAZANES_RESILIENCE],
        severity: SEVERITY.HIGH,
        title: <>Talenting out of <SpellLink spell={TALENTS.THERAZANES_RESILIENCE} /> causes <SpellLink spell={spells.WATER_SHIELD} /> to restore far more mana than intended</>,
        description: <>Applying <SpellLink spell={spells.WATER_SHIELD} /> while <SpellLink spell={TALENTS.THERAZANES_RESILIENCE} /> is talented, then talenting out of it, causes the shield to restore significantly more mana than intended.</>,
        buildsTested: ["67823"],
        notes: "Fixed in 12.1.0.",
        status: STATUS.FIXED,
        logs: [{ label: "", url: "https://www.warcraftlogs.com/reports/TvLHCqPbzta9GYng?fight=39&type=resources&source=93&spell=100&view=events" }],
    },
    {
        spell: spells.EARTH_SHIELD,
        affectedSpells: [TALENTS.REACTIVE_WARDING],
        severity: SEVERITY.LOW,
        title: <>Sometimes refreshes on its own without reapplication</>,
        description: <><SpellLink spell={spells.EARTH_SHIELD} /> occasionally refreshes its duration spontaneously without being recast. This is potentially related to the <SpellLink spell={TALENTS.REACTIVE_WARDING} /> talent.</>,
        buildsTested: ["70340"],
    },
    {
        spell: TALENTS.REACTIVE_WARDING,
        affectedSpells: [spells.EARTH_SHIELD],
        severity: SEVERITY.LOW,
        title: <>Only reduces self-shield proc ICD to 2s, not ally <SpellLink spell={spells.EARTH_SHIELD} /></>,
        description: <><SpellLink spell={TALENTS.REACTIVE_WARDING} /> correctly reduces the proc ICD of shields on yourself from 3 seconds to 2 seconds, but the <SpellLink spell={spells.EARTH_SHIELD} /> applied to an ally still has the original 3 second ICD.</>,
        buildsTested: ["67823"],
    },
    {
        spell: TALENTS.SPLITSTREAM,
        affectedSpells: [spells.HEALING_STREAM_TOTEM, spells.STORMSTREAM_TOTEM],
        severity: SEVERITY.MEDIUM,
        title: <>Extra <SpellLink spell={TALENTS.STORMSWELL} /> target from <SpellLink spell={TALENTS.SPLITSTREAM} /> heals at full value</>,
        description: <><SpellLink spell={TALENTS.SPLITSTREAM} /> adds one extra target to <SpellLink spell={spells.HEALING_STREAM_TOTEM} /> at 30% effectiveness as intended, but the same extra target it adds to <SpellLink spell={TALENTS.STORMSWELL} /> (the initial burst heal of <SpellLink spell={spells.STORMSTREAM_TOTEM} />) receives a full-value heal rather than the reduced 30%.</>,
        buildsTested: ["67823"],
        logs: [{ label: "Hit 3 people at full strength", url: "https://www.warcraftlogs.com/reports/TvLHCqPbzta9GYng?fight=39&type=healing&source=93&view=events&ability=1268684" }],
    },
    {
        spell: spells.NATURES_SWIFTNESS,
        affectedSpells: [TALENTS.ANCESTRAL_SWIFTNESS, spells.HEALING_RAIN],
        severity: SEVERITY.MEDIUM,
        title: <><SpellLink spell={spells.NATURES_SWIFTNESS} /> and <SpellLink spell={TALENTS.ANCESTRAL_SWIFTNESS} /> do not make <SpellLink spell={spells.HEALING_RAIN} /> instant cast</>,
        description: <><SpellLink spell={spells.NATURES_SWIFTNESS} /> and <SpellLink spell={TALENTS.ANCESTRAL_SWIFTNESS} /> did not properly make <SpellLink spell={spells.HEALING_RAIN} /> instant cast.</>,
        buildsTested: [""],
        notes: "Fixed in 12.1.5.",
        status: STATUS.FIXED,
    },
    {
        spell: TALENTS.OVERFLOWING_SHORES,
        affectedSpells: [spells.HEALING_RAIN],
        severity: SEVERITY.LOW,
        title: <>Does not increase the visual of <SpellLink spell={spells.HEALING_RAIN} /></>,
        description: <><SpellLink spell={TALENTS.OVERFLOWING_SHORES} /> does not increase the size of the <SpellLink spell={spells.HEALING_RAIN} /> visual, but the effect itself does work.</>,
        buildsTested: ["70340"],
    },
    {
        spell: TIER.T36_RESTORATION_SHAMAN_4SET,
        affectedSpells: [spells.HEALING_RAIN],
        severity: SEVERITY.LOW,
        title: <>Tooltip says every 1s, but it applies on every <SpellLink spell={spells.HEALING_RAIN} /> tick</>,
        description: <><SpellLink spell={TIER.T36_RESTORATION_SHAMAN_4SET} /> is described as occurring "every 1s", but it applies every time <SpellLink spell={spells.HEALING_RAIN} /> ticks instead.</>,
        buildsTested: ["70340"],
    },
];

export default BUGS;
