import type CorePassive from '@data/core-passives/core-passive';
import SPELLS from '@data/spells';
import TALENTS from '@data/talents';

const corePassive = {
    MISTWEAVER_MONK_2: {
        name: 'Mistweaver Monk',
        id: 1258138,
        icon: 'ability_mage_firestarter',
        effects: [
            {
                type: 'Apply Aura: Animation Replacement',
                pvpMultiplier: 1,
            },
            {
                type: 'Apply Aura: Attack Power equals Spell Power %',
                value: 104,
                pvpMultiplier: 1,
            },
            {
                type: 'Apply Aura: Modifies Spell Effectiveness',
                value: 30,
                pvpMultiplier: 1,
            },
            {
                type: 'Apply Aura: Modifies Global Cooldown by Haste',
                value: 100,
                pvpMultiplier: 1,
                affectedSpells: [
                    SPELLS.TIGER_PALM.id,
                    SPELLS.BLACKOUT_KICK.id,
                    SPELLS.SPINNING_CRANE_KICK.id,
                    SPELLS.LEG_SWEEP.id,
                    SPELLS.TOUCH_OF_DEATH.id,
                    SPELLS.RISING_SUN_KICK.id,
                    TALENTS.RUSHING_WIND_KICK.id,
                    TALENTS.TRANSCENDENCE.id,
                    TALENTS.PARALYSIS.id,
                    SPELLS.DISABLE.id,
                    //TALENTS.RUSHING_JADE_WIND.id, not mistweaver
                    //TALENTS.REFRESHING_JADE_WIND.id, removed
                    TALENTS.TRANSCENDENCE_LINKED_SPIRITS.id,
                    //TALENTS.SWEEP_THE_LEG.id, no clue
                    //TALENTS.GLORY_OF_THE_DAWN.id, azerite
                    TALENTS.TRANSCENDENCE_TRANSFER.id,
                    //TALENTS.TORNADO_KICK.id,
                    TALENTS.CRASHING_MOMENTUM.id,
                ]
            },
            {
                type: 'Apply Aura: Modifies Cooldown by Haste',
                value: 100,
                pvpMultiplier: 1,
                affectedSpells: [
                    SPELLS.TIGER_PALM.id,
                    SPELLS.BLACKOUT_KICK.id,
                    SPELLS.SPINNING_CRANE_KICK.id,
                    //TALENTS.TORNADO_KICK.id,
                ]
            },
            {
                type: 'Apply Aura: Mod Mana Regen %',
                value: -20,
                pvpMultiplier: 1,
            },
            {
                type: 'Apply Aura: Mod Attacker Crit Chance %',
                pvpMultiplier: 1,
            },
            {
                type: 'Apply Aura: Modifies Cooldown',
                value: 2000,
                pvpMultiplier: 1,
                affectedSpells: [
                    SPELLS.RISING_SUN_KICK.id,
                    TALENTS.RUSHING_WIND_KICK.id,
                ]
            },
            {
                type: 'Apply Aura: Modifies Power Cost',
                value: -100,
                pvpMultiplier: 1,
                affectedSpells: [
                    SPELLS.TIGER_PALM.id,
                ]
            },
            {
                type: "Apply Aura: Add Modifier - Flat (Label): Modifies Effect #1's Value",
                value: 8,
                pvpMultiplier: 1,
                affectedSpells: [
                    SPELLS.TEACHINGS_OF_THE_MONASTERY.id,
                ]
            },
            {
                type: "Apply Aura: Add Modifier - Flat (Label): Modifies Effect #1's Value",
                value: 10,
                pvpMultiplier: 1,
                affectedSpells: [
                    //TALENTS.BONEDUST_BREW.id, removed in dragonflight
                ]
            },
            {
                type: 'Apply Aura: Mod Cooldown Ms',
                value: -15000,
                pvpMultiplier: 1,
            },
            {
                type: "Apply Aura: Add Modifier - % (Label): Modifies Effect #1's Value",
                value: -70,
                pvpMultiplier: 1,
                affectedSpells: [
                    //TALENTS.STRENGTH_OF_SPIRIT.id, removed in midnight
                ]
            },
            {
                type: "Apply Aura: Add Modifier - % (Label): Modifies Effect #1's Value",
                value: -70,
                pvpMultiplier: 1,
                affectedSpells: [
                    //TALENTS.PROFOUND_REBUTTAL.id, removed in midnight
                ]
            },
            {
                type: "Apply Aura: Modifies Effect #2's Value",
                value: 15,
                pvpMultiplier: 1,
                affectedSpells: [
                    //SPELLS.EXPEL_HARM.id, // removed in midnight
                ]
            },
            {
                type: "Apply Aura: Add Modifier - Flat (Label): Modifies Effect #1's Value",
                value: -3,
                affectedSpells: [
                    TALENTS.CALMING_PRESENCE.id,
                ]
            },
            {
                type: "Apply Aura: Add Modifier - % (Label): Modifies Effect #1's Value",
                value: 100,
                affectedSpells: [
                    //TALENTS.BOUNCE_BACK.id, removed in midnight
                ]
            },
            {
                type: 'Apply Aura: Modifies Damage Done',
                value: 700,
                pvpMultiplier: 1,
                affectedSpells: [
                    TALENTS.JADEFIRE_STOMP.id,
                ]
            },
            {
                type: 'Apply Aura: Add Modifier - Flat (Label): Modifies Buff Duration',
                value: 2000,
                pvpMultiplier: 1,
                affectedSpells: [
                    //TALENTS.BOUNCE_BACK.id, removed in midnight
                ]
            },
            {
                type: "Apply Aura: Add Modifier - Flat (Label): Modifies Effect #1's Value",
                value: -10,
                pvpMultiplier: 1,
                affectedSpells: [
                    TALENTS.OVERWHELMING_FORCE.id,
                ]
            },
            {
                type: 'Apply Aura: ?? (Aura #648)',
                value: 20,
                pvpMultiplier: 1,
            },
            {
                type: "Apply Aura: Add Modifier - Flat (Label): Modifies Effect #1's Value",
                value: 2000,
                pvpMultiplier: 1,
            },
            {
                type: "Apply Aura: Add Modifier - Flat (Label): Modifies Effect #2's Value",
                value: 100,
                pvpMultiplier: 1,
                affectedSpells: [
                    TALENTS.COURAGE_OF_THE_WHITE_TIGER.id,
                ]
            },
            {
                type: 'Apply Aura: Modifies Cooldown',
                value: -240000, // -4 mins
                pvpMultiplier: 1,
                affectedSpells: [
                    TALENTS.FORTIFYING_BREW.id,
                ]
            },
            {
                type: "Apply Aura: Add Modifier - Flat (Label): Modifies Effect #1's Value",
                value: -13,
                pvpMultiplier: 1,
                affectedSpells: [
                    //TALENTS.INVOKERS_DELIGHT.id, removed
                ]
            },
            {
                type: 'Apply Aura: Modifies Buff Duration',
                value: -1000, //-1 sec
                pvpMultiplier: 1,
                affectedSpells: [
                    SPELLS.CRACKLING_JADE_LIGHTNING.id,
                ]
            },
            {
                type: 'Apply Aura: Modifies Time Between Ticks',
                value: -250, // -250 ms
                pvpMultiplier: 1,
                affectedSpells: [
                    SPELLS.CRACKLING_JADE_LIGHTNING.id,
                ]
            },
        ]
    } as CorePassive,
};

export default corePassive;
