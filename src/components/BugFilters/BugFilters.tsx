import type React from "react";
import { Box, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import BuildIcon from "@mui/icons-material/Build";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchChip, SelectChip, SpecChip } from "@components/FilterChips/FilterChips";
import { GlassTooltip } from "@components/Glass";
import type { specialization } from "@data/class";
import { SEVERITY_COLORS, STATUS } from "@data/bugs";
import { useIsLocalhost } from "@hooks/useIsLocalhost";
import { CHIP_HEIGHT, FONT } from "@components/Theme/tokens";
import { SwirlIconButton } from "@components/Buttons/SwirlIconButton";

interface BugFiltersProps {
    selectedSpec: specialization;
    setSelectedSpec: (spec: specialization) => void;
    search: string;
    onSearchChange: (val: string) => void;
    status: string;
    onStatusChange: (val: string) => void;
    severity: string;
    onSeverityChange: (val: string) => void;
    statuses: string[];
    severities: string[];
    count: string;
    onReset?: () => void;
    onExportToExcel?: () => void;
    onOpenBugUpdate?: () => void;
}

const BugFilters: React.FC<BugFiltersProps> = ({
    selectedSpec,
    setSelectedSpec,
    search,
    onSearchChange,
    status,
    onStatusChange,
    severity,
    onSeverityChange,
    statuses,
    severities,
    count,
    onReset,
    onExportToExcel,
    onOpenBugUpdate,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isLocalhost = useIsLocalhost();

    const handleSpecChange = (newSpec: specialization) => {
        setSelectedSpec(newSpec);
        const params = new URLSearchParams(searchParams.toString());
        params.set('spec', newSpec.key);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const accent = selectedSpec.color;
    const iconButtonSx = { width: CHIP_HEIGHT, height: CHIP_HEIGHT };

    return (
        <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", width: { xs: "100%", md: "80%" }, mx: "auto" }}>
            <SpecChip accent={accent} spec={selectedSpec} onChange={handleSpecChange} />

            <SearchChip
                accent={accent}
                value={search}
                onChange={onSearchChange}
                placeholder="bugs..."
                sx={{ flexGrow: 1, maxWidth: { xs: "none", sm: 300 } }}
            />

            <SelectChip
                accent={accent}
                title="status"
                value={status}
                onChange={onStatusChange}
                options={statuses.map(s => ({ value: s, label: s }))}
                active={status !== STATUS.OPEN}
            />

            <SelectChip
                accent={accent}
                title="severity"
                value={severity}
                onChange={onSeverityChange}
                options={severities.map(s => ({
                    value: s,
                    label: s,
                    sx: { borderBottom: `2px solid ${SEVERITY_COLORS[s] ?? 'transparent'}` },
                }))}
                active={severity !== "All"}
            />

            <Typography sx={{ ml: "auto", px: 1, fontSize: FONT.micro, fontWeight: 600, color: "text.disabled", whiteSpace: "nowrap" }}>
                {count}
            </Typography>

            {onReset && (
                <Box
                    onClick={onReset}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onReset();
                        }
                    }}
                    sx={{
                        px: 1,
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: FONT.micro,
                        fontWeight: 600,
                        color: "text.disabled",
                        "&:hover": { color: "text.primary" },
                    }}
                >
                    reset
                </Box>
            )}

            {onExportToExcel && (
                <GlassTooltip title={"Export to Excel"}>
                    <SwirlIconButton onClick={onExportToExcel} tint="primary" sx={iconButtonSx}>
                        <DownloadIcon sx={{ fontSize: 18 }} />
                    </SwirlIconButton>
                </GlassTooltip>
            )}

            {isLocalhost && onOpenBugUpdate && (
                <GlassTooltip title={"Update Bugs"}>
                    <SwirlIconButton onClick={onOpenBugUpdate} tint="warning" sx={iconButtonSx}>
                        <BuildIcon sx={{ fontSize: 18 }} />
                    </SwirlIconButton>
                </GlassTooltip>
            )}
        </Box>
    );
};

export default BugFilters;
