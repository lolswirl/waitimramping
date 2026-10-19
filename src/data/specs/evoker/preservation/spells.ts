import type spell from '@data/spells/spell';
import { CATEGORY } from '@data/spells/spell';

const spells = {
  TEMPORAL_ANOMALY: {
    name: 'Temporal Anomaly',
    id: 373861,
    icon: 'ability_evoker_temporalanomaly',
    castTime: 1.5,
    category: CATEGORY.HEALING,
  },
  ECHO: {
    name: 'Echo',
    id: 364343,
    icon: 'ability_evoker_echo',
    castTime: 0,
    category: CATEGORY.HEALING,
  },
  VERDANT_EMBRACE: {
    name: 'Verdant Embrace',
    id: 360995,
    icon: 'ability_evoker_rescue',
    castTime: 0,
    category: CATEGORY.HEALING,
  },
  DREAM_BREATH: {
    name: 'Dream Breath',
    id: 355936,
    icon: 'ability_evoker_dreambreath',
    castTime: 2.5,
    empowerLevel: 5,
    category: CATEGORY.HEALING,
  },
  EMERALD_BLOSSOM: {
    name: 'Emerald Blossom',
    id: 355913,
    icon: 'ability_evoker_emeraldblossom',
    castTime: 0,
    category: CATEGORY.HEALING,
  },
  REVERSION: {
    name: 'Reversion',
    id: 366155,
    icon: 'ability_evoker_reversion',
    castTime: 0,
    category: CATEGORY.HEALING,
  },
  STASIS: {
    name: 'Stasis',
    id: 370537,
    icon: 'ability_evoker_stasis',
    castTime: 0,
    category: CATEGORY.COOLDOWN,
  },
  HOVER: {
    name: 'Hover',
    id: 358267,
    icon: 'ability_evoker_hover',
    castTime: 0,
    category: CATEGORY.UTILITY,
  },
} satisfies Record<string, spell>;

export default spells;
export { spells as PRESERVATION_EVOKER_SPELLS };
