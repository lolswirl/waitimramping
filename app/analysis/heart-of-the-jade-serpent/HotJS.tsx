"use client";

import type React from 'react';
import { useState, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Container,
    Typography,
} from '@mui/material';
import { GlassTooltip } from '@components/Glass';

import IconButtonBase from '@components/SpellButtons/IconButtonBase';
import SpellButton from '@components/SpellButtons/SpellButton';
import PageHeader from '@components/PageHeader/PageHeader';
import { FieldCells } from '@components/FieldCells/FieldCells';
import ConfigPanel from '@components/ConfigPanel/ConfigPanel';
import StatsCard, { Group, type StatsCardOptions } from '@components/StatsCard/StatsCard';
import TalentsCard, { TalentOption } from '@components/TalentsCard/TalentsCard';
import SPELLS from "@data/spells";
import type spell from '@data/spells/spell';
import { GCD } from '@data/spells/spell';
import { T } from '@util/T';
import { pluralize } from '@util/stringManipulation';
import TALENTS from '@data/talents';
import { CLASSES } from '@data/class';
import { CONTENT_WIDTH, FONT, HAIRLINE, ICON } from "@components/Theme/tokens";

const YULONS_AVATAR_RPPM = 1.5;
const TIMELINE_HEIGHT = 500;
const MAIN_TIMELINE_Y_RATIO = 2.5;
const CAST_PRIORITY = [
    SPELLS.THUNDER_FOCUS_TEA, 
    SPELLS.RENEWING_MIST, 
    SPELLS.RISING_SUN_KICK, 
    SPELLS.LIFE_COCOON
];

interface AbilityCooldown {
    spell: spell;
    currentCooldown: number;
    availableAt: number;
    color: string;
}

interface HotJSEvent {
    castStartTime: number;
    startTime: number;
    duration: number;
    multiplier: number;
    source: spell;
    castTime: number;
}

interface CastPeriod {
    start: number;
    end: number;
}

interface AbilityData {
    availableTimes: number[];
    onCooldownPeriods: CastPeriod[];
}

interface SimulationData {
    [key: string]: AbilityData;
}

interface BaselineData {
    [key: string]: { availableTimes: number[] };
}

const createAffectedAbilities = (talents: Map<spell, boolean>): AbilityCooldown[] => {
    const chrysalisEnabled = talents.get(TALENTS.CHRYSALIS);
    const lifeCocoonCooldown = chrysalisEnabled && TALENTS.CHRYSALIS.effects?.cooldown
        ? TALENTS.CHRYSALIS.effects.cooldown
        : SPELLS.LIFE_COCOON.cooldown;
    
    return [
        {
            spell: SPELLS.RENEWING_MIST,
            currentCooldown: 0,
            availableAt: 0,
            color: "#6ff5d6"
        },
        {
            spell: SPELLS.RISING_SUN_KICK,
            currentCooldown: 0,
            availableAt: 0,
            color: "#fd8500"
        },
        {
            spell: SPELLS.THUNDER_FOCUS_TEA,
            currentCooldown: 0,
            availableAt: 0,
            color: "#87a1e8"
        },
        {
            spell: { ...SPELLS.LIFE_COCOON, cooldown: lifeCocoonCooldown },
            currentCooldown: 0,
            availableAt: 0,
            color: "#fbff4e"
        }
    ];
};

const roundTime = (time: number): number => Math.round(time * 10) / 10;

const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
};

const isCurrentlyBlocked = (time: number, castPeriods: CastPeriod[]): boolean => {
    return castPeriods.some(cast => time >= cast.start && time < cast.end);
};

const initializeAbilityData = (abilities: AbilityCooldown[]): { abilityData: SimulationData; baselineData: BaselineData } => {
    const abilityData: SimulationData = {};
    const baselineData: BaselineData = {};
    
    abilities.forEach(ability => {
        abilityData[ability.spell.name] = { availableTimes: [], onCooldownPeriods: [] };
        baselineData[ability.spell.name] = { availableTimes: [] };
    });
    
    return { abilityData, baselineData };
};

const generateConduitCasts = (timeRange: number, celestialConduitCastTime: number): { events: HotJSEvent[], casts: CastPeriod[] } => {
    const events: HotJSEvent[] = [];
    const casts: CastPeriod[] = [];
    
    for (let time = 0; time < timeRange; time += SPELLS.CELESTIAL_CONDUIT.cooldown) {
        const castTime = celestialConduitCastTime || 3;
        
        casts.push({ start: time, end: time + castTime });
        events.push({
            castStartTime: time,
            startTime: time + castTime,
            duration: 8,
            multiplier: 2.5,
            source: SPELLS.CELESTIAL_CONDUIT,
            castTime: castTime
        });
    }
    
    return { events, casts };
};

const generateYulonsAvatarProc = (
    timeRange: number, 
    procsPerMinute: number = 1.5,
    conduitEvents: HotJSEvent[]
): HotJSEvent[] => {
    const events: HotJSEvent[] = [];
    const totalProcs = Math.floor((timeRange / 60) * procsPerMinute);
    
    const blockedTimes = conduitEvents.map(e => e.castStartTime);
    
    const procTimes: number[] = [];
    const minGapBetweenProcs = 10;
    const minGapFromBlocked = 2;
    
    for (let i = 0; i < totalProcs; i++) {
        let validTime = false;
        let attempts = 0;
        let procTime = 0;
        
        while (!validTime && attempts < 100) {
            procTime = Math.random() * timeRange;
            
            const farFromOtherProcs = procTimes.every(existingTime => 
                Math.abs(existingTime - procTime) > minGapBetweenProcs
            );
            
            const notBlocked = blockedTimes.every(blockedTime => 
                Math.abs(blockedTime - procTime) > minGapFromBlocked
            );
            
            validTime = farFromOtherProcs && notBlocked;
            attempts++;
        }
        
        if (validTime) {
            procTimes.push(procTime);
            events.push({
                castStartTime: procTime,
                startTime: procTime,
                duration: 4,
                multiplier: 1.75,
                source: { 
                    ...TALENTS.YULONS_AVATAR, 
                    name: "Yu'lon's Avatar Proc" 
                } as spell,
                castTime: 0
            });
        }
    }
    
    return events.sort((a, b) => a.startTime - b.startTime);
};

const simulateBaseline = (
    timeRange: number,
    abilities: AbilityCooldown[],
    baselineData: BaselineData
): void => {
    const baselineAbilities = abilities.map(a => ({ ...a, nextAvailable: 0 }));
    let nextGCDFree = 0;

    for (let time = 0; time < timeRange; time += 0.1) {
        time = roundTime(time);
        
        if (time >= nextGCDFree) {
            for (const cast of CAST_PRIORITY) {
                const ability = baselineAbilities.find(a => a.spell.name === cast.name);
                if (ability && time >= ability.nextAvailable) {
                    const triggersGCD = ability.spell.gcd !== false;
                    const castTime = ability.spell.castTime || 0;
                    
                    if (!triggersGCD || time >= nextGCDFree) {
                        if (triggersGCD) {
                            nextGCDFree = time + (castTime === 0 ? GCD : Math.max(castTime, GCD));
                        }

                        ability.nextAvailable = time + (ability.spell.cooldown || 0);
                        baselineData[ability.spell.name].availableTimes.push(time);

                        if (triggersGCD) break;
                    }
                }
            }
        }
    }
};

const simulateWithHotJS = (
    timeRange: number,
    abilities: AbilityCooldown[],
    events: HotJSEvent[],
    abilityData: SimulationData,
    cdrEnabled: boolean,
    allCastPeriods: CastPeriod[]
): HotJSEvent[] => {
    const updatedEvents = [...events];
    const simAbilities = abilities.map(a => ({ ...a, nextAvailable: 0 }));
    
    let tftNextAvailable = 0;
    
    let nextGCDFree = 0;
    
    for (let time = 0; time < timeRange; time += 0.1) {
        time = roundTime(time);
        
        let activeMultiplier = 1;
        if (cdrEnabled) {
            const activeBuffs = updatedEvents.filter(event => 
                time >= event.startTime && time < event.startTime + event.duration
            );
            
            if (activeBuffs.length > 0) {
                activeMultiplier = Math.max(...activeBuffs.map(buff => buff.multiplier));
            }
        }

        if (tftNextAvailable > time && cdrEnabled) {
            const reduction = 0.1 * (activeMultiplier - 1);
            tftNextAvailable = Math.max(time, tftNextAvailable - reduction);
        }

        if (time >= tftNextAvailable && !isCurrentlyBlocked(time, allCastPeriods)) {
            updatedEvents.push({
                castStartTime: time,
                startTime: time,
                duration: 8,
                multiplier: 1.75,
                source: SPELLS.THUNDER_FOCUS_TEA,
                castTime: 0
            });
            
            tftNextAvailable = time + (SPELLS.THUNDER_FOCUS_TEA.cooldown || 30);
        }

        simAbilities.forEach(ability => {
            if (ability.nextAvailable > time && cdrEnabled) {
                const reduction = 0.1 * (activeMultiplier - 1);
                ability.nextAvailable = Math.max(time, ability.nextAvailable - reduction);
            }
        });

        if (!isCurrentlyBlocked(time, allCastPeriods)) {
            for (const cast of CAST_PRIORITY) {
                const ability = simAbilities.find(a => a.spell.name === cast.name);
                if (ability && time >= ability.nextAvailable) {
                    const triggersGCD = ability.spell.gcd !== false;
                    
                    if (!triggersGCD || time >= nextGCDFree) {
                        const castTime = ability.spell.castTime || 0;
                        
                        if (triggersGCD) {
                            nextGCDFree = time + (castTime === 0 ? GCD : Math.max(castTime, GCD));
                        }

                        ability.nextAvailable = time + (ability.spell.cooldown || 0);
                        
                        abilityData[ability.spell.name].availableTimes.push(time);
                        abilityData[ability.spell.name].onCooldownPeriods.push({
                            start: time,
                            end: ability.nextAvailable
                        });
                        
                        if (triggersGCD) break;
                    }
                }
            }
        }
    }
    
    return updatedEvents;
};

const MAX_MINUTES = 10;
const RECOVERY_OPTION: spell = { ...TALENTS.HEART_OF_THE_JADE_SERPENT, name: "Cooldown recovery" };

const SetupOptions: React.FC<{
    timeRange: number;
    onTimeRangeChange: (value: number) => void;
    cdrEnabled: boolean;
    onCdrEnabledChange: (value: boolean) => void;
    color: string;
}> = ({ timeRange, onTimeRangeChange, cdrEnabled, onCdrEnabledChange, color }) => {
    const options = { minutes: timeRange / 60 };

    const handleOptionsChange = (update: (prev: typeof options) => typeof options) => {
        const minutes = Math.min(Math.max(update(options).minutes, 1), MAX_MINUTES);
        onTimeRangeChange(minutes * 60);
    };

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
            <FieldCells
                fields={[{ key: 'minutes', label: 'minutes', min: 1, stepper: true }]}
                options={options}
                onOptionsChange={handleOptionsChange}
            />
            <TalentOption
                talent={RECOVERY_OPTION}
                isChecked={cdrEnabled}
                onChange={(_, checked) => onCdrEnabledChange(checked)}
                color={color}
            />
        </Box>
    );
};

const SummaryPair: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
        <Typography sx={{ fontSize: FONT.small, color: 'text.disabled' }}>
            {label}
        </Typography>
        <Typography sx={{ fontFamily: 'monospace', fontSize: FONT.small, color: 'text.primary' }}>
            {value}
        </Typography>
    </Box>
);

const Results: React.FC<{
    events: HotJSEvent[];
    timeRange: number;
    abilities: AbilityCooldown[];
    abilityData: SimulationData;
    baselineData: BaselineData;
    avatarProcsPerMinute: number | null;
}> = ({ events, timeRange, abilities, abilityData, baselineData, avatarProcsPerMinute }) => {
    const uptime = events.reduce((sum, event) => sum + event.duration, 0);

    return (
        <Card variant="outlined" sx={{ width: '100%', maxWidth: CONTENT_WIDTH.wide, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
                {abilities.map((ability, index) => {
                    const withHotJS = abilityData[ability.spell.name].availableTimes.length;
                    const baseline = baselineData[ability.spell.name].availableTimes.length;
                    const extraCasts = withHotJS - baseline;
                    const castsPerMinute = (withHotJS / timeRange) * 60;

                    const castTimes = abilityData[ability.spell.name].availableTimes;
                    let avgCooldown = 0;
                    if (castTimes.length > 1) {
                        const cooldowns: number[] = [];
                        for (let i = 1; i < castTimes.length; i++) {
                            cooldowns.push(castTimes[i] - castTimes[i - 1]);
                        }
                        avgCooldown = cooldowns.reduce((sum, cd) => sum + cd, 0) / cooldowns.length;
                    }

                    return (
                        <Box key={ability.spell.name} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 2,
                            py: 1.5,
                            borderTop: {
                                xs: index > 0 ? `1px solid ${HAIRLINE}` : 'none',
                                md: index > 1 ? `1px solid ${HAIRLINE}` : 'none',
                            },
                            borderLeft: {
                                xs: 'none',
                                md: index % 2 === 1 ? `1px solid ${HAIRLINE}` : 'none',
                            },
                        }}>
                            <SpellButton selectedSpell={ability.spell} size={ICON.lg} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: FONT.body, fontWeight: 600 }}>
                                    {ability.spell.name}
                                </Typography>
                                <Typography sx={{ fontFamily: 'monospace', fontSize: FONT.micro, color: 'text.disabled' }}>
                                    {castsPerMinute.toFixed(1)}{T("cpm")}
                                    {avgCooldown > 0 && <>, {avgCooldown.toFixed(1)}s {T("avg cd")}</>}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                                    <Typography sx={{ fontFamily: 'monospace', fontSize: FONT.heading, lineHeight: 1, color: ability.color }}>
                                        {withHotJS}
                                    </Typography>
                                    <Typography sx={{ fontSize: FONT.small, color: 'text.secondary' }}>
                                        {T(pluralize(withHotJS, "Cast")).toLowerCase()}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontFamily: 'monospace', fontSize: FONT.micro, color: extraCasts > 0 ? '#4ade80' : 'text.disabled' }}>
                                    +{extraCasts} {T("Extra").toLowerCase()}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 3, rowGap: 0.5, px: 2, py: 1.25, borderTop: `1px solid ${HAIRLINE}` }}>
                <SummaryPair label={T("windows")} value={`${events.length}`} />
                <SummaryPair label={T("uptime")} value={`${((uptime / timeRange) * 100).toFixed(1)}% (${uptime.toFixed(1)}s)`} />
                {avatarProcsPerMinute !== null && (
                    <SummaryPair label={T("Yu'lon's Avatar ppm")} value={avatarProcsPerMinute.toFixed(2)} />
                )}
            </Box>
        </Card>
    );
};

const TimelineView: React.FC<{
    events: HotJSEvent[];
    abilities: AbilityCooldown[];
    abilityData: SimulationData;
    timeRange: number;
}> = ({ events, abilities, abilityData, timeRange }) => {
    const mainTimelineY = TIMELINE_HEIGHT / MAIN_TIMELINE_Y_RATIO;
    const leftMargin = 30;
    
    return (
        <Card variant="outlined" sx={{
            maxWidth: CONTENT_WIDTH.wide,
            width: "100%",
        }}>
            <CardContent>
                <Typography sx={{ mb: 1, fontSize: FONT.micro, color: 'text.disabled' }}>
                    {T("Assumes every spell is used on cooldown as it becomes available")}
                </Typography>
                <Box sx={{ 
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    maxWidth: '100%',
                }}>
                    <Box sx={{ 
                        position: 'relative', 
                        height: TIMELINE_HEIGHT, 
                        width: Math.max(1200, timeRange * 6 + leftMargin),
                        borderRadius: 1,
                        border: `1px solid ${HAIRLINE}`,
                    }}>
                        <Box sx={{
                            position: 'absolute',
                            top: mainTimelineY,
                            left: leftMargin,
                            right: 0,
                            height: 3,
                            backgroundColor: '#666',
                            zIndex: 1
                        }} />

                        {Array.from({ length: Math.floor(timeRange / 10) + 1 }, (_, i) => i * 10).map(time => (
                            <Box key={time}>
                                <Box sx={{
                                    position: 'absolute',
                                    left: `calc(${leftMargin}px + ${(time / timeRange) * (100 - (leftMargin / (timeRange * 6 + leftMargin)) * 100)}%)`,
                                    top: mainTimelineY - 15,
                                    width: 2,
                                    height: 30,
                                    backgroundColor: '#999',
                                    zIndex: 2
                                }} />
                                <Typography sx={{
                                    position: 'absolute',
                                    left: `calc(${leftMargin}px + ${(time / timeRange) * (100 - (leftMargin / (timeRange * 6 + leftMargin)) * 100)}%)`,
                                    top: mainTimelineY + 20,
                                    transform: 'translateX(-50%)',
                                    fontSize: FONT.small,
                                    fontWeight: 'bold',
                                }}>
                                    {formatTime(time)}
                                </Typography>
                            </Box>
                        ))}

                        {events.map((event, i) => {
                            const yOffset = (i % 3) * 50;
                            
                            const castStartPercent = (event.castStartTime / timeRange) * (100 - (leftMargin / (timeRange * 6 + leftMargin)) * 100);
                            const castStartCalc = `calc(${leftMargin}px + ${castStartPercent}%)`;
                            
                            const hotjsStartPercent = (event.startTime / timeRange) * (100 - (leftMargin / (timeRange * 6 + leftMargin)) * 100);
                            const hotjsStartCalc = `calc(${leftMargin}px + ${hotjsStartPercent}%)`;
                            
                            const hotjsDurationWidth = `${(event.duration / timeRange) * (100 - (leftMargin / (timeRange * 6 + leftMargin)) * 100)}%`;
                            
                            return (
                                <Box key={`hotjs-${i}`}>
                                    <Box sx={{
                                        position: 'absolute',
                                        left: hotjsStartCalc,
                                        width: hotjsDurationWidth,
                                        top: 0,
                                        height: '100%',
                                        backgroundColor: event.multiplier === 2.5 ? '#22c55e' : '#86efac',
                                        opacity: 0.15,
                                        zIndex: 0,
                                    }} />

                                    <GlassTooltip title={
                                        <div style={{ textAlign: 'center' }}>
                                            {event.source.name} cast starts at {event.castStartTime.toFixed(1)}s<br />
                                            Heart of the Jade Serpent activates at {event.startTime.toFixed(1)}s
                                        </div>
                                    }>
                                        <Box sx={{
                                            position: 'absolute',
                                            left: castStartCalc,
                                            top: mainTimelineY - 80 - yOffset,
                                            transform: 'translateX(-50%)',
                                            zIndex: 3,
                                        }}>
                                            <IconButtonBase
                                                icon={event.source.icon}
                                                name={event.source.name}
                                                tooltip={false}
                                                size={ICON.md}
                                            />
                                        </Box>
                                    </GlassTooltip>
                                    
                                    <GlassTooltip title={
                                        <div style={{ textAlign: 'center' }}>
                                            Heart of the Jade Serpent active: {event.startTime.toFixed(1)}s - {(event.startTime + event.duration).toFixed(1)}s<br />
                                            ({event.multiplier === 2.5 ? '150%' : '75%'} Cooldown Reduction)
                                        </div>
                                    }>
                                        <Box sx={{
                                            position: 'absolute',
                                            left: hotjsStartCalc,
                                            width: hotjsDurationWidth,
                                            top: mainTimelineY - 55 - yOffset,
                                            height: 10,
                                            backgroundColor: event.multiplier === 2.5 ? '#22c55e' : '#86efac',
                                            borderRadius: 1,
                                            opacity: 0.8,
                                            zIndex: 2,
                                        }} />
                                    </GlassTooltip>

                                    <Box sx={{
                                        position: 'absolute',
                                        left: `calc(${castStartCalc} - 1.5px)`,
                                        top: mainTimelineY - 45 - yOffset,
                                        width: 3,
                                        height: 45 + yOffset,
                                        backgroundColor: '#555',
                                        opacity: 0.5,
                                        zIndex: 1
                                    }} />
                                </Box>
                            );
                        })}

                        {abilities.map((ability, abilityIndex) => {
                            const yPosition = mainTimelineY + 60 + (abilityIndex * 60);
                            
                            return (
                                <Box key={ability.spell.name}>
                                    {abilityData[ability.spell.name].availableTimes.filter(time => time > 0).map((castTime, castIndex) => {
                                        const leftPosPercent = (castTime / timeRange) * (100 - (leftMargin / (timeRange * 6 + leftMargin)) * 100);
                                        const leftPosCalc = `calc(${leftMargin}px + ${leftPosPercent}%)`;
                                        
                                        return (
                                            <Box key={`${ability.spell.name}-${castIndex}`}>
                                                <GlassTooltip title={`${T(ability.spell.name)} cast at ${castTime.toFixed(1)}s`}>
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        left: leftPosCalc,
                                                        top: yPosition - 12,
                                                        transform: 'translateX(-50%)',
                                                        zIndex: 4,
                                                        '&:hover': {
                                                            transform: 'translateX(-50%) scale(1.1)',
                                                            transition: 'transform 0.2s ease'
                                                        }
                                                    }}>
                                                        <IconButtonBase
                                                            icon={ability.spell.icon}
                                                            name={ability.spell.name}
                                                            tooltip={false}
                                                            size={ICON.sm}
                                                        />
                                                    </Box>
                                                </GlassTooltip>

                                                <Box sx={{
                                                    position: 'absolute',
                                                    left: `calc(${leftPosCalc} - 1.5px)`,
                                                    top: mainTimelineY + 3,
                                                    width: 3,
                                                    height: yPosition - mainTimelineY - 15,
                                                    backgroundColor: ability.color,
                                                    opacity: 0.4,
                                                    zIndex: 1,
                                                }} />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

const HotJS: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const mistweaver = CLASSES.MONK.SPECS.MISTWEAVER;
    
    const [timeRange, setTimeRange] = useState<number>(300);
    const [cdrEnabled, setCdrEnabled] = useState<boolean>(true);
    const [stats, setStats] = useState<StatsCardOptions>(mistweaver.stats);
    
    const allTalents = new Map<spell, boolean>([
        [TALENTS.YULONS_AVATAR, true],
        [TALENTS.CHRYSALIS, false],
    ]);
    
    const [talents, setTalents] = useState(allTalents);

    const handleTalentChange = (talent: spell, checked: boolean) => {
        setTalents(prev => new Map(prev).set(talent, checked));
    };

    const affectedAbilities = useMemo(() => createAffectedAbilities(talents), [talents]);
    const celestialConduitCastTime = SPELLS.CELESTIAL_CONDUIT.castTime;
    const yulonsAvatarEnabled = !!talents.get(TALENTS.YULONS_AVATAR);
    const avatarProcsPerMinute = YULONS_AVATAR_RPPM * (1 + stats.haste / 100);

    const simulation = useMemo(() => {
        const { abilityData, baselineData } = initializeAbilityData(affectedAbilities);
        
        const { events: conduitEvents, casts: conduitCasts } = generateConduitCasts(
            timeRange, 
            celestialConduitCastTime
        );
        
        const yulonsAvatarProcEvents = yulonsAvatarEnabled
            ? generateYulonsAvatarProc(timeRange, avatarProcsPerMinute, conduitEvents)
            : [];
        
        const allEvents = [...conduitEvents, ...yulonsAvatarProcEvents];
        const allCastPeriods = conduitCasts;
        
        simulateBaseline(timeRange, affectedAbilities, baselineData);
        
        const finalEvents = simulateWithHotJS(
            timeRange,
            affectedAbilities,
            allEvents,
            abilityData,
            cdrEnabled,
            allCastPeriods
        );
        
        return { 
            events: finalEvents, 
            abilityData, 
            baselineData, 
            abilities: affectedAbilities 
        };
    }, [
        timeRange, 
        celestialConduitCastTime, 
        cdrEnabled,
        yulonsAvatarEnabled,
        avatarProcsPerMinute,
        affectedAbilities
    ]);

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <PageHeader title={title} subtitle={description} />

            <ConfigPanel
                sx={{ maxWidth: CONTENT_WIDTH.wide }}
                accent={mistweaver.color}
                sections={[
                    {
                        key: "stats",
                        title: "stats",
                        summary: `${stats.haste}% haste`,
                        content: <StatsCard options={stats} onOptionsChange={setStats} fields={["haste"]} spec={mistweaver} />,
                    },
                    {
                        key: "talents",
                        title: "talents",
                        summary: `${[...talents.values()].filter(Boolean).length} active`,
                        defaultOpen: true,
                        content: (
                            <Group>
                                <TalentsCard
                                    label="Talents"
                                    options={talents}
                                    color={mistweaver.color}
                                    onChange={handleTalentChange}
                                />
                            </Group>
                        ),
                    },
                    {
                        key: "setup",
                        title: "setup",
                        summary: `${timeRange / 60} min, recovery ${cdrEnabled ? "on" : "off"}`,
                        content: (
                            <SetupOptions
                                timeRange={timeRange}
                                onTimeRangeChange={setTimeRange}
                                cdrEnabled={cdrEnabled}
                                onCdrEnabledChange={setCdrEnabled}
                                color={mistweaver.color}
                            />
                        ),
                    },
                ]}
            />

            <Results
                events={simulation.events}
                timeRange={timeRange}
                abilities={affectedAbilities}
                abilityData={simulation.abilityData}
                baselineData={simulation.baselineData}
                avatarProcsPerMinute={yulonsAvatarEnabled ? avatarProcsPerMinute : null}
            />

            <TimelineView
                events={simulation.events}
                abilities={affectedAbilities}
                abilityData={simulation.abilityData}
                timeRange={timeRange}
            />
        </Container>
    );
};

export default HotJS;