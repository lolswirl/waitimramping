import type spell from '@data/spells/spell';
import { CATEGORY } from '@data/spells/spell';

const talents = {
    FORBEARANCE: {
        name: "Forbearance",
        id: 25771,
        icon: 'spell_holy_removecurse',
        category: CATEGORY.OTHER,
    },
    CRUSADER_AURA: {
        name: "Crusader Aura",
        id: 32223,
        icon: 'spell_holy_crusaderaura',
        category: CATEGORY.OTHER,
    },
} satisfies Record<string, spell>;

export default talents;
export { talents as PALADIN_TALENTS };
