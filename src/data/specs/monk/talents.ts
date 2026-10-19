import type spell from '@data/spells/spell';

const talents = {
    FAST_FEET: {
        name: "Fast Feet",
        id: 388809,
        icon: 'ability_monk_risingsunkick',
        effects: {
            risingSunKickIncrease: 0.7,
            spinningCraneKickIncrease: 0.1,
        },
    },
    CHI_PROFICIENCY: {
        name: "Chi Proficiency",
        id: 450426,
        icon: 'ability_monk_chiswirl',
        maxRank: 2,
        effects: {
            magicDamageIncrease: 0.02,
            healingDoneIncrease: 0.02,
        },
    },
    FEROCITY_OF_XUEN: {
        name: "Ferocity of Xuen",
        id: 388674,
        icon: 'ability_mount_pinktiger',
        maxRank: 2,
        effects: {
            damageIncrease: 0.02,
        }
    },
    MARTIAL_INSTINCTS: {
        name: "Martial Instincts",
        id: 450427,
        icon: 'ability_monk_palmstrike',
        maxRank: 2,
        effects: {
            damageIncrease: 0.02,
        }
    },
    STILLSTEP_COIL: {
        name: "Stillstep Coil",
        id: 1266733,
        icon: 'inv_helm_leather_raidmonkprogenitormythic_d_01',
    },
    SAVE_THEM_ALL: {
        name: "Save Them All",
        id: 389579,
        icon: 'inv_weapon_hand_22',
    },
    DIFFUSE_MAGIC: {
        name: "Diffuse Magic",
        id: 1243287,
        icon: 'spell_monk_diffusemagic',
    },
    ELUSIVE_MISTS: {
        name: "Elusive Mists",
        id: 388681,
        icon: 'ability_monk_soothingmists',
    },
    CHI_WAVE: {
        name: "Chi Wave",
        id: 450391,
        icon: 'ability_monk_chiwave',
    },
    TRANSCENDENCE: {
        name: "Transcendence",
        id: 101643,
        icon: 'monk_ability_transcendence',
    },
    TRANSCENDENCE_TRANSFER: {
        name: "Transcendence: Transfer",
        id: 119996,
        icon: 'spell_shaman_spectraltransformation',
    },
    TRANSCENDENCE_LINKED_SPIRITS: {
        name: "Transcendence: Linked Spirits",
        id: 434774,
        icon: 'monk_ability_transcendence',
    },
    PARALYSIS: {
        name: "Paralysis",
        id: 115078,
        icon: 'ability_monk_paralysis',
    },
    CRASHING_MOMENTUM: {
        name: "Crashing Momentum",
        id: 450342,
        icon: 'ability_monk_blackoutkick',
    },
    CALMING_PRESENCE: {
        name: "Calming Presence",
        id: 388664,
        icon: 'inv_misc_orb_01',
        effects: {
            damageReduction: 3, // percent
        }
    },
    FORTIFYING_BREW: {
        name: "Fortifying Brew",
        id: 115203,
        icon: 'ability_monk_fortifyingale_new',
    },
    IMPROVED_TOUCH_OF_DEATH: {
        name: "Improved Touch of Death",
        id: 322113,
        icon: 'ability_monk_touchofdeath',
    },
} satisfies Record<string, spell>;

export default talents;
export { talents as SHARED_MONK_TALENTS };
