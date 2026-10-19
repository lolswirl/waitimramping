import type React from "react";
import { useState } from "react";
import { Dialog, Typography, Box } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SpellButton from "@components/SpellButtons/SpellButton";
import SwirlLink from "@components/SwirlLink/SwirlLink";
import SwirlChip from "@components/SwirlChip/SwirlChip";
import { SwirlIconButton } from "@components/Buttons/SwirlIconButton";
import { GlassTooltip } from "@components/Glass";
import { formatLogUrl } from "@util/stringManipulation";
import { type Bug, SEVERITY_COLORS, STATUS, STATUS_COLORS } from "@data/bugs";
import { FONT, HAIRLINE, ICON } from "@components/Theme/tokens";

interface BugDialogProps {
    open: boolean;
    bug: Bug | null;
    onClose: () => void;
    shareQuery?: string;
}

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box>
        <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ display: "block", mb: 0.5 }}>
            {label}
        </Typography>
        {children}
    </Box>
);

const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography sx={{ fontSize: FONT.micro, fontWeight: 600, letterSpacing: 0.5, color: "text.disabled" }}>
            {label}
        </Typography>
        {children}
    </Box>
);

export const BUG_DIALOG_PAPER_SX = {
    backgroundColor: "background.paper",
    backgroundImage: "none",
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    overflow: "hidden",
    maxWidth: 680,
};

interface BugDetailsProps {
    bug: Bug;
    onClose: () => void;
    actions?: React.ReactNode;
}

export const BugDetails: React.FC<BugDetailsProps> = ({ bug, onClose, actions }) => {
    const severityColor = SEVERITY_COLORS[bug.severity];
    const status = bug.status ?? STATUS.OPEN;

    return (
        <>
            <Box sx={{ display: "flex", borderBottom: `1px solid ${HAIRLINE}` }}>
                <Box sx={{ width: 7, flexShrink: 0, backgroundColor: severityColor }} />
                <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 2, px: 2.5, py: 2 }}>
                    <SpellButton selectedSpell={bug.spell} size={ICON.xl} showName />
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography sx={{ fontSize: FONT.small, color: "text.secondary" }}>
                            {bug.spell.name}
                        </Typography>
                        <Typography component="div" sx={{ fontSize: FONT.subhead, fontWeight: 600, lineHeight: 1.3 }}>
                            {bug.title}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, alignSelf: "flex-start" }}>
                        {actions}
                        <GlassTooltip title="Close">
                            <SwirlIconButton onClick={onClose} aria-label="Close">
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </SwirlIconButton>
                        </GlassTooltip>
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 220px" },
                gridTemplateRows: { sm: "minmax(0, 1fr)" },
                overflowY: { xs: "auto", sm: "hidden" },
            }}>
                <Box sx={{ px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2, overflowY: { sm: "auto" } }}>
                    {bug.description && (
                        <Section label="Description">
                            <Typography component="div" variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                {bug.description}
                            </Typography>
                        </Section>
                    )}
                    {bug.notes && (
                        <Section label="Notes">
                            <Typography component="div" variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                {bug.notes}
                            </Typography>
                        </Section>
                    )}
                    {bug.logs && bug.logs.length > 0 && (
                        <Section label="Logs">
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                                {bug.logs.map((log, i) => (
                                    <Box key={i} sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                                        {log.label && (
                                            <>
                                                <Typography variant="caption" color="text.disabled">{log.label}</Typography>
                                                <Typography variant="caption" color="text.disabled">···</Typography>
                                            </>
                                        )}
                                        <SwirlLink href={log.url} target="_blank" sx={{ fontSize: FONT.body, wordBreak: "break-all" }}>
                                            {formatLogUrl(log.url)}
                                        </SwirlLink>
                                    </Box>
                                ))}
                            </Box>
                        </Section>
                    )}
                </Box>

                <Box sx={{
                    px: 2,
                    py: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    overflowY: { sm: "auto" },
                    borderLeft: { xs: "none", sm: `1px solid ${HAIRLINE}` },
                    borderTop: { xs: `1px solid ${HAIRLINE}`, sm: "none" },
                }}>
                    <Fact label="SEVERITY">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: severityColor }} />
                            <Typography sx={{ fontSize: FONT.small }}>{bug.severity}</Typography>
                        </Box>
                    </Fact>
                    <Fact label="STATUS">
                        <Typography sx={{ fontSize: FONT.small, color: STATUS_COLORS[status] || "text.primary" }}>
                            {status}
                        </Typography>
                    </Fact>
                    {bug.buildsTested.length > 0 && (
                        <Fact label="BUILDS TESTED">
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                                {[...bug.buildsTested].reverse().map((build, i) => (
                                    <Typography key={build} sx={{ fontFamily: "monospace", fontSize: FONT.small, color: i === 0 ? "text.primary" : "text.disabled" }}>
                                        {build}
                                    </Typography>
                                ))}
                            </Box>
                        </Fact>
                    )}
                    {bug.affectedSpells && bug.affectedSpells.length > 0 && (
                        <Fact label="AFFECTED SPELLS">
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                                {bug.affectedSpells.map(affected => (
                                    <SpellButton key={affected.id} selectedSpell={affected} size={ICON.sm} showName />
                                ))}
                            </Box>
                        </Fact>
                    )}
                    {bug.tags && bug.tags.length > 0 && (
                        <Fact label="TAGS">
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {bug.tags.map(tag => (
                                    <SwirlChip key={tag.name} message={tag.name} borderColor={tag.color} fontSize="0.7rem" />
                                ))}
                            </Box>
                        </Fact>
                    )}
                </Box>
            </Box>
        </>
    );
};

const BugDialog: React.FC<BugDialogProps> = ({ open, bug, onClose, shareQuery }) => {
    const [copied, setCopied] = useState(false);

    if (!bug) return null;

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}${shareQuery}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: BUG_DIALOG_PAPER_SX }}>
            <BugDetails
                bug={bug}
                onClose={onClose}
                actions={shareQuery && (
                    <GlassTooltip title={copied ? "Copied" : "Copy link"}>
                        <SwirlIconButton onClick={handleCopyLink} aria-label="Copy link">
                            {copied ? <CheckIcon sx={{ fontSize: 18 }} /> : <LinkIcon sx={{ fontSize: 18 }} />}
                        </SwirlIconButton>
                    </GlassTooltip>
                )}
            />
        </Dialog>
    );
};

export default BugDialog;
