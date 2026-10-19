import type { Bug } from "@data/bugs";
import { bugExportRows } from "./bugExportRows";
import * as XLSX from "xlsx";

export const exportBugsToExcel = (bugs: Bug[], fileName: string = "bugs.xlsx") => {
    const wsData = bugExportRows(bugs);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
        { wch: 10 },  // type
        { wch: 30 },  // spell
        { wch: 10 },  // misc (do we even need this anymore?)
        { wch: 60 },  // description
        { wch: 10 },  // build #
        { wch: 60 },  // notes + logs
        { wch: 15 },  // severity
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bugs");

    XLSX.writeFile(wb, fileName);
};
