"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { SearchOff } from "@mui/icons-material";

import PageHeader from "@components/PageHeader/PageHeader";
import SwirlLink from "@components/SwirlLink/SwirlLink";
import SwirlButton from "@components/Buttons/SwirlButton";
import BugTable from "@components/BugTable/BugTable";
import BugDialog from "@components/BugDialog/BugDialog";
import BugFilters from "@components/BugFilters/BugFilters";
import BugUpdateWorkflow from "@components/BugUpdateWorkflow/BugUpdateWorkflow";

import { getSpecializationByKey } from "@data/class";
import { useSpec } from "@context/SpecContext";
import { type Bug, STATUS } from "@data/bugs";

import { useBugFilters } from "@hooks/useBugFilters";
import { pluralize } from "@util/stringManipulation";
import { exportBugsToExcel } from "@util/exportBugsToExcel";
import { extractTextFromReactNode } from "@util/extractTextFromReactNode";
import { FONT, ICON } from "@components/Theme/tokens";

const bugSlug = (bug: Bug): string => {
    const title = extractTextFromReactNode(bug.title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
    return `${bug.spell.id}-${title}`;
};

const BugsPage: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    
    const { spec: selectedSpec, setSpec: setSelectedSpec } = useSpec();
    const [bugUpdateOpen, setBugUpdateOpen] = useState(false);

    const bugs = selectedSpec.bugs || [];
    const bugParam = searchParams.get('bug');
    const selectedBug = bugParam ? bugs.find(bug => bugSlug(bug) === bugParam) ?? null : null;
    const iconSize = ICON.lg;

    const {
        selectedSeverity,
        setSelectedSeverity,
        selectedStatus,
        setSelectedStatus,
        searchText,
        setSearchText,
        severities,
        statuses,
        isDefault,
        clearAllFilters,
        filtered,
    } = useBugFilters(bugs, selectedSpec);

    useEffect(() => {
        const specParam = searchParams.get('spec');
        if (specParam) {
            const urlSpec = getSpecializationByKey(specParam);
            if (urlSpec && urlSpec !== selectedSpec) {
                setSelectedSpec(urlSpec);
            }
        }
    }, [searchParams, selectedSpec]);

    const setBugParam = (slug: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slug) {
            params.set('bug', slug);
        } else {
            params.delete('bug');
        }
        const query = params.toString();
        window.history.replaceState(null, "", query ? `?${query}` : pathname);
    };

    const handleRowClick = (bug: Bug) => {
        setBugParam(bugSlug(bug));
    };

    const handleDialogClose = () => {
        setBugParam(null);
    };

    const handleExportToExcel = () => {
        const fileName = `${selectedSpec.name.toLowerCase().replace(/\s+/g, '-')}-bugs.xlsx`;
        exportBugsToExcel(filtered, fileName);
    };

    const handleOpenBugUpdate = () => {
        setBugUpdateOpen(true);
    };

    const handleCloseBugUpdate = () => {
        setBugUpdateOpen(false);
    };

    const openBugs = bugs.filter(bug => !bug.status || bug.status === STATUS.OPEN);
    const openBugIndices = bugs
        .map((bug, index) => (!bug.status || bug.status === STATUS.OPEN ? index : -1))
        .filter(index => index !== -1);

    return (
        <Container sx={{ mb: 3 }}>
            <PageHeader 
                title={title}
                subtitle={
                    <>{description}<br />Don't see your spec's bugs? Report them <SwirlLink href="https://github.com/lolswirl/waitimramping/issues" target="_blank" sx={{ fontSize: FONT.body }}>here</SwirlLink>!</>
                }
                marginBottom={3}
            />
            <Box sx={{ mx: "auto" }}>
                <BugFilters
                    selectedSpec={selectedSpec}
                    setSelectedSpec={setSelectedSpec}
                    search={searchText}
                    onSearchChange={setSearchText}
                    status={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    severity={selectedSeverity}
                    onSeverityChange={setSelectedSeverity}
                    statuses={statuses}
                    severities={severities}
                    count={`${filtered.length}/${bugs.length} ${pluralize(bugs.length, "bug")}`}
                    onReset={isDefault ? undefined : clearAllFilters}
                    onExportToExcel={handleExportToExcel}
                    onOpenBugUpdate={handleOpenBugUpdate}
                />
                {filtered.length > 0 ? (
                    <>
                        <BugTable
                            bugs={filtered}
                            iconSize={iconSize}
                            onRowClick={handleRowClick}
                        />
                        <BugUpdateWorkflow
                            open={bugUpdateOpen}
                            onClose={handleCloseBugUpdate}
                            bugs={openBugs}
                            originalIndices={openBugIndices}
                            specKey={selectedSpec.key}
                            specName={selectedSpec.name}
                        />
                    </>
                ) : (
                    <Box sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                        <SearchOff sx={{ fontSize: 32, color: "text.disabled" }} />
                        <Typography sx={{ fontSize: FONT.body, color: "text.secondary" }}>
                            {isDefault ? "No bugs found for this spec" : "No bugs match these filters"}
                        </Typography>
                        {!isDefault && (
                            <SwirlButton onClick={clearAllFilters} color="error">Reset</SwirlButton>
                        )}
                    </Box>
                )}
            </Box>
            <BugDialog
                open={selectedBug !== null}
                bug={selectedBug}
                onClose={handleDialogClose}
                shareQuery={selectedBug ? `?spec=${selectedSpec.key}&bug=${bugSlug(selectedBug)}` : undefined}
            />
        </Container>
    );
};

export default BugsPage;
