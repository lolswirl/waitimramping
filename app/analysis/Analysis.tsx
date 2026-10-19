"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, Box, Grid, useTheme } from "@mui/material";

import PageHeader from "@components/PageHeader/PageHeader";
import { T } from "@util/T";
import { formatDate, getCapsMode } from "@util/stringManipulation";
import RainbowCard from "@components/Buttons/RainbowCard";
import { GlassTooltip } from "@components/Glass";

import { analysisPages, type AnalysisPage } from "../AnalysisPages";
import { extractTextFromReactNode } from "@util/extractTextFromReactNode";
import { FONT } from "@components/Theme/tokens";

const AnalysisCard: React.FC<{ tool: AnalysisPage; isOutdated: boolean }> = ({ tool, isOutdated }) => {
    const [hovered, setHovered] = useState(false);
    const descRef = React.useRef<HTMLDivElement>(null);
    const [descHeight, setDescHeight] = React.useState(48);

    React.useLayoutEffect(() => {
        if (descRef.current) {
            const prev = descRef.current.style.transform;
            descRef.current.style.transform = "none";
            setDescHeight(descRef.current.offsetHeight);
            descRef.current.style.transform = prev;
        }
    }, [tool.description]);

    const router = useRouter();

    return (
            <RainbowCard
                variant="outlined"
                sx={{
                    overflow: "hidden",
                    opacity: isOutdated ? 0.4 : 1,
                    cursor: "pointer",
                    "&:hover": { opacity: isOutdated ? 0.6 : 1 },
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClickCapture={(e) => {
                    if ((e.target as HTMLElement).closest('a')) e.preventDefault();
                }}
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest('a')) return;
                    router.push(tool.path);
                }}
            >
                <Box sx={{ height: 200, position: "relative", overflow: "hidden" }}>
                    {/* image */}
                    <Box sx={{
                        position: "absolute", inset: 0,
                        backgroundImage: `url(${tool.preview})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        filter: "blur(0.5px)",
                        opacity: 0.8,
                        transition: "transform 0.3s ease",
                    }} />

                    {/* gradient */}
                    <Box sx={{
                        position: "absolute", inset: 0,
                        background: hovered
                            ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 100%)"
                            : "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 55%)",
                        transition: "background 0.3s ease",
                    }} />

                    {/* outdated badge */}
                    {isOutdated && (
                        <GlassTooltip
                            title={tool.extra || "This tool is no longer maintained or supported"}
                            placement="top"
                        >
                            <Box sx={{
                                position: "absolute", top: "50%", left: "50%",
                                transform: "translate(-50%, -50%)",
                                backgroundColor: "error.main", backdropFilter: "blur(8px)",
                                color: "white", px: 1.5, py: 0.75, borderRadius: 2,
                                fontSize: FONT.body, fontWeight: 600, letterSpacing: "0.05em",
                                textTransform: getCapsMode() ? "none" : "lowercase",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                border: "2px solid rgba(255,255,255,0.1)", zIndex: 2, cursor: "help",
                            }}>
                                Outdated
                            </Box>
                        </GlassTooltip>
                    )}

                    {/* date badge */}
                    <Box sx={{
                        position: "absolute", top: 8, right: 8,
                        backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
                        color: "rgba(255,255,255,0.8)", px: 1.25, py: 0.4, borderRadius: 1,
                        fontSize: FONT.micro, fontWeight: 500, letterSpacing: "0.02em",
                        textTransform: getCapsMode() ? "none" : "lowercase",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}>
                        {formatDate(tool.createdDate)}
                    </Box>

                    {/* title — shifts up by description height on hover */}
                    <Box sx={{
                        position: "absolute", bottom: 0, left: 0, right: 0, px: 1.5, pb: 1.5,
                        transform: hovered ? `translateY(-${descHeight - 12}px)` : "translateY(0)",
                        transition: "transform 0.3s ease",
                        willChange: "transform",
                    }}>
                        <Typography variant="body1" component="div" fontWeight="bold" color="white" sx={{ lineHeight: 1.3 }}>
                            {tool.label}
                        </Typography>
                    </Box>
                    {/* description — slides up from below */}
                    <Box
                        ref={descRef}
                        sx={{
                            position: "absolute", bottom: 0, left: 0, right: 0, px: 1.5, pb: 1.5,
                            transform: hovered ? "translateY(0)" : "translateY(200px)",
                            opacity: hovered ? 1 : 0,
                            transition: "transform 0.3s ease, opacity 0.2s ease",
                            willChange: "transform",
                        }}
                    >
                        <Typography variant="caption" sx={{
                            color: "rgba(255,255,255,0.75)", lineHeight: 1.4,
                        }}>
                            {tool.description}
                        </Typography>
                    </Box>
                </Box>
            </RainbowCard>
    );
};

const FilterChip: React.FC<{ label: string; active?: boolean; accent: string; onClick: () => void }> = ({ label, active, accent, onClick }) => (
    <Box
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
            }
        }}
        sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
            border: "1px solid",
            borderColor: active ? accent : "divider",
            backgroundColor: active ? accent + "14" : "background.paper",
            cursor: "pointer",
            userSelect: "none",
            whiteSpace: "nowrap",
            transition: "border-color 0.15s ease, background-color 0.15s ease",
            "&:hover": { borderColor: accent + "88" },
        }}
    >
        <Typography component="span" sx={{ fontSize: FONT.small, fontFamily: "monospace", color: "text.primary" }}>
            {T(label)}
        </Typography>
    </Box>
);

const Analysis: React.FC<{ title: string; description: string }> = ({ title, description }) => {
    const theme = useTheme();
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const filteredAnalysisPages = analysisPages.filter(
        (tool) => extractTextFromReactNode(tool.label).toLowerCase() !== "analysis"
    );

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        filteredAnalysisPages.forEach(tool => {
            tool.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    }, [filteredAnalysisPages]);

    const displayedPages = useMemo(() => {
        let filtered = filteredAnalysisPages;
        if (selectedTags.length > 0) {
            filtered = filtered.filter(tool =>
                selectedTags.every(selectedTag => tool.tags.includes(selectedTag))
            );
        }
        return filtered.sort((a, b) =>
            b.createdDate.getTime() - a.createdDate.getTime()
        );
    }, [filteredAnalysisPages, selectedTags]);

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const isOutdated = (tool: AnalysisPage) =>
        tool.tags.some(tag => tag.toLowerCase() === "outdated");

    return (
        <Container>
            <PageHeader title={title} subtitle={description} marginBottom={3} />

            <Box sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                    <Typography sx={{ fontSize: FONT.micro, fontWeight: 700, letterSpacing: 0.5, color: "text.disabled" }}>
                        filter
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexGrow: 1 }}>
                        {allTags.map((tag) => (
                            <FilterChip
                                key={tag}
                                label={tag}
                                active={selectedTags.includes(tag)}
                                accent={theme.palette.primary.main}
                                onClick={() => handleTagToggle(tag)}
                            />
                        ))}
                    </Box>
                    {selectedTags.length > 0 && (
                        <>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: "nowrap" }}>
                                {`${displayedPages.length} of ${filteredAnalysisPages.length} tools`}
                            </Typography>
                            <FilterChip
                                label={`Reset (${selectedTags.length})`}
                                accent={theme.palette.error.main}
                                onClick={() => setSelectedTags([])}
                            />
                        </>
                    )}
                </Box>
            </Box>

            <Grid container spacing={3}>
                {displayedPages.map((tool) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tool.path}>
                        <AnalysisCard tool={tool} isOutdated={isOutdated(tool)} />
                    </Grid>
                ))}
            </Grid>

            {displayedPages.length === 0 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No tools match the selected filters
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try selecting different tags or clear all filters
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default Analysis;
