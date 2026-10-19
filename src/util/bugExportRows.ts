import { type Bug, SEVERITY_ORDER, STATUS } from "@data/bugs";
import { extractTextFromReactNode } from "./extractTextFromReactNode";

const HEADERS = ["Type", "Ability/Talent", "Misc", "Description", "Build", "Notes + Logs", "Priority"];

// header row + one row per open bug, most severe first
export const bugExportRows = (bugs: Bug[]): string[][] => {
    const openBugs = bugs.filter(bug => bug.status !== STATUS.FIXED && bug.status !== STATUS.REMOVED && bug.status !== STATUS.INTENDED);

    const sortedBugs = [...openBugs].sort((a, b) => {
        return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    });

    const rows = sortedBugs.map(bug => {
        const type = "Bug";
        const spellName = bug.spell.name;
        const descriptionNode = bug.description || bug.title;
        const description = extractTextFromReactNode(descriptionNode);
        const build = bug.buildsTested[bug.buildsTested.length - 1];

        let notesAndLogs = bug.notes || "";
        if (bug.logs && bug.logs.length > 0) {
            const logsText = bug.logs.map(log => {
                if (log.label) {
                    return `${log.label}:\n${log.url}`;
                }
                return log.url;
            }).join("\n\n");
            notesAndLogs = notesAndLogs
                ? `${notesAndLogs}\n\n${logsText}`
                : logsText;
        }

        const priority = bug.severity;

        return [type, spellName, "", description, build, notesAndLogs, priority];
    });

    return [HEADERS.map(h => h.toUpperCase()), ...rows];
};

const csvCell = (value: string): string => {
    return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
};

export const bugExportCsv = (bugs: Bug[]): string => {
    return bugExportRows(bugs).map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
};
