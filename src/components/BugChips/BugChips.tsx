import type React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import SwirlChip from "@components/SwirlChip/SwirlChip";
import { GlassTooltip } from "@components/Glass";
import { type Bug, STATUS, SEVERITY_COLORS, STATUS_COLORS, getStatusBadge } from "@data/bugs";
import { FONT } from "@components/Theme/tokens";

interface BugChipsProps {
    bug: Bug;
    showTooltip?: boolean;
}

export const BugChips: React.FC<BugChipsProps> = ({ bug, showTooltip = true }) => {
    return (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {bug.status && bug.status !== STATUS.OPEN && (
                <SwirlChip
                    message={bug.status}
                    showIcon={true}
                    icon={getStatusBadge(bug.status)}
                    borderColor={STATUS_COLORS[bug.status]}
                    fontSize="0.75rem"
                />
            )}
            <SwirlChip
                message={bug.severity + " Severity"}
                borderColor={SEVERITY_COLORS[bug.severity]}
                fontSize="0.75rem"
            />
            {(() => {
                const builds = bug.buildsTested;
                if (!builds || builds.length === 0) return null;
                
                const latestBuild = builds[builds.length - 1];
                const hasMultipleBuilds = builds.length > 1;
                const tooltipContent = showTooltip && hasMultipleBuilds ? (
                    <Stack spacing={0.25} sx={{ py: 0.25 }}>
                        <Typography variant="caption" sx={{ fontSize: FONT.micro, opacity: 0.7, mb: 0.25 }}>
                            Build History:
                        </Typography>
                        <Stack spacing={0} sx={{ textAlign: "center" }}>
                            {[...builds].reverse().map((build, index) => (
                                <Box 
                                    key={index}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.25
                                    }}
                                >
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            fontSize: FONT.small,
                                            fontFamily: 'monospace',
                                            opacity: index === 0 ? 1 : 0.8,
                                            fontWeight: 400,
                                        }}
                                    >
                                        {build}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Stack>
                ) : null;
                
                const chipMessage = `Build #${latestBuild}`;
                
                const chip = (
                    <SwirlChip
                        message={chipMessage}
                        borderColor="#eaeaea"
                        fontSize="0.75rem"
                        showIcon={hasMultipleBuilds}
                        icon={<ExpandMore/>}
                        iconPosition="right"
                    />
                );

                return showTooltip && hasMultipleBuilds ? (
                    <GlassTooltip title={tooltipContent} placement="bottom">
                        <Box component="span" display="inline-flex">
                            {chip}
                        </Box>
                    </GlassTooltip>
                ) : chip;
            })()}
            {bug.tags?.map((tag) => (
                <SwirlChip
                    key={tag.name}
                    message={tag.name}
                    size="small"
                    borderColor={tag.color}
                    fontSize="0.75rem"
                />
            ))}
        </Stack>
    );
};
