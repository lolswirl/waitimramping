import type spell from "@data/spells/spell";
import { SCHOOLS } from "@data/shared/schools";

const spells = {
    DISABLE: {
        name: "Disable",
        id: 116095,
        icon: 'ability_shockwave',
    },
    LEG_SWEEP: {
        name: "Leg Sweep",
        id: 119381,
        icon: 'ability_monk_legsweep',
    },
    TOUCH_OF_DEATH: {
        name: "Touch of Death",
        id: 115080,
        icon: 'ability_monk_touchofdeath',
        school: SCHOOLS.PHYSICAL,
    },
    TEACHINGS_OF_THE_MONASTERY: {
        name: "Teachings of the Monastery",
        id: 116645,
        icon: 'passive_monk_teachingsofmonastery',
        effects: {
            rskResetChance: 12, // percent
        }
    },
    TIGERS_LUST: {
        name: "Tiger's Lust",
        id: 116841,
        icon: 'ability_monk_tigerslust',
    },
    TRANSCENDENCE: {
        name: "Transcendence",
        id: 434763,
        icon: 'monk_ability_transcendence',
    },
    TRANSCENDENCE_TRANSFER: {
        name: "Transcendence: Transfer",
        id: 434766,
        icon: 'spell_shaman_spectraltransformation',
    },
    TRANSCENDENCE_LINKED_SPIRITS: {
        name: "Transcendence: Linked Spirits",
        id: 434774,
        icon: 'monk_ability_transcendence',
    },
} satisfies Record<string, spell>;

export default spells;
export { spells as SHARED_MONK_SPELLS };