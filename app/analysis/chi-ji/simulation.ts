import { type AllyState, isTalentEnabled, type RotationResult, type SimulationOptions } from './types';
import { applyBuffEffects } from "@data/buffs";
import { calculateCastTime } from "@data/spells/spell";
import type spell from "@data/spells/spell";
import SPELLS from "@data/spells";
import TALENTS from "@data/specs/monk/mistweaver/talents";
import { CLASSES } from '@data/class';
import {
    calculateSpellDamage,
    calculateSpellHealing,
    calculateAncientTeachingsHealing,
    calculateGustOfMists,
    getWayOfTheCraneTransfer,
    getWayOfTheCraneArmorModifier,
    type Player,
} from '@data/specs/monk/mistweaver/calcs';

export const createAllyState = (id: number): AllyState => ({
    id,
    buffs: {
        envelopingMist: { 
            remaining: 0, 
            amp: 0 
        },
        renewingMist: { 
            remaining: 0, 
            amp: 0 
        },
    }
});

export const updateAllyBuffs = (allies: AllyState[], timeElapsed: number) => {
    allies.forEach(ally => {
        if (ally.buffs.envelopingMist.remaining > 0) {
            ally.buffs.envelopingMist.remaining -= timeElapsed;
            if (ally.buffs.envelopingMist.remaining <= 0) {
                ally.buffs.envelopingMist.amp = 0;
            }
        }
        if (ally.buffs.renewingMist.remaining > 0) {
            ally.buffs.renewingMist.remaining -= timeElapsed;
            if (ally.buffs.renewingMist.remaining <= 0) {
                ally.buffs.renewingMist.amp = 0;
            }
        }
    });
};

export const getRandomAlly = (allies: AllyState[]): AllyState => {
    return allies[Math.floor(Math.random() * allies.length)];
};

export const getRandomAllies = (allies: AllyState[], count: number): AllyState[] => {
    const shuffled = [...allies].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const getAvailableEnvelopingMistTargets = (allies: AllyState[]): AllyState[] => {
    return allies.filter(ally => ally.buffs.envelopingMist.remaining <= 0);
};

export const applyEnvelopingMist = (allies: AllyState[], options: SimulationOptions) => {
    const availableTargets = getAvailableEnvelopingMistTargets(allies);
    const target = availableTargets.length > 0 ? getRandomAlly(availableTargets) : getRandomAlly(allies);
    
    const envelopingMist = SPELLS.ENVELOPING_MIST;
    const mistWrap = TALENTS.MIST_WRAP;
    const baseDuration = envelopingMist.duration;
    const baseAmp = envelopingMist.effects.amp;

    const duration = isTalentEnabled(options, TALENTS.MIST_WRAP) ? baseDuration + mistWrap.effects.duration : baseDuration;
    const amp = isTalentEnabled(options, TALENTS.MIST_WRAP) ? baseAmp + mistWrap.effects.amp : baseAmp;

    target.buffs.envelopingMist.remaining = duration;
    target.buffs.envelopingMist.amp = amp;
    
    return target;
};

export const applyRenewingMistToTarget = (renewingMist: spell, target: AllyState, options: SimulationOptions) => {
    target.buffs.renewingMist.remaining = renewingMist.duration ?? SPELLS.RENEWING_MIST.duration;
    target.buffs.renewingMist.amp = isTalentEnabled(options, TALENTS.LOTUS_INFUSION) ? TALENTS.LOTUS_INFUSION.effects.amp : 1;

    return target;
};

export const applyRapidDiffusionRenewingMist = (allies: AllyState[], options: SimulationOptions, renewingMistHealing: number) => {
    const target = getRandomAlly(allies);

    const renewingMist = SPELLS.RENEWING_MIST;
    const rapidDiffusion = TALENTS.RAPID_DIFFUSION;
    const lotusInfusion = TALENTS.LOTUS_INFUSION;

    const rapidDiffusionHealing = (renewingMistHealing  / renewingMist.duration ) * rapidDiffusion.effects.duration;

    target.buffs.renewingMist.remaining = rapidDiffusion.effects.duration;
    target.buffs.renewingMist.amp = isTalentEnabled(options, TALENTS.LOTUS_INFUSION) ? lotusInfusion.effects.amp : 1;

    const amplifiedHealing = calculateHealingWithAmp(rapidDiffusionHealing, target);
    
    return { target, healing: amplifiedHealing };
};


export const calculateHealingWithAmp = (baseHealing: number, ally: AllyState): number => {
    let totalAmp = 1;
    totalAmp *= ally.buffs.envelopingMist.amp || 1;
    totalAmp *= ally.buffs.renewingMist.amp || 1;
    return baseHealing * totalAmp;
};

export const distributeAncientTeachings = (allies: AllyState[], totalHealing: number): number => {
    const maxTargets = Math.min(5, allies.length);
    const healingPerTarget = totalHealing / maxTargets;
    let actualTotalHealing = 0;
    
    const targets = getRandomAllies(allies, maxTargets);
    targets.forEach(target => {
        actualTotalHealing += calculateHealingWithAmp(healingPerTarget, target);
    });
    
    return actualTotalHealing;
};

export const distributeGusts = (allies: AllyState[], gustCount: number, chiJiGustHealing: number): number => {
    const targetsPerGust = Math.min(2, allies.length);
    const gustsPerTarget = 3;
    let totalHealing = 0;
    
    for (let i = 0; i < gustCount; i += 6) {
        const selectedTargets = getRandomAllies(allies, targetsPerGust);
        const baseGustHealing = chiJiGustHealing * gustsPerTarget;
        
        for (const target of selectedTargets) {
            totalHealing += calculateHealingWithAmp(baseGustHealing, target);
        }
    }
    
    return totalHealing;
};

export const calculateRotationHPS = async (
    rotation: spell[],
    rotationIndex: number,
    options: SimulationOptions,
    specData: any
): Promise<RotationResult> => {
    const rwkEnabled = isTalentEnabled(options, TALENTS.RUSHING_WIND_KICK);
    const normalizedRotation = rotation.map(s => {
        if (rwkEnabled && s.id === SPELLS.RISING_SUN_KICK.id) return TALENTS.RUSHING_WIND_KICK;
        if (!rwkEnabled && s.id === TALENTS.RUSHING_WIND_KICK.id) return SPELLS.RISING_SUN_KICK;
        return s;
    });
    const buffedSpells = await applyBuffEffects(specData, normalizedRotation);
    let totalTime = 0;
    let totalHealing = 0;
    const spellsCastInChiJi: spell[] = [];
    let totmStacks = 0;

    const mergedTalents: Player["talents"] = new Map([...options.specTalents, ...options.classTalents]);
    const mwSpec = CLASSES.MONK.SPECS.MISTWEAVER;
    const player: Player = {
        stats: {
            intellect: options.intellect,
            crit: options.crit,
            versatility: options.versatility,
            mastery: options.mastery,
            haste: options.haste,
        },
        talents: mergedTalents,
        corePassives: mwSpec.corePassives,
    };

    
    const jadeBond = TALENTS.JADE_BOND;
    const jadeBondOpt = isTalentEnabled(options, TALENTS.JADE_BOND);
    const chijiDuration = jadeBondOpt ? jadeBond.effects.duration : SPELLS.CHI_JI.duration;
    let chiJiActive = false;
    let chiJiTimeRemaining = 0;

    const focusedThunderOpt = isTalentEnabled(options, TALENTS.FOCUSED_THUNDER);
    const tftChargesTotal = focusedThunderOpt ? TALENTS.FOCUSED_THUNDER.effects.tftCharges : 1;
    let tftChargesRemaining = 0;

    const emperorsElixirOpt = isTalentEnabled(options, TALENTS.EMPERORS_ELIXIR);
    const jfs = TALENTS.JADEFIRE_STOMP;
    const jfsMaxTargets = jfs.targets;
    const eeATEffectiveness = TALENTS.EMPERORS_ELIXIR.effects.ancientTeachingsEffectiveness;

    const wayOfTheCrane = TALENTS.WAY_OF_THE_CRANE;
    const wayOfTheCraneOpt = isTalentEnabled(options, TALENTS.WAY_OF_THE_CRANE);
    const wayOfTheCraneTargetsPerSCK = wayOfTheCrane.effects.targetsPerSCK;
    const wayOfTheCraneTigerPalmHits = wayOfTheCraneOpt ? wayOfTheCrane.effects.tigerPalmHits : 1;

    const craneStyle = TALENTS.CRANE_STYLE;
    const craneStyleOpt = isTalentEnabled(options, TALENTS.CRANE_STYLE);
    const craneStyleRisingSunKickGOM = craneStyle.effects.risingSunKickGOM;
    const craneStyleBlackoutKickGOM = craneStyle.effects.blackoutKickGOM;
    const craneStyleSpinningCraneKickGOM = craneStyle.effects.spinningCraneKickGOM;
    const craneStyleGOMChance = craneStyle.effects.gomChance;

    const teachingsOfTheMonastery = TALENTS.TEACHINGS_OF_THE_MONASTERY;
    const totmMaxStacks = teachingsOfTheMonastery.maxStacks;

    const gustOfMistHealing = calculateGustOfMists(player);

    const chijiGustHealing = gustOfMistHealing * ( 1 + (jadeBondOpt ? TALENTS.JADE_BOND.effects.gustIncrease : 0));
    const celestialHarmony = TALENTS.CELESTIAL_HARMONY;
    const celestialHarmonyChiCocoonAmount = celestialHarmony.formula!(options);
    const celestialHarmonyChiCocoonMaxTargets = celestialHarmony.targets;

    const rapidDiffusionOpt = isTalentEnabled(options, TALENTS.RAPID_DIFFUSION);

    const allies: AllyState[] = Array.from({ length: options.allyCount }, (_, i) => createAllyState(i));

    const healingBySpell: { [key: string]: { healing: number; sources: any; count: number } } = {};

    const calculateRenewingMistHealing = (spellObj: spell): number => {
        const renewingMistBaseHealing = calculateSpellHealing(spellObj, player);
        const renewingMistBaseHPS = renewingMistBaseHealing / SPELLS.RENEWING_MIST.duration;
        return renewingMistBaseHPS * (spellObj.duration ?? SPELLS.RENEWING_MIST.duration);
    };

    const calculateSpellHealingBreakdown = (spellObj: spell, totmStacks: number, allies: AllyState[], chiJiActive: boolean) => {
        const breakdown = {
            baseHealing: 0,
            chiJiGusts: 0,
            ancientTeachings: 0,
            wayOfTheCrane: 0,
            gustOfMists: 0,
            envelopingMistAmp: 0,
            chiCocoons: 0,
            rapidDiffusion: 0,
        };

        let renewingMistHealing = 0;

        switch (spellObj.id) {
            case SPELLS.CHI_JI.id:
                if (isTalentEnabled(options, TALENTS.CELESTIAL_HARMONY)) {
                    breakdown.chiCocoons = celestialHarmonyChiCocoonAmount * Math.min(celestialHarmonyChiCocoonMaxTargets, allies.length);
                }
                break;

            case SPELLS.TIGER_PALM.id: {
                const tigerPalmDamage = calculateSpellDamage(spellObj, player);
                const tigerPalmHits = wayOfTheCraneTigerPalmHits;
                const tigerPalmATHealing = calculateAncientTeachingsHealing(tigerPalmDamage, player, true, spellObj) * tigerPalmHits;
                breakdown.ancientTeachings = distributeAncientTeachings(allies, tigerPalmATHealing);
                break;
            }
            
            case SPELLS.RISING_SUN_KICK.id: {
                const rskDamage = calculateSpellDamage(spellObj, player);
                const rskATHealing = calculateAncientTeachingsHealing(rskDamage, player, true, spellObj);
                breakdown.ancientTeachings = distributeAncientTeachings(allies, rskATHealing);

                if (chiJiActive) {
                    breakdown.chiJiGusts = distributeGusts(allies, 6, chijiGustHealing);
                }

                if (craneStyleOpt) {
                    const rskGOMTarget = getRandomAlly(allies);
                    const rskgustOfMistHealing = gustOfMistHealing * craneStyleRisingSunKickGOM;
                    breakdown.gustOfMists = calculateHealingWithAmp(rskgustOfMistHealing, rskGOMTarget);
                }

                if (rapidDiffusionOpt) {
                    renewingMistHealing = calculateRenewingMistHealing(SPELLS.RENEWING_MIST);
                    const rdRemHealing = applyRapidDiffusionRenewingMist(allies, options, renewingMistHealing);
                    renewingMistHealing = rdRemHealing.healing;
                }

                break;
            }

            case TALENTS.RUSHING_WIND_KICK.id: {
                const rwkDamage = calculateSpellDamage(spellObj, player);
                const rwkATHealing = calculateAncientTeachingsHealing(rwkDamage, player, true, spellObj);
                breakdown.ancientTeachings = distributeAncientTeachings(allies, rwkATHealing);

                if (isTalentEnabled(options, TALENTS.RUSHING_WIND_KICK)) {
                    const rwk = TALENTS.RUSHING_WIND_KICK;
                    const rwkHealTargets = Math.min(rwk.targets.healing, allies.length);
                    const rwkDirectHeal = calculateSpellHealing(spellObj, player);
                    const rwkHealTargetAllies = getRandomAllies(allies, rwkHealTargets);
                    breakdown.baseHealing = rwkHealTargetAllies.reduce((sum, a) => sum + calculateHealingWithAmp(rwkDirectHeal, a), 0);
                }

                if (chiJiActive) {
                    breakdown.chiJiGusts = distributeGusts(allies, 6, chijiGustHealing);
                }

                if (craneStyleOpt) {
                    const rwkGOMTarget = getRandomAlly(allies);
                    const rwkGOMHealing = gustOfMistHealing * craneStyleRisingSunKickGOM;
                    breakdown.gustOfMists = calculateHealingWithAmp(rwkGOMHealing, rwkGOMTarget);
                }

                if (rapidDiffusionOpt) {
                    renewingMistHealing = calculateRenewingMistHealing(SPELLS.RENEWING_MIST);
                    const rdRemHealing = applyRapidDiffusionRenewingMist(allies, options, renewingMistHealing);
                    renewingMistHealing = rdRemHealing.healing;
                }

                break;
            }
            
            case SPELLS.BLACKOUT_KICK.id: {
                const bokDamage = calculateSpellDamage(spellObj, player);
                const bokHits = 1 + totmStacks;
                let bokATHealing = calculateAncientTeachingsHealing(bokDamage, player, true, spellObj) * bokHits;
                
                if (chiJiActive) {
                    breakdown.chiJiGusts = distributeGusts(allies, 6 * bokHits, chijiGustHealing);
                }

                if (wayOfTheCraneOpt) {
                    const bokEffectiveness = wayOfTheCrane.effects.blackoutKickEffectiveness;
                    const bokMaxAdditionalHits = wayOfTheCrane.effects.blackoutKickHits;
                    const wayOfTheCraneBokHits = Math.min(options.enemyCount - 1, bokMaxAdditionalHits);
                    
                    if (wayOfTheCraneBokHits > 0) {
                        const wayOfTheCraneBokDamage = bokDamage * bokEffectiveness;
                        bokATHealing += calculateAncientTeachingsHealing(wayOfTheCraneBokDamage, player, true, spellObj) * wayOfTheCraneBokHits * bokHits;
                    }
                }
                
                breakdown.ancientTeachings = distributeAncientTeachings(allies, bokATHealing);

                if (craneStyleOpt) {
                    let totalBokGOMHealing = 0;
                    for (let i = 0; i < bokHits; i++) {
                        if (Math.random() < craneStyleGOMChance) {
                            const bokGOMTarget = getRandomAlly(allies);
                            const bokGOMHealing = gustOfMistHealing * craneStyleBlackoutKickGOM;
                            totalBokGOMHealing += calculateHealingWithAmp(bokGOMHealing, bokGOMTarget);
                        }
                    }
                    breakdown.gustOfMists = totalBokGOMHealing;
                }

                break;
            }
            
            case SPELLS.SPINNING_CRANE_KICK.id: {
                const sckDamage = calculateSpellDamage(spellObj, player);
                const sckTargetMultiplier = options.enemyCount <= 5 
                    ? options.enemyCount
                    : options.enemyCount * Math.sqrt(5 / options.enemyCount);

                const sckTicks = 4;
                const sckPartDamage = (sckDamage * sckTargetMultiplier * getWayOfTheCraneTransfer() * getWayOfTheCraneArmorModifier()) / sckTicks;
                
                let sckAJTotalHealing = 0;
                for (let i = 0; i < sckTicks; i++) {
                    const targets = getRandomAllies(allies, wayOfTheCraneTargetsPerSCK);
                    for (const target of targets) {
                        const sckHealing = calculateHealingWithAmp(sckPartDamage, target);
                        sckAJTotalHealing += sckHealing;
                    }
                }
                breakdown.wayOfTheCrane = sckAJTotalHealing;
                
                if (chiJiActive) {
                    breakdown.chiJiGusts = chijiGustHealing * 6;
                }

                if (craneStyleOpt) {
                    if (Math.random() < craneStyleGOMChance) {
                        const sckGomTarget = getRandomAlly(allies);
                        const sckGOMHealing = gustOfMistHealing * craneStyleSpinningCraneKickGOM;
                        breakdown.gustOfMists = calculateHealingWithAmp(sckGOMHealing, sckGomTarget);
                    }
                }
                
                break;
            }
            
            case SPELLS.ENVELOPING_MIST.id: {
                const envTarget = applyEnvelopingMist(allies, options);
                const envBaseHealing = calculateSpellHealing(spellObj, player);
                breakdown.baseHealing = calculateHealingWithAmp(envBaseHealing, envTarget);

                breakdown.gustOfMists = calculateHealingWithAmp(gustOfMistHealing, envTarget);

                if (rapidDiffusionOpt) {
                    renewingMistHealing = calculateRenewingMistHealing(SPELLS.RENEWING_MIST);
                    const rdRemHealing = applyRapidDiffusionRenewingMist(allies, options, renewingMistHealing);
                    renewingMistHealing = rdRemHealing.healing;
                }
                
                break;
            }
            
            case SPELLS.VIVIFY.id: {
                const vivifyTarget = getRandomAlly(allies);
                const vivifyBaseHealing = calculateSpellHealing(spellObj, player);
                breakdown.baseHealing = calculateHealingWithAmp(vivifyBaseHealing, vivifyTarget);

                breakdown.gustOfMists = calculateHealingWithAmp(gustOfMistHealing, vivifyTarget);
                break;
            }
            case SPELLS.RENEWING_MIST.id: {
                const renewingMistTarget = getRandomAlly(allies);
                applyRenewingMistToTarget(spellObj, renewingMistTarget, options);
                const renewingMistBaseHealing = calculateRenewingMistHealing(spellObj);
                breakdown.baseHealing = calculateHealingWithAmp(renewingMistBaseHealing, renewingMistTarget);

                breakdown.gustOfMists = calculateHealingWithAmp(gustOfMistHealing, renewingMistTarget);
                break;
            }
            default: {
                const defaultTarget = getRandomAlly(allies);
                const defaultBaseHealing = calculateSpellHealing(spellObj, player);
                breakdown.baseHealing = calculateHealingWithAmp(defaultBaseHealing, defaultTarget);
            }
        }

        const totalHealing = breakdown.baseHealing + breakdown.chiJiGusts + breakdown.ancientTeachings + 
                           breakdown.wayOfTheCrane + breakdown.gustOfMists + 
                           breakdown.chiCocoons;

        return { breakdown, totalHealing, renewingMistHealing };
    };

    for (const spell of buffedSpells) {
        const castTime = calculateCastTime(spell, options.haste);
        const isOffGCD = (spell.castTime === 0 || spell.castTime === undefined) && spell.gcd === false;
        
        if (!isOffGCD) {
            updateAllyBuffs(allies, castTime);
            
            if (chiJiActive && chiJiTimeRemaining > 0) {
                chiJiTimeRemaining -= castTime;
                if (chiJiTimeRemaining <= 0) {
                    chiJiActive = false;
                }
            }

            if (spell.id === SPELLS.CHI_JI.id) {
                chiJiActive = true;
                chiJiTimeRemaining = chijiDuration;
            }

            // Only apply duration limit after Chi-Ji has been cast
            if (!chiJiActive || (chiJiTimeRemaining > 0) || spell.id === SPELLS.CHI_JI.id) {
                const { breakdown, totalHealing: spellHealing, renewingMistHealing } = calculateSpellHealingBreakdown(
                    spell, 
                    totmStacks, 
                    allies,
                    chiJiActive && chiJiTimeRemaining > 0
                );
                
                totalHealing += spellHealing;

                if (renewingMistHealing > 0) {
                    const renewingMistKey = SPELLS.RENEWING_MIST.name;
                    if (!healingBySpell[renewingMistKey]) {
                        healingBySpell[renewingMistKey] = { healing: 0, sources: {}, count: 0 };
                    }
                    healingBySpell[renewingMistKey].healing += renewingMistHealing;
                    healingBySpell[renewingMistKey].count += 1;
                    if (!healingBySpell[renewingMistKey].sources.rapidDiffusion) {
                        healingBySpell[renewingMistKey].sources.rapidDiffusion = 0;
                    }
                    healingBySpell[renewingMistKey].sources.rapidDiffusion += renewingMistHealing;

                    totalHealing += renewingMistHealing;
                }
                
                totalTime += castTime;
                spellsCastInChiJi.push(spell);

                if (spell.id === SPELLS.TIGER_PALM.id) {
                    const stacksGained = isTalentEnabled(options, TALENTS.WAY_OF_THE_CRANE) ? wayOfTheCraneTigerPalmHits : 1;
                    totmStacks = Math.min(totmStacks + stacksGained, totmMaxStacks);
                } else if (spell.id === SPELLS.BLACKOUT_KICK.id) {
                    totmStacks = 0;
                } else if ((spell.id === SPELLS.RISING_SUN_KICK.id || spell.id === TALENTS.RUSHING_WIND_KICK.id) && tftChargesRemaining > 0) {
                    tftChargesRemaining--;

                    if (emperorsElixirOpt) {
                        const stompTargets = Math.min(jfsMaxTargets, options.enemyCount);
                        const stompDamage = calculateSpellDamage(jfs, player) * stompTargets;
                        const stompATHealing = calculateAncientTeachingsHealing(stompDamage, player, true, jfs) * eeATEffectiveness;
                        const stompHealing = distributeAncientTeachings(allies, stompATHealing);

                        totalHealing += stompHealing;
                        const stompKey = jfs.name;
                        if (!healingBySpell[stompKey]) {
                            healingBySpell[stompKey] = { healing: 0, sources: {}, count: 0 };
                        }
                        healingBySpell[stompKey].healing += stompHealing;
                        healingBySpell[stompKey].count += 1;
                        if (!healingBySpell[stompKey].sources.ancientTeachings) {
                            healingBySpell[stompKey].sources.ancientTeachings = 0;
                        }
                        healingBySpell[stompKey].sources.ancientTeachings += stompHealing;
                    }
                }

                const spellKey = spell.name;
                if (!healingBySpell[spellKey]) {
                    healingBySpell[spellKey] = { healing: 0, sources: {}, count: 0 };
                }
                healingBySpell[spellKey].healing += spellHealing;
                healingBySpell[spellKey].count += 1;
                
                Object.keys(breakdown).forEach(key => {
                    if (!healingBySpell[spellKey].sources[key]) {
                        healingBySpell[spellKey].sources[key] = 0;
                    }
                    healingBySpell[spellKey].sources[key] += breakdown[key];
                });
            } else {
                break;
            }
        } else {
            // Off-GCD spells always execute
            if (spell.id === SPELLS.THUNDER_FOCUS_TEA.id) {
                tftChargesRemaining = tftChargesTotal;
            }

            const { breakdown, totalHealing: spellHealing } = calculateSpellHealingBreakdown(
                spell,
                totmStacks,
                allies,
                chiJiActive && chiJiTimeRemaining > 0
            );

            totalHealing += spellHealing;
            spellsCastInChiJi.push(spell);

            const spellKey = spell.name;
            if (!healingBySpell[spellKey]) {
                healingBySpell[spellKey] = { healing: 0, sources: {}, count: 0 };
            }
            healingBySpell[spellKey].healing += spellHealing;
            healingBySpell[spellKey].count += 1;
            
            Object.keys(breakdown).forEach(key => {
                if (!healingBySpell[spellKey].sources[key]) {
                    healingBySpell[spellKey].sources[key] = 0;
                }
                healingBySpell[spellKey].sources[key] += breakdown[key];
            });
        }
    }

    const rotationBreakdown = Object.entries(healingBySpell)
    .filter(([spellName, data]) => data.healing > 0)
    .map(([spellName, data]) => ({
        spellName,
        healing: data.healing,
        percentage: totalHealing > 0 ? (data.healing / totalHealing) * 100 : 0,
        sources: data.sources
    })).sort((a, b) => b.healing - a.healing);

    const hps = totalTime > 0 ? totalHealing / totalTime : 0;

    return {
        id: `Rotation ${rotationIndex + 1}`,
        name: `Rotation ${rotationIndex + 1}`,
        hps,
        totalHealing,
        duration: totalTime,
        spells: spellsCastInChiJi,
        breakdown: rotationBreakdown
    };
};