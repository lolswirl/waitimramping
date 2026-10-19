import type spell from '@data/spells/spell';
import { GCD } from '@data/spells/spell';
import SPELLS from '@data/spells';
import TALENTS from '@data/specs/monk/mistweaver/talents';

export const MISTWEAVER_MONK_BUFFS = (spellList: spell[]): spell[] => {
    let thunderFocusTeaUsed = false;
    let soothingMistUsed = false;
    let insideChiji = false;
    let insideYulon = false;

    let totmStacks = 0;

    return spellList.map((spell) => {
        // just guard around this, can probably make a thing later to not allow both being used but w/e
        if (spell.id === SPELLS.CHI_JI.id) {
            insideChiji = true;
            insideYulon = false;
            totmStacks = 4;
        } else if (spell.id === SPELLS.YULON.id) {
            insideYulon = true;
            insideChiji = false;
        }

        if (spell.id === SPELLS.THUNDER_FOCUS_TEA.id) {
            thunderFocusTeaUsed = true;
        } else if (spell.id === SPELLS.SOOTHING_MIST.id) {
            soothingMistUsed = true;
        } else if (thunderFocusTeaUsed) {
            switch (spell.id) {
                case SPELLS.ENVELOPING_MIST.id:
                    spell = { ...spell, castTime: GCD };
                    thunderFocusTeaUsed = false;
                    break;
                case SPELLS.RISING_SUN_KICK.id:
                case TALENTS.RUSHING_WIND_KICK.id:
                    spell = { ...spell, cooldown: 3 };
                    thunderFocusTeaUsed = false;
                    break;
                case SPELLS.RENEWING_MIST.id:
                    spell = { ...spell, duration: 30 };
                    thunderFocusTeaUsed = false;
                    break;
                default:
                    break;
            }
        } else if (soothingMistUsed) {
            switch (spell.id) {
                case SPELLS.ENVELOPING_MIST.id:
                case SPELLS.SHEILUNS_GIFT.id:
                    spell = { ...spell, castTime: GCD };
                    break;
                case SPELLS.VIVIFY.id:
                case SPELLS.LIFE_COCOON.id:
                    break;
                default:
                    soothingMistUsed = false;
                    break;
            }
        } else if (spell.id === SPELLS.BLACKOUT_KICK.id) {
            totmStacks = 0;
        } else if (spell.id === SPELLS.TIGER_PALM.id) {
            // TODO: implement wotc here
            totmStacks = Math.min(totmStacks + 1, 4);
        }

        // celestial mods happen after everything else
        if (insideChiji && spell.id === SPELLS.ENVELOPING_MIST.id) {
            spell = { ...spell, castTime: GCD };
        } else if (insideYulon && spell.id === SPELLS.ENVELOPING_MIST.id) {
            const base = spell.castTime ?? GCD;
            spell = {
                ...spell,
                castTime: base * 0.7,
                replaceGCD: GCD * 0.7,
            };
        }

        return spell;
    });
};
