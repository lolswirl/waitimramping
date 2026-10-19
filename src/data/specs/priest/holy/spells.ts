import type spell from '@data/spells/spell';
import { CATEGORY } from '@data/spells/spell';

const spells = {
  HOLY_WORD_CHASTISE: {
    name: 'Holy Word: Chastise',
    id: 88625,
    icon: 'spell_holy_chastise',
    category: CATEGORY.DAMAGE,
  },
  GUARDIAN_SPIRIT: {
    name: 'Guardian Spirit',
    id: 47788,
    icon: 'spell_holy_guardianspirit',
    category: CATEGORY.COOLDOWN,
  },
  FLASH_HEAL: {
    name: 'Flash Heal',
    id: 2061,
    icon: 'spell_holy_flashheal',
    category: CATEGORY.HEALING,
  },
  PRAYER_OF_HEALING: {
    name: 'Prayer of Healing',
    id: 596,
    icon: 'spell_holy_prayerofhealing02',
    category: CATEGORY.HEALING,
  },
  RENEW: {
    name: 'Renew',
    id: 139,
    icon: 'spell_holy_renew',
    category: CATEGORY.HEALING,
  },
  HOLY_NOVA: {
    name: 'Holy Nova',
    id: 132157,
    icon: 'spell_holy_holynova',
    category: CATEGORY.HEALING,
  },
} satisfies Record<string, spell>;

export default spells;
export { spells as HOLY_PRIEST_SPELLS };
