"use client";
import type React from 'react';
import { IconButton } from '@mui/material';
import { GlassTooltip } from '@components/Glass';
import { RestartAlt } from '@components/Icons';
import { FieldCells, type FieldDef } from '@components/FieldCells/FieldCells';
import { BASE_MASTERY, type Stats } from '@data/shared/stats';
import type { specialization } from '@data/class';
import { FONT } from "@components/Theme/tokens";

export interface StatsCardOptions extends Stats {
    totalHp?: number;
}

interface StatsCardProps {
    options: StatsCardOptions;
    onOptionsChange: (newOptions: any) => void;
    label?: string;
    fields?: (keyof StatsCardOptions)[];
    spec?: specialization;
    defaults?: Partial<StatsCardOptions>;
    loading?: boolean;
}

export const rowLabel: React.CSSProperties = { fontSize: FONT.micro, fontWeight: 600, opacity: 0.45, textAlign: "right", whiteSpace: "nowrap" };
export const rowSep = <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.12)" }} />;

export const Group: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ display: "grid", gridTemplateColumns: "max-content 1px auto", gap: "8px 12px", alignItems: "start" }}>
        {children}
    </div>
);

interface StatFieldDef extends FieldDef {
    summary?: {
        suffix: string;
        compact?: boolean;
        format?: (value: number) => string;
    };
}

const formatK = (value: number): string =>
    value >= 1000 ? `${Math.round(value / 1000)}k` : `${value}`;

const baseFields: StatFieldDef[] = [
    { key: 'intellect', label: 'intellect', min: 1, summary: { suffix: ' int' } },
    { key: 'totalHp', label: 'total hp', min: 1, summary: { suffix: ' hp', format: formatK } },
];

const secondaryFields: StatFieldDef[] = [
    { key: 'haste', label: 'haste', min: 0, adornment: "%", summary: { suffix: 'h', compact: true } },
    { key: 'crit', label: 'crit', min: 0, adornment: "%", tooltip: "We're using the law of large numbers to assume that, out of a large number of casts, you will critically strike as often as your crit percentage.", summary: { suffix: 'c', compact: true } },
    { key: 'versatility', label: 'vers', min: 0, adornment: "%", summary: { suffix: 'v', compact: true } },
    { key: 'mastery', label: 'mastery', min: 0, adornment: "%", summary: { suffix: '% mast' } },
];

export const statsSummary = (options: StatsCardOptions, fields?: (keyof StatsCardOptions)[]): string => {
    type SummaryEntry = { summary: NonNullable<StatFieldDef['summary']>; value: number };

    const present = [...baseFields, ...secondaryFields]
        .filter(field => field.summary && (!fields || fields.includes(field.key as keyof StatsCardOptions)))
        .map(field => ({ summary: field.summary!, value: options[field.key as keyof StatsCardOptions] }))
        .filter((entry): entry is SummaryEntry => typeof entry.value === 'number' && entry.value > 0);

    const format = ({ summary, value }: SummaryEntry) =>
        `${(summary.format ?? (v => v.toLocaleString()))(value)}${summary.suffix}`;

    const compact = present.filter(entry => entry.summary.compact).map(format).join(" ");
    const separate = present.filter(entry => !entry.summary.compact).map(format);

    return [...separate, ...(compact ? [compact] : [])].join(", ");
};

const readStored = (storageKey: string): Record<string, unknown> => {
    try {
        return JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    } catch {
        return {};
    }
};

const shownFields = (spec?: specialization, fields?: (keyof StatsCardOptions)[]) => {
    const masteryMin = spec ? spec.masteryCoefficient * BASE_MASTERY : 0;
    return [...baseFields, ...secondaryFields]
        .map(field => field.key === 'mastery' ? { ...field, min: masteryMin } : field)
        .filter(field => !fields || fields.includes(field.key as keyof StatsCardOptions));
};

const storageKeyFor = (spec?: specialization) => `stats:${spec?.key ?? 'default'}`;

export const loadStoredStats = (spec?: specialization, fields?: (keyof StatsCardOptions)[]): Partial<StatsCardOptions> => {
    const stored = readStored(storageKeyFor(spec));
    return Object.fromEntries(
        shownFields(spec, fields)
            .filter(field => typeof stored[field.key] === 'number' && Number.isFinite(stored[field.key]) && (stored[field.key] as number) >= (field.min ?? 0))
            .map(field => [field.key, stored[field.key]]),
    );
};

const StatsCard: React.FC<StatsCardProps> = ({ options, onOptionsChange, label, fields, spec, defaults, loading }) => {
    const visibleFields = shownFields(spec, fields);
    const storageKey = storageKeyFor(spec);

    const handleChange = (updater: unknown) => {
        const next = typeof updater === 'function' ? updater(options) : updater;
        const stored = readStored(storageKey);
        for (const field of visibleFields) {
            const value = next[field.key];
            if (typeof value === 'number') stored[field.key] = value;
        }
        localStorage.setItem(storageKey, JSON.stringify(stored));
        onOptionsChange(updater);
    };

    const defaultOf = (key: string): number =>
        (defaults as Record<string, number | undefined> | undefined)?.[key] ?? (spec?.stats as Record<string, number | undefined> | undefined)?.[key] ?? 0;
    const atDefaults = visibleFields.every(field => (options as unknown as Record<string, unknown>)[field.key] === defaultOf(field.key));

    const handleReset = () => {
        const stored = readStored(storageKey);
        for (const field of visibleFields) delete stored[field.key];
        localStorage.setItem(storageKey, JSON.stringify(stored));
        onOptionsChange((prev: StatsCardOptions) => ({ ...prev, ...Object.fromEntries(visibleFields.map(field => [field.key, defaultOf(field.key)])) }));
    };

    return (
        <div style={{ visibility: loading ? 'hidden' : undefined }}>
            <FieldCells
                fields={visibleFields}
                options={options}
                onOptionsChange={handleChange}
                label={label}
                trailing={
                    <GlassTooltip title="reset stats">
                        <span style={{ alignSelf: 'center' }}>
                            <IconButton size="small" onClick={handleReset} disabled={atDefaults} sx={{ p: 0.5, color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}>
                                <RestartAlt sx={{ fontSize: 16 }} />
                            </IconButton>
                        </span>
                    </GlassTooltip>
                }
            />
        </div>
    );
};

export default StatsCard;
