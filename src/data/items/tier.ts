import type spell from '@data/spells/spell';

// helm for 4pc, shoulder for 2pc
const tier = {
    T34_LIGHTSMITH_2SET: {
        name: "11.2 Lightsmith 2pc",
        id: 1236389,
        icon: 'inv_plate_raidpaladinethereal_d_01_shoulder',
    },
    T34_LIGHTSMITH_4SET: {
        name: "11.2 Lightsmith 4pc",
        id: 1236390,
        icon: 'inv_plate_raidpaladinethereal_d_01_helm',
    },
    T35_MISTWEAVER_2SET: {
        name: "12.0 Mistweaver 2pc",
        id: 1264840,
        icon: 'inv_shoulder_leather_raidmonkmidnight_d_01',
    },
    T35_MISTWEAVER_4SET: {
        name: "12.0 Mistweaver 4pc",
        id: 1264841,
        icon: 'inv_helm_leather_raidmonkmidnight_d_01',
    },
    T36_MISTWEAVER_2SET: {
        name: "12.1 Mistweaver 2pc",
        id: 1296619,
        icon: "inv_shoulder_leather_raidmonkulatek_d_01",
        effects: {
            rwkHealingIncrease: 1.0,
            rskDamageIncrease: 0.3,
        }
    },
    T36_MISTWEAVER_4SET: {
        name: "12.1 Mistweaver 4pc",
        id: 1296620,
        icon: "inv_helm_leather_raidmonkulatek_d_01",
        effects: {
            resetChance: 0.25,
        }
    }
} satisfies Record<string, spell>;

export default tier;
export { tier as TIER };