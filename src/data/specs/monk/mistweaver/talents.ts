import { SCHOOLS } from '@data/shared/schools';
import type spell from '@data/spells/spell';
import { CATEGORY } from '@data/spells/spell';
import { HERO_TREES } from '@data/heroTalents';
const MOH = HERO_TREES.MASTER_OF_HARMONY;
const COTC = HERO_TREES.CONDUIT_OF_THE_CELESTIALS;

const talents = {
    INVIGORATING_MISTS: {
        name: "Invigorating Mists",
        id: 274586,
        icon: 'ability_monk_vivify',
        coeff: 3.71657,
        category: CATEGORY.HEALING,
        effects: {
            sheilunsMainTargetIncrease: 5.0,
        }
    },
    LEGACY_OF_WISDOM: {
        name: "Legacy of Wisdom",
        id: 404408,
        icon: 'misc_legionfall_monk',
        effects: {
            targetsHit: 5,
            castTime: -0.5,
        },
        exclusive: [471761],
    },
    EMPERORS_FAVOR: {
        name: "Emperor's Favor",
        id: 471761,
        icon: 'inv_leather_raidmonkt2_d_01_helm',
        effects: {
            increase: 1.2,
            castTime: 0,
            targetsHit: 1,
        },
        exclusive: [404408],
    },
    JADE_EMPOWERMENT: {
        name: "Jade Empowerment",
        id: 467316,
        icon: 'ability_thunderking_thunderstruck',
        effects: {
            spellpowerIncrease: 300,
            chainVal: 0.25,
        },
        exclusive: [1277302]
    },
    DANCE_OF_CHI_JI: {
        name: "Dance of Chi-Ji",
        id: 438439,
        icon: 'ability_monk_cranekick_new',
        effects: {
            spellpowerIncrease: 400
        }
    },
    ANCIENT_TEACHINGS: {
        name: "Ancient Teachings",
        id: 388023,
        icon: 'inv_misc_book_07',
        effects: {
            transferRate: 0.25,
            armorModifier: 0.7, // sad
        }
    },
    AMPLIFIED_RUSH: {
        name: "Amplified Rush",
        id: 1271431,
        icon: 'ability_monk_rushingjadewind',
        effects: {
            gustOfMistsIncrease: 1.0,
        }
    },
    JADEFIRE_TEACHINGS: {
        name: "Jadefire Teachings",
        id: 467293,
        icon: 'inv_misc_book_07',
        effects: {
            transferRate: 3.2,
            armorModifier: 0.7, // sad
        },
        exclusive: [467307],
    },
    WAY_OF_THE_CRANE: {
        name: "Way of the Crane",
        id: 388779,
        icon: 'monk_stance_redcrane',
        effects: {
            targetsPerSCK: 1,
            transferRate: 2.80,
            armorModifier: 0.7,
            tigerPalmHits: 2,
            blackoutKickHits: 2,
            blackoutKickEffectiveness: 0.2,
        },
        exclusive: [1243155],
    },
    BLACKOUT_KICK_CLEAVE: {
        name: 'Blackout Kick (Cleave)',
        id: 228649,
        icon: 'ability_monk_roundhousekick',
        school: SCHOOLS.PHYSICAL,
        category: CATEGORY.DAMAGE,
    },
    CRANE_STYLE: {
        name: "Crane Style",
        id: 446260,
        icon: 'ability_monk_mightyoxkick',
        effects: {
            risingSunKickGOM: 2,
            blackoutKickGOM: 1,
            spinningCraneKickGOM: 1,
            gomChance: 0.1,
        }
    },
    TEACHINGS_OF_THE_MONASTERY: {
        name: "Teachings of the Monastery",
        id: 116645,
        icon: 'passive_monk_teachingsofmonastery',
        maxStacks: 4,
        effects: {
            resetChance: 0.2,
        }
    },
    GUST_OF_MISTS: {
        name: "Gust of Mists",
        id: 117907,
        icon: 'ability_monk_souldance',
        category: CATEGORY.HEALING,
        coeff: 0.1,
    },
    CELESTIAL_HARMONY: {
        name: "Celestial Harmony",
        id: 343655,
        icon: 'ability_monk_jadeserpentbreath',
        formula: (stats) => (stats.totalHp ?? 0) * 24 / 100 * (1 + stats.versatility / 100),
        targets: 5,
    },
    JADE_BOND: {
        name: "Jade Bond",
        id: 388031,
        icon: 'inv_inscription_deck_jadeserpent',
        effects: {
            duration: 25,
            gustIncrease: 0.2,
            soothingBreathIncrease: 5,
            chiCocoonEnvmDuration: 4,
        }
    },
    GIFT_OF_THE_CELESTIALS: {
        name: "Gift of the Celestials",
        id: 388212,
        icon: 'inv_pet_jadeserpentpet',
    },
    MIST_WRAP: {
        name: "Mist Wrap",
        id: 197900,
        icon: 'ability_monk_pathofmists',
        effects: {
            duration: 1,
            amp: 0.1,
        }
    },
    RAPID_DIFFUSION: {
        name: "Rapid Diffusion",
        id: 388847,
        icon: 'ability_monk_chiswirl',
        effects: {
            duration: 6,
        }
    },
    CHI_HARMONY: {
        name: "Chi Harmony",
        id: 448392,
        icon: 'ability_monk_counteractmagic',
        effects: {
            duration: 8,
            amp: 1.25,
        }
    },
    LOTUS_INFUSION: {
        name: "Lotus Infusion",
        id: 458431,
        icon: 'inv_misc_herb_chamlotus',
        effects: {
            additionalDuration: 2,
            amp: 1.06,
        }
    },
    MISTY_PEAKS: {
        name: "Misty Peaks",
        id: 388682,
        icon: 'achievement_zone_stormpeaks_10',
    },
    RESTORAL: {
        name: "Restoral",
        id: 388615,
        icon: 'ability_monk_tigerstyle',
    },
    SECRET_INFUSION: {
        name: "Secret Infusion",
        id: 388491,
        icon: 'ability_monk_chibrew',
    },
    TEAR_OF_MORNING: {
        name: "Tear of Morning",
        id: 387991,
        icon: 'ability_monk_uplift',
        effects: {
            sheilunsGiftIncrease: 0.20,
            invigoratingMistsIncrease: 0.20,
        },
        exclusive: [274909],
    },
    TEA_OF_SERENITY: {
        name: "Tea of Serenity",
        id: 393460,
        icon: 'inv_misc_food_vendor_roastedbarlytea',
    },
    TEA_OF_PLENTY: {
        name: "Tea of Plenty",
        id: 388517,
        icon: 'inv_misc_pearlmilktea',
    },
    MENDING_PROLIFERATION: {
        name: "Mending Proliferation",
        id: 388509,
        icon: 'inv_shoulder_inv_leather_raidmonk_s_01',
    },
    UNISON: {
        name: "Unison",
        id: 388477,
        icon: 'ability_creature_cursed_04',
    },
    PEER_INTO_PEACE: {
        name: "Peer Into Peace",
        id: 440008,
        icon: 'inv_staff_2h_monk_c_01',
    },
    RUSHING_WIND_KICK: {
        name: "Rushing Wind Kick",
        id: 467307,
        icon: 'inv12_ability_monk_rushingwindkick',
        castTime: 0,
        cooldown: 12,
        school: SCHOOLS.NATURE,
        coeff: { damage: 1.8694, healing: 5 }, // healing might be wrong, ph for now
        targets: { healing: 5 },
        effects: {
            maxDamageTargets: 5,
            damageIncrease: 0.06
        },
        exclusive: [467293],
        category: CATEGORY.DAMAGE,
    },
    JADE_SERPENT_STATUE: {
        name: "Jade Serpent Statue",
        id: 115313,
        icon: 'ability_monk_summonserpentstatue',
    },
    JADE_SERPENT_STATUE_SOOTHING_MIST: {
        name: "Soothing Mist",
        id: 198533,
        icon: 'ability_monk_soothingmists',
        display: {
            name: "Soothing Mist (Statue)"
        },
    },
    MANA_TEA: {
        name: "Mana Tea",
        id: 115869,
        icon: 'monk_ability_cherrymanatea',
    },
    SHAOHAOS_LESSONS: {
        name: "Shaohao's Lessons",
        id: 400089,
        icon: "ability_monk_dematerialize",
        effects: {
            secondsPerCloud: 8,
        }
    },
    VEIL_OF_PRIDE: {
        name: "Veil of Pride",
        id: 400053,
        icon: "ability_monk_vivify",
        effects: {
            secondsPerCloud: 4,
        }
    },
    JADE_INFUSION: {
        name: "Jade Infusion",
        id: 1242910,
        icon: 'ability_monk_summonserpentstatue',
    },
    PEACEFUL_MENDING: {
        name: "Peaceful Mending",
        id: 388593,
        icon: 'pandarenracial_innerpeace',
    },
    SPIRITFONT: {
        name: "Spiritfont",
        id: 1260511,
        icon: 'inv12_apextalent_monk_spiritfont',
        maxRank: 4,
        effects: {
            rskIncreaseByRank: [0, 0, 0.1, 0.2, 0.2],
            envmIncreaseByRank: [0, 0, 0.1, 0.2, 0.2],
        }
    },
    SPIRITFONT_SOOTHING_MIST: {
        name: "Soothing Mist",
        id: 1260617,
        icon: 'ability_monk_soothingmists',
        display: {
            name: "Soothing Mist (Spiritfont)"
        },
        coeff: 3.36 * 5, // always 5 targets combined
        category: CATEGORY.HEALING,
    },
    SPIRITFONT_CHI_COCOON: {
        name: "Chi Cocoon",
        id: 1260681,
        icon: 'ability_monk_chiexplosion',
        display: {
            name: "Chi Cocoon (Spiritfont)"
        },
        formula: (stats) => (stats.totalHp ?? 0) * (24 * 0.30) / 100 * (1 + stats.versatility / 100), // 30% effectiveness from regular chi cocoons
    },
    CHI_JI_GUST_OF_MISTS: {
        name: "Gust of Mists",
        id: 343819,
        icon: 'monk_stance_redcrane',
        display: {
            name: "Chi-Ji's Gust of Mists"
        },
        category: CATEGORY.HEALING,
    },
    YULON_CHI_COCOON: {
        name: "Chi Cocoon",
        id: 406139,
        icon: 'ability_monk_chiexplosion',
        display: {
            name: "Chi Cocoon (Yu'lon)"
        },
    },
    CHI_JI_CHI_COCOON: {
        name: "Chi Cocoon",
        id: 406220,
        icon: 'inv_pet_crane',
        display: {
            name: "Chi Cocoon (Chi-Ji)"
        },
    },
    ZEN_PULSE: {
        name: "Zen Pulse",
        id: 124081,
        icon: 'ability_monk_forcesphere',
        coeff: 1.6,
        category: CATEGORY.HEALING,
    },
    UPLIFTED_SPIRITS: {
        name: "Uplifted Spirits",
        id: 388551,
        icon: 'inv_helm_leather_raidmonkgoblin_d_01',
        effects: {
            revivalIncrease: 0.15,
        }
    },
    CHI_COCOON: {
        name: "Chi Cocoon",
        id: 432772,
        icon: 'ability_monk_chiexplosion',
    },
    CALMING_COALESCENCE: {
        name: "Calming Coalescence",
        id: 388218,
        icon: 'ability_monk_healthsphere',
    },
    SOOTHING_BREATH: {
        name: "Soothing Breath",
        id: 343737,
        icon: 'ability_monk_soothingmists',
    },
    MORNING_BREEZE: {
        name: "Morning Breeze",
        id: 1277302,
        icon: 'expansionicon_mistsofpandaria',
        effects: {
            masteryMultiplier: 0.08,
        },
        exclusive: [467316],
    },
    EMPERORS_ELIXIR: {
        name: "Emperor's Elixir",
        id: 1268807,
        icon: 'inv_drink_25_honeytea',
        effects: {
            ancientTeachingsEffectiveness: 0.2,
        }
    },
    CHI_WARDING: {
        name: "Chi Warding",
        id: 1277444,
        icon: 'inv_belt__inv_leather_raidmonkmythic_s_01',
    },
    FOCUSED_THUNDER: {
        name: "Focused Thunder",
        id: 197895,
        icon: 'spell_monk_nimblebrew',
        effects: {
            tftCharges: 2,
        }
    },
    RISING_MIST: {
        name: "Rising Mist",
        id: 274909,
        icon: 'ability_monk_effuse',
        exclusive: [387991],
    },
    MISTS_OF_LIFE: {
        name: "Mists of Life",
        id: 388548,
        icon: 'inv_shoulder__inv_leather_raidmonkmythic_s_01',
    },
    JADEFIRE_STOMP: {
        name: 'Jadefire Stomp',
        id: 1248812,
        icon: 'inv_ability_monk_jadefirestomp',
        school: SCHOOLS.NATURE,
        castTime: 0,
        coeff: 1.04,
        targets: 5,
        category: CATEGORY.DAMAGE,
    },
    OVERFLOWING_MISTS: {
        name: "Overflowing Mists",
        id: 388511,
        icon: 'inv_legion_faction_dreamweavers',
    },
    WAY_OF_THE_SERPENT: {
        name: "Way of the Serpent",
        id: 1243155,
        icon: 'monk_stance_wiseserpent',
        effects: {
            sheilunsGiftIncrease: 0.15,
            renewingMistIncrease: 0.30
        },
        exclusive: [388779]
    },
    YULONS_WHISPER: {
        name: "Yu'lon's Whisper",
        id: 388038,
        icon: 'ability_monk_chiexplosion',
    },
    MISTY_COALESCENCE: {
        name: "Misty Coalescence",
        id: 1268817,
        icon: 'inv_ability_monk_renewingmists_active',
        effects: {
            maxIncrease: 300,
        }
    },
    SERENE_VITALITY: {
        name: "Serene Vitality",
        id: 1242468,
        icon: 'ability_monk_expelharm',
    },
    MISTLINE: {
        name: "Mistline",
        id: 1280297,
        icon: 'ability_monk_surgingmist',
    },
    REFRESHING_JADE_WIND: {
        name: "Refreshing Jade Wind",
        id: 162530,
        icon: 'ability_monk_rushingjadewind',
    },
    CHI_BURST: {
        name: "Chi Burst",
        id: 123986,
        icon: 'spell_arcane_arcanetorrent',
    },
    REFRESHMENT: {
        name: "Refreshment",
        id: 467270,
        icon: 'inv_misc_gem_pearl_06',
    },
    HEALING_ELIXIR: {
        name: "Healing Elixir",
        id: 122280,
        icon: 'ability_monk_jasmineforcetea',
    },
    VITAL_EXPENDITURE: {
        name: "Vital Expenditure",
        id: 1299572,
        icon: "ability_monk_soothingmists",
        effects: {
            soomIncrease: 3.0
        }
    },
    ENERGIZING_BREW: {
        name: "Energizing Brew",
        id: 422031,
        icon: "ui_profession_herbalism",
    },

    // hero talents
    // master of harmony
    HARMONIC_SURGE: {
        name: "Harmonic Surge",
        id: 1270958,
        icon: 'ability_socererking_forcenova',
        heroTalent: MOH,
        coeff: {
            damage: 0.4,
            healing: 2,
        },
        school: SCHOOLS.NATURE,
        category: CATEGORY.DAMAGE,
        maxStacks: 6,
        targets: { healing: 5 }, // damage is technically unlimited targets
    },
    ASPECT_OF_HARMONY: {
        name: "Aspect of Harmony",
        id: 450508,
        icon: 'inv_ability_masterofharmonymonk_aspectofharmony',
        heroTalent: MOH,
    },
    ASPECT_OF_HARMONY_T1: {
        name: "Aspect of Harmony",
        id: 450521,
        icon: 'inv_10_gathering_bioluminescentspores_small',
        heroTalent: MOH,
    },
    ASPECT_OF_HARMONY_T2: {
        name: "Aspect of Harmony",
        id: 450526,
        icon: 'inv_10_gathering_bioluminescentspores_medium',
        heroTalent: MOH,
    },
    ASPECT_OF_HARMONY_T3: {
        name: "Aspect of Harmony",
        id: 450531,
        icon: 'inv_10_gathering_bioluminescentspores_large',
        heroTalent: MOH,
        display: {
            name: "Aspect of Harmony (Store)"
        },
    },
    ASPECT_OF_HARMONY_WITHDRAW: {
        name: "Aspect of Harmony",
        id: 450711,
        icon: 'ability_evoker_essenceburst3',
        heroTalent: MOH,
        display: {
            name: "Aspect of Harmony (Withdraw)"
        },
    },
    ASPECT_OF_HARMONY_HOT: {
        name: "Aspect of Harmony",
        id: 450769,
        icon: 'inv_enchanting_wod_essence2',
        heroTalent: MOH,
    },
    CLARITY_OF_PURPOSE: {
        name: "Clarity of Purpose",
        id: 450509,
        icon: 'ability_titankeeper_cleanse',
        heroTalent: MOH,
    },
    BALANCED_STRATAGEM: {
        name: "Balanced Stratagem",
        id: 450889,
        icon: 'ability_monk_sphereharmonydiscord',
        heroTalent: MOH,
    },
    BALANCED_STRATAGEM_NATURE: {
        name: "Balanced Stratagem",
        id: 451508,
        icon: 'ability_monk_spherediscord',
        heroTalent: MOH,
    },
    BALANCED_STRATAGEM_PHYSICAL: {
        name: "Balanced Stratagem",
        id: 451514,
        icon: 'ability_monk_sphereharmony',
        heroTalent: MOH,
    },
    PATH_OF_RESURGENCE: {
        name: "Path of Resurgence",
        id: 451084,
        icon: 'ability_monk_pathofmists',
        heroTalent: MOH,
    },
    OVERWHELMING_FORCE: {
        name: "Overwhelming Force",
        id: 451024,
        icon: 'ability_titankeeper_piercingcorruption',
        heroTalent: MOH,
        effects: {
            percentOfDamage: 15,
        }
    },
    MANTRA_OF_PURITY: {
        name: "Mantra of Purity",
        id: 451036,
        icon: 'ability_monk_domeofmist',
        heroTalent: MOH,
    },
    COALESCENCE: {
        name: "Coalescence",
        id: 450529,
        icon: 'ability_monk_effuse',
        heroTalent: MOH,
    },
    PURIFIED_SPIRIT: {
        name: "Purified Spirit",
        id: 450867,
        icon: 'ability_monk_explodingjadeblossom',
        heroTalent: MOH,
    },
    HARMONIC_GAMBIT: {
        name: "Harmonic Gambit",
        id: 450870,
        icon: 'passive_monk_teachingsofmonastery',
        heroTalent: MOH,
    },
    MANIFESTATION: {
        name: "Manifestation",
        id: 450875,
        icon: 'inv_shoulder_inv_leather_raidmonk_s_01',
        heroTalent: MOH,
    },
    MEDITATIVE_FOCUS: {
        name: "Meditative Focus",
        id: 1271105,
        icon: 'inv_misc_herb_mountainsilversage',
        heroTalent: MOH,
        spellModifier: 388023,
        effects: {
            transferRate: 0.50
        }
    },
    ENDLESS_DRAUGHT: {
        name: "Endless Draught",
        id: 450892,
        icon: 'inv_drink_25_honeytea',
        heroTalent: MOH,
    },
    WAY_OF_A_THOUSAND_STRIKES: {
        name: "Way of a Thousand Strikes",
        id: 450965,
        icon: 'ability_monk_mightyoxkick',
        heroTalent: MOH,
    },
    MANTRA_OF_TENACITY: {
        name: "Mantra of Tenacity",
        id: 451029,
        icon: 'spell_monk_brewmastertraining',
        heroTalent: MOH,
    },
    POTENTIAL_ENERGY: {
        name: "Potential Energy",
        id: 1271048,
        icon: 'spell_magic_managain',
        heroTalent: MOH,
    },

    // conduit of the celestials
    TEMPLE_TRAINING: {
        name: "Temple Training",
        id: 442743,
        icon: 'ability_monk_provoke',
        heroTalent: COTC,
        spellModifier: 137024,
        effects: {
            vivifyIncrease: 0.06,
            envIncrease: 0.06,
            sckIncrease: 0 // yay
        }
    },
    XUENS_GUIDANCE: {
        name: "Xuen's Guidance",
        id: 442687,
        icon: 'ability_monk_dpsstance',
        heroTalent: COTC,
    },
    JADE_SANCTUARY: {
        name: "Jade Sanctuary",
        id: 443059,
        icon: 'ability_monk_jadeserpentbreath',
        heroTalent: COTC,
    },
    NIUZAOS_PROTECTION: {
        name: "Niuzao's Protection",
        id: 442747,
        icon: 'ability_monk_chargingoxwave',
        heroTalent: COTC,
    },
    RESTORE_BALANCE: {
        name: "Restore Balance",
        id: 442719,
        icon: 'ability_monk_chiexplosion',
        heroTalent: COTC,
    },
    COURAGE_OF_THE_WHITE_TIGER: {
        name: "Courage of the White Tiger",
        id: 443087,
        icon: 'ability_monk_summontigerstatue',
        heroTalent: COTC,
        coeff: {
            damage: 3.51,
            healing: 3.51 * 2
        },
        school: SCHOOLS.PHYSICAL,
        category: CATEGORY.DAMAGE,
    },
    HEART_OF_THE_JADE_SERPENT: {
        name: "Heart of the Jade Serpent",
        id: 443294,
        icon: 'ability_monk_dragonkick',
        heroTalent: COTC,
    },
    STRENGTH_OF_THE_BLACK_OX: {
        name: "Strength of the Black Ox",
        id: 443110,
        icon: 'ability_monk_chargingoxwave',
        heroTalent: COTC,
        coeff: 1.5,
        targets: 5,
    },
    FLIGHT_OF_THE_RED_CRANE: {
        name: "Flight of the Red Crane",
        id: 443255,
        icon: 'inv_pet_cranegod',
        heroTalent: COTC,
        coeff: 1.25 * 2, // doubling since unity within is the only accessor
        targets: 5,
    },
    STAMPEDE_OF_THE_ANCIENTS: {
        name: "Stampede of the Ancients",
        id: 1262756,
        icon: 'monk_ability_summonoxstatue',
        heroTalent: COTC,
        effects: {
            mainTargetIncrease: 4.0,
        }
    },
    PATH_OF_THE_FALLING_STAR: {
        name: "Path of the Falling Star",
        id: 1273154,
        icon: 'ability_monk_chiswirl',
        heroTalent: COTC,
        effects: {
            singleTargetBonus: 1.0, // +100% at 1 target
            reductionPerTarget: 0.20, // -20% per additional target
        }
    },
    INNER_COMPASS: {
        name: "Inner Compass",
        id: 443571,
        icon: 'inv_10_dungeonjewelry_explorer_trinket_1compass_color2',
        heroTalent: COTC,
    },
    CRANE_STANCE: {
        name: "Crane Stance",
        id: 443572,
        icon: 'monk_stance_redcrane',
        heroTalent: COTC,
    },
    OX_STANCE: {
        name: "Ox Stance",
        id: 443574,
        icon: 'monk_stance_drunkenox',
        heroTalent: COTC,
    },
    SERPENT_STANCE: {
        name: "Serpent Stance",
        id: 443576,
        icon: 'monk_stance_wiseserpent',
        heroTalent: COTC,
    },
    TIGER_STANCE: {
        name: "Tiger Stance",
        id: 443575,
        icon: 'monk_stance_whitetiger',
        heroTalent: COTC,
    },
    UNITY_WITHIN: {
        name: "Unity Within",
        id: 443589,
        icon: 'ability_monk_prideofthetiger',
        heroTalent: COTC,
    },
    YULONS_AVATAR: {
        name: "Yu'lon's Avatar",
        id: 1262667,
        icon: 'inv_celestialserpentmount_jade',
        heroTalent: COTC,
    },
    CHRYSALIS: {
        name: "Chrysalis",
        id: 202424,
        icon: 'ability_monk_domeofmist',
        effects: {
            cooldown: 75,
        }
    },
    FLOWING_WISDOM: {
        name: "Flowing Wisdom",
        id: 1262672,
        icon: 'ability_monk_flyingdragonkick',
        heroTalent: COTC,
    },
    CHI_JIS_SWIFTNESS: {
        name: "Chi-Ji's Swiftness",
        id: 443566,
        icon: 'inv_shoulder_leather_raidmonkemerald_d_01',
        heroTalent: COTC,
    },
    YULONS_KNOWLEDGE: {
        name: "Yu'lon's Knowledge",
        id: 443625,
        icon: 'inv_jewelcrafting_jadeserpent',
        heroTalent: COTC,
        effects: {
            rskDamageIncrease: 0.15,
        }
    },
    LIFECYCLES: {
        name: "Lifecycles",
        id: 197915,
        icon: 'ability_monk_souldance',
    },
    RESPLENDENT_MIST: {
        name: "Resplendent Mist",
        id: 388020,
        icon: 'spell_nature_abolishmagic',
    },
    DANCING_MISTS: {
        name: "Dancing Mists",
        id: 388701,
        icon: 'ability_monk_serenity',
    },
    DEEP_CLARITY: {
        name: "Deep Clarity",
        id: 446345,
        icon: 'ability_monk_zenmeditation',
    },
    TRANQUIL_TEA: {
        name: "Tranquil Tea",
        id: 1270621,
        icon: 'inv_misc_pearlmilktea',
    },
    POOL_OF_MISTS: {
        name: "Pool of Mists",
        id: 173841,
        icon: 'achievement_zone_sholazar_10',
    },
    BURST_OF_LIFE: {
        name: "Burst of Life",
        id: 399226,
        icon: 'ability_rogue_imrovedrecuperate',
    },
} satisfies Record<string, spell>;

export default talents;
export { talents as MISTWEAVER_MONK_TALENTS };
