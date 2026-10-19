import type React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import SpellButton from "@components/SpellButtons/SpellButton";
import SwirlTable, { type SwirlColumn } from "@components/SwirlTable/SwirlTable";
import { type Bug, SEVERITY_COLORS, STATUS, STATUS_COLORS, getLatestBuild, getBuildSortValue } from "@data/bugs";
import { extractTextFromReactNode } from "@util/extractTextFromReactNode";
import { AttachFile } from "@mui/icons-material";
import { FONT, ICON } from "@components/Theme/tokens";

interface BugTableProps {
    bugs: Bug[];
    iconSize: number;
    onRowClick: (bug: Bug) => void;
}

const BugTable: React.FC<BugTableProps> = ({ bugs, iconSize, onRowClick }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const mobileColumns: SwirlColumn<Bug>[] = [
        {
            key: "title",
            label: "Bug",
            width: "1fr",
            render: bug => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, width: "100%" }}>
                    <SpellButton selectedSpell={bug.spell} size={ICON.md} showName />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" component="div" sx={{ color: STATUS_COLORS[bug.status ?? STATUS.OPEN] }}>
                            {bug.title}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ flex: 1, minWidth: 0, fontSize: FONT.micro, color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {bug.spell.name}
                            </Typography>
                            {bug.logs && bug.logs.length > 0 && (
                                <AttachFile sx={{ fontSize: "0.85rem", color: "primary.main", opacity: 0.8 }} />
                            )}
                            <Typography sx={{ fontFamily: "monospace", fontSize: FONT.micro, color: "text.disabled" }}>
                                {getLatestBuild(bug.buildsTested) || "—"}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            ),
        },
    ];

    const columns: SwirlColumn<Bug>[] = [
        {
            key: "title",
            label: "Bug",
            width: "1fr",
            sortValue: bug => extractTextFromReactNode(bug.title).toLowerCase(),
            render: bug => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, width: "100%" }}>
                    <SpellButton selectedSpell={bug.spell} size={iconSize} showName />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" component="div" sx={{ color: STATUS_COLORS[bug.status ?? STATUS.OPEN], fontWeight: 500 }}>
                            {bug.title}
                        </Typography>
                        <Typography sx={{ fontSize: FONT.micro, color: "text.disabled" }}>
                            {bug.spell.name}
                        </Typography>
                    </Box>
                    {bug.logs && bug.logs.length > 0 && (
                        <AttachFile sx={{ fontSize: "1rem", color: "primary.main", opacity: 0.8, flexShrink: 0 }} />
                    )}
                </Box>
            ),
        },
        {
            key: "build",
            label: "Build",
            width: "80px",
            align: "center",
            sortValue: bug => getBuildSortValue(bug.buildsTested),
            render: bug => (
                <Typography variant="body2" sx={{ color: STATUS_COLORS[bug.status ?? STATUS.OPEN], fontFamily: "monospace", textAlign: "center" }}>
                    {getLatestBuild(bug.buildsTested) || "—"}
                </Typography>
            ),
        },
    ];

    return (
        <Box sx={{ width: { xs: "100%", md: "80%" }, mx: "auto" }}>
            <SwirlTable
                rows={bugs}
                rowKey={(_, i) => String(i)}
                columns={isMobile ? mobileColumns : columns}
                hideHeader={isMobile}
                onRowClick={onRowClick}
                accentColor={bug => SEVERITY_COLORS[bug.severity]}
                defaultSortKey="build"
                defaultSortDir="desc"
            />
        </Box>
    );
};

export default BugTable;
