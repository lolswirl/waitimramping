import type spell from "@data/spells/spell";
import type { Tags } from "@data/shared/tags";
import { type ReactNode } from "react";
import { Check, Close } from "@mui/icons-material";

export enum SEVERITY {
    CRITICAL = "Critical",
    HIGH = "High",
    MEDIUM = "Medium",
    LOW = "Low",
    TRIVIAL = "Trivial",
}

export const SEVERITY_ORDER = [SEVERITY.CRITICAL, SEVERITY.HIGH, SEVERITY.MEDIUM, SEVERITY.LOW, SEVERITY.TRIVIAL] as const;

export const SEVERITY_COLORS: Record<SEVERITY, string> = {
    [SEVERITY.CRITICAL]: "#d32f2f",
    [SEVERITY.HIGH]: "#f57c00",
    [SEVERITY.MEDIUM]: "#fbc02d",
    [SEVERITY.LOW]: "#388e3c",
    [SEVERITY.TRIVIAL]: "#808080",
};

export enum STATUS {
    OPEN = "Open",
    FIXED = "Fixed",
    REMOVED = "Removed",
    INTENDED = "Intended",
}

export const STATUS_COLORS: Record<STATUS, string> = {
    [STATUS.OPEN]: "",
    [STATUS.FIXED]: "#89ff7f",
    [STATUS.REMOVED]: "#ff5555ff",
    [STATUS.INTENDED]: "#7fb8ff",
};

export const getStatusBadge = (status: STATUS): ReactNode => {
    switch (status) {
        case STATUS.FIXED:
            return <Check />;
        case STATUS.REMOVED:
            return <Close />;
        default:
            return null;
    }
};

export interface Bug {
    spell: spell;
    affectedSpells?: spell[];
    severity: SEVERITY;
    title: ReactNode;
    description?: ReactNode;
    tags?: Tags[];
    status?: STATUS;
    buildsTested: string[];
    notes?: string;
    logs?: { label: string; url: string }[];
}

// builds #s for ptr are lower than live as of 6/19, ugly fix to sort builds including the full patch num at the top as they are technically newer for ptr version
// genuinely hate this impl and will remove it once build #s go above but probably need a diff permanent fix for later
const parseBuild = (entry: string): { patch: number[]; build: number } => {
    const parts = entry.split(".");
    const build = parseInt(parts[parts.length - 1]);
    const patch = parts.slice(0, -1).map(Number);
    return { patch, build };
};

const compareBuilds = (a: string, b: string): number => {
    const { patch: patchA, build: buildA } = parseBuild(a);
    const { patch: patchB, build: buildB } = parseBuild(b);
    const len = Math.max(patchA.length, patchB.length);
    for (let i = 0; i < len; i++) {
        const diff = (patchA[i] ?? 0) - (patchB[i] ?? 0);
        if (diff !== 0) return diff;
    }
    return buildA - buildB;
};

const getLatestBuildEntry = (buildsTested: string[]): string | undefined =>
    buildsTested.reduce<string | undefined>((latest, entry) =>
        !latest || compareBuilds(entry, latest) > 0 ? entry : latest, undefined);

export const getLatestBuild = (buildsTested: string[]): number => {
    const latest = getLatestBuildEntry(buildsTested);
    return latest ? parseBuild(latest).build : 0;
};

export const getBuildSortValue = (buildsTested: string[]): number => {
    const latest = getLatestBuildEntry(buildsTested);
    if (!latest) return 0;
    const { patch, build } = parseBuild(latest);
    const patchScore = patch.reduce((acc, n) => acc * 1000 + n, 0);
    return patchScore * 1e9 + build;
};
