"use client";

import type React from 'react';
import { useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    useTheme,
    Stack,
    Chip,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

import PageHeader from '@components/PageHeader/PageHeader';
import { T } from '@util/T';
import TALENTS from '@data/talents';

const MAX_WIDTH = 1100;
const MAX_INCREASE = TALENTS.MISTY_COALESCENCE.effects.maxIncrease;
const DUNGEON_MAX_PLAYERS = 5;
const RAID_MAX_PLAYERS = 20;
const DUNGEON_RATE = MAX_INCREASE / DUNGEON_MAX_PLAYERS;
const RAID_RATE = MAX_INCREASE / RAID_MAX_PLAYERS;

interface DataPoint {
    players: number;
    dungeonIncrease: number | null;
    raidIncrease: number;
}

const calculateIncrease = (players: number, increasePerPlayer: number, maxIncrease: number): number => {
    return Math.min(players * increasePerPlayer, maxIncrease);
};

const generateData = (): DataPoint[] => {
    const data: DataPoint[] = [];
    
    for (let i = 1; i <= RAID_MAX_PLAYERS; i++) {
        data.push({
            players: i,
            dungeonIncrease: i <= DUNGEON_MAX_PLAYERS ? calculateIncrease(i, DUNGEON_RATE, MAX_INCREASE) : null,
            raidIncrease: calculateIncrease(i, RAID_RATE, MAX_INCREASE),
        });
    }
    
    return data;
};

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    
    if (active && payload && payload.length) {
        return (
            <Card sx={{
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                border: `1px solid ${'rgba(255,255,255,0.2)'}`,
                p: 1.5,
            }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {label} Players
                </Typography>
                {payload.map((entry: any, index: number) => (
                    <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                        {entry.name}: {entry.value}%
                    </Typography>
                ))}
            </Card>
        );
    }
    return null;
};

const MistyCoalescence: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const theme = useTheme();
    
    const data = useMemo(() => generateData(), []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <PageHeader title={title} subtitle={description} />
            
            <Card variant="outlined" sx={{ maxWidth: MAX_WIDTH, width: "95%", mx: "auto", mb: 2 }}>
                <CardContent>
                    
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, justifyContent: 'center' }}>
                        <Chip 
                            label={T(`${DUNGEON_MAX_PLAYERS}-player Content: ${DUNGEON_RATE}% per player`)}
                            sx={{ 
                                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                color: '#22c55e',
                                borderColor: '#22c55e',
                                fontWeight: 'bold',
                            }}
                            variant="outlined"
                        />
                        <Chip 
                            label={T(`${RAID_MAX_PLAYERS}-player Content: ${RAID_RATE}% per player`)}
                            sx={{ 
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: '#3b82f6',
                                borderColor: '#3b82f6',
                                fontWeight: 'bold',
                            }}
                            variant="outlined"
                        />
                        <Chip 
                            label={T(`Maximum: ${MAX_INCREASE}%`)}
                            sx={{ 
                                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                                color: '#a855f7',
                                borderColor: '#a855f7',
                                fontWeight: 'bold',
                            }}
                            variant="outlined"
                        />
                    </Stack>

                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                        >
                            <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={'rgba(255,255,255,0.1)'}
                            />
                            <XAxis 
                                dataKey="players"
                                label={{ 
                                    value: T('Number of Players'), 
                                    position: 'insideBottom', 
                                    offset: -10,
                                    fill: '#fff',
                                }}
                                stroke={'#fff'}
                                tick={{ fill: '#fff' }}
                            />
                            <YAxis 
                                label={{ 
                                    value: T('Healing Increase (%)'), 
                                    angle: -90, 
                                    position: 'insideLeft',
                                    style: { textAnchor: 'middle' },
                                    fill: '#fff',
                                }}
                                domain={[0, MAX_INCREASE]}
                                stroke={'#fff'}
                                tick={{ fill: '#fff' }}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend 
                                verticalAlign="bottom"
                                wrapperStyle={{ 
                                    color: '#fff',
                                    paddingTop: '15px',
                                }}
                            />
                            <ReferenceLine 
                                y={MAX_INCREASE} 
                                stroke={'#a855f7'} 
                                strokeDasharray="5 5"
                                label={{ 
                                    value: T(`Max (${MAX_INCREASE}%)`), 
                                    fill: '#a855f7',
                                    fontSize: 12,
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="dungeonIncrease" 
                                stroke="#22c55e" 
                                strokeWidth={3}
                                name={T(`${DUNGEON_MAX_PLAYERS}-player (Dungeon)`)}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="raidIncrease" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                name={T(`${RAID_MAX_PLAYERS}-player (Raid)`)}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>
    );
};

export default MistyCoalescence;
