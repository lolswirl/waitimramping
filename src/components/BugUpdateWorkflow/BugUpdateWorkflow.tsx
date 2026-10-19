import type React from "react";
import { useState } from "react";
import {
    Dialog,
    TextField,
    Box,
    Typography,
    Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ArrowBack, BugReport, Check, HelpOutline, RemoveCircleOutline, SkipNext } from "@mui/icons-material";
import { type Bug, STATUS } from "@data/bugs";
import { BugDetails, BUG_DIALOG_PAPER_SX } from "@components/BugDialog/BugDialog";
import SwirlButton from "@components/Buttons/SwirlButton";
import { SwirlIconButton } from "@components/Buttons/SwirlIconButton";
import { GlassTooltip } from "@components/Glass";
import { FONT, HAIRLINE } from "@components/Theme/tokens";

// served by scripts/bug-update-server.mjs (npm run bugs)
const UPDATE_URL = "http://localhost:3111/update";

interface BugUpdateWorkflowProps {
    open: boolean;
    onClose: () => void;
    bugs: Bug[];
    originalIndices: number[];
    specKey: string;
    specName: string;
}

enum WorkflowStep {
    BUILD_INPUT = "BUILD_INPUT",
    BUG_REVIEW = "BUG_REVIEW",
    COMPLETE = "COMPLETE",
}

interface BugUpdate {
    reviewIndex: number;
    index: number;
    build: string;
    status?: string;
}

const BugUpdateWorkflow: React.FC<BugUpdateWorkflowProps> = ({
    open,
    onClose,
    bugs,
    originalIndices,
    specKey,
    specName,
}) => {
    const [step, setStep] = useState<WorkflowStep>(WorkflowStep.BUILD_INPUT);
    const [buildNumber, setBuildNumber] = useState("");
    const [currentBugIndex, setCurrentBugIndex] = useState(0);
    const [bugUpdates, setBugUpdates] = useState<BugUpdate[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savedFiles, setSavedFiles] = useState<string[]>([]);

    const resetWorkflow = () => {
        setStep(WorkflowStep.BUILD_INPUT);
        setBuildNumber("");
        setCurrentBugIndex(0);
        setBugUpdates([]);
        setSaveError(null);
        setSavedFiles([]);
    };

    const handleClose = () => {
        resetWorkflow();
        onClose();
    };

    const startReview = () => {
        if (!buildNumber.trim()) return;
        setBugUpdates([]);
        setStep(WorkflowStep.BUG_REVIEW);
    };

    const handleBugResponse = (action: 'fixed' | 'removed' | 'unknown' | 'broken') => {
        let updates = bugUpdates;

        // i guess don't really do anything for unknown, just skip
        if (action !== 'unknown') {
            const update: BugUpdate = {
                reviewIndex: currentBugIndex,
                index: originalIndices[currentBugIndex],
                build: buildNumber.trim(),
            };
            if (action === 'fixed') update.status = STATUS.FIXED;
            if (action === 'removed') update.status = STATUS.REMOVED;
            updates = [...bugUpdates, update];
            setBugUpdates(updates);
        }

        if (currentBugIndex < bugs.length - 1) {
            setCurrentBugIndex(currentBugIndex + 1);
        } else {
            saveUpdates(updates);
        }
    };

    const handleSkipRest = () => {
        saveUpdates(bugUpdates);
    };

    const handlePrevious = () => {
        if (currentBugIndex > 0) {
            setBugUpdates(prev => prev.filter(update => update.reviewIndex < currentBugIndex - 1));
            setCurrentBugIndex(currentBugIndex - 1);
        }
    };

    const saveUpdates = async (updates: BugUpdate[]) => {
        setStep(WorkflowStep.COMPLETE);
        setSaveError(null);
        setIsSaving(true);

        try {
            const response = await fetch(UPDATE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spec: specKey, updates }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            setSavedFiles(result.files);
        } catch (err) {
            setSaveError(err instanceof TypeError
                ? "Could not reach the bug update server. Start it with `npm run bugs`, then retry."
                : (err as Error).message);
        }

        setIsSaving(false);
    };

    const currentBug = bugs[currentBugIndex];
    const progress = bugs.length > 0 ? Math.round(((currentBugIndex + 1) / bugs.length) * 100) : 0;
    const reviewing = step === WorkflowStep.BUG_REVIEW && currentBug;
    const footerSx = { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, px: 2, py: 0.75 };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: BUG_DIALOG_PAPER_SX }}>
            {reviewing ? (
                <>
                    <BugDetails
                        bug={currentBug}
                        onClose={handleClose}
                        actions={
                            <Typography sx={{ fontSize: FONT.micro, fontWeight: 600, color: "text.disabled", whiteSpace: "nowrap" }}>
                                {currentBugIndex + 1} / {bugs.length}
                            </Typography>
                        }
                    />
                    <Box sx={{ height: 2, flexShrink: 0, backgroundColor: HAIRLINE }}>
                        <Box sx={{ width: `${progress}%`, height: "100%", backgroundColor: "primary.main", transition: "width 0.3s ease" }} />
                    </Box>
                    <Typography sx={{ px: 2.5, pt: 1.5, fontSize: FONT.small, color: "text.secondary" }}>
                        Is this bug still broken in build {buildNumber}?
                    </Typography>
                    <Box sx={footerSx}>
                        <SwirlButton onClick={handlePrevious} disabled={currentBugIndex === 0} startIcon={<ArrowBack />}>Back</SwirlButton>
                        <SwirlButton onClick={handleSkipRest} startIcon={<SkipNext />}>Skip Rest</SwirlButton>
                        <Box sx={{ flex: 1 }} />
                        <SwirlButton onClick={() => handleBugResponse('fixed')} color="success" startIcon={<Check />}>Fixed</SwirlButton>
                        <SwirlButton onClick={() => handleBugResponse('removed')} color="info" startIcon={<RemoveCircleOutline />}>Removed</SwirlButton>
                        <SwirlButton onClick={() => handleBugResponse('unknown')} color="warning" startIcon={<HelpOutline />}>Not Sure</SwirlButton>
                        <SwirlButton onClick={() => handleBugResponse('broken')} color="error" startIcon={<BugReport />}>Still Broken</SwirlButton>
                    </Box>
                </>
            ) : (
                <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2.5, py: 2, borderBottom: `1px solid ${HAIRLINE}` }}>
                        <Typography sx={{ flex: 1, fontSize: FONT.subhead, fontWeight: 600, lineHeight: 1.3 }}>
                            {step === WorkflowStep.BUILD_INPUT ? "Enter Build Number" : "Update Complete"}
                        </Typography>
                        <GlassTooltip title="Close">
                            <SwirlIconButton onClick={handleClose} aria-label="Close">
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </SwirlIconButton>
                        </GlassTooltip>
                    </Box>

                    <Box sx={{ px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
                        {step === WorkflowStep.BUILD_INPUT && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Build Number"
                                    value={buildNumber}
                                    onChange={(e) => setBuildNumber(e.target.value)}
                                    placeholder="e.g., 66220"
                                    autoFocus
                                    onKeyPress={(e) => { if (e.key === "Enter" && buildNumber.trim()) startReview(); }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    This build number will be added to buildsTested for bugs that are still broken.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    You will review {bugs.length} open {bugs.length === 1 ? 'bug' : 'bugs'} for {specName}.
                                </Typography>
                            </>
                        )}

                        {step === WorkflowStep.COMPLETE && (
                            <>
                                {isSaving ? (
                                    <Typography variant="body1" color="text.secondary">
                                        Saving updates...
                                    </Typography>
                                ) : saveError ? (
                                    <Alert severity="error" sx={{ borderRadius: 1 }}>
                                        {saveError}
                                    </Alert>
                                ) : (
                                    <>
                                        <Alert severity="success" sx={{ borderRadius: 1 }}>
                                            Review complete! {bugUpdates.length} bug(s) updated.
                                        </Alert>
                                        {savedFiles.map(file => (
                                            <Typography key={file} sx={{ fontFamily: "monospace", fontSize: FONT.small, color: "text.secondary" }}>
                                                {file}
                                            </Typography>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </Box>

                    <Box sx={{ ...footerSx, justifyContent: "flex-end", borderTop: `1px solid ${HAIRLINE}` }}>
                        {step === WorkflowStep.BUILD_INPUT && (
                            <>
                                <SwirlButton onClick={handleClose}>Cancel</SwirlButton>
                                <SwirlButton onClick={startReview} disabled={!buildNumber.trim()} color="primary">Start Review</SwirlButton>
                            </>
                        )}
                        {step === WorkflowStep.COMPLETE && (
                            <>
                                {saveError && <SwirlButton onClick={() => saveUpdates(bugUpdates)}>Retry</SwirlButton>}
                                <SwirlButton onClick={handleClose} color="primary">Done</SwirlButton>
                            </>
                        )}
                    </Box>
                </>
            )}
        </Dialog>
    );
};

export default BugUpdateWorkflow;
