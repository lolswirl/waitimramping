import type spell from '@data/spells/spell';
import TALENTS from './talents';
import SHARED from '@data/specs/monk/talents';

export interface SpecTalentConfig {
    spec: Map<spell, boolean>;
    hero: Map<spell, boolean>;
    class: Map<spell, boolean>;
}

const MISTWEAVER_DEFAULT_TALENTS: SpecTalentConfig = {
    spec: new Map<spell, boolean>([
        [TALENTS.JADEFIRE_TEACHINGS, true],
        [TALENTS.RUSHING_WIND_KICK, false],
        [TALENTS.SPIRITFONT, true],
        [TALENTS.MORNING_BREEZE, true],
        [TALENTS.JADE_EMPOWERMENT, false],
        [TALENTS.TEAR_OF_MORNING, false],
        [TALENTS.WAY_OF_THE_SERPENT, false],
        [TALENTS.UPLIFTED_SPIRITS, true],
        [TALENTS.VITAL_EXPENDITURE, false],
    ]),
    hero: new Map<spell, boolean>([
        [TALENTS.TEMPLE_TRAINING, true],
        [TALENTS.YULONS_KNOWLEDGE, true],
        [TALENTS.MEDITATIVE_FOCUS, false],
    ]),
    class: new Map<spell, boolean>([
        [SHARED.FAST_FEET, true],
        [SHARED.FEROCITY_OF_XUEN, true],
        [SHARED.CHI_PROFICIENCY, true],
        [SHARED.MARTIAL_INSTINCTS, true],
    ]),
};

export default MISTWEAVER_DEFAULT_TALENTS;
