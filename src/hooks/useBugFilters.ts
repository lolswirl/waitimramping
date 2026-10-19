import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { type Bug, STATUS, SEVERITY, getBuildSortValue } from "@data/bugs";
import type { Tags } from "@data/shared/tags";
import type { specialization } from "@data/class";
import { extractTextFromReactNode } from "@util/extractTextFromReactNode";

export const useBugFilters = (bugs: Bug[], selectedSpec: specialization) => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [selectedSeverity, setSelectedSeverity] = useState<string>(() => {
        return searchParams.get('severity') || "All";
    });
    const [selectedStatus, setSelectedStatus] = useState<string>(() => {
        return searchParams.get('status') || STATUS.OPEN;
    });
    const [searchText, setSearchText] = useState<string>(() => {
        return searchParams.get('search') || "";
    });

    const updateURL = (updates: Partial<{
        search: string;
        severity: string;
        status: string;
    }>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== "All" && value !== STATUS.OPEN) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        if (updates.status && updates.status !== STATUS.OPEN) {
            params.set('status', updates.status);
        } else if (Object.hasOwn(updates, 'status')) {
            params.delete('status');
        }

        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const setSelectedSeverityWithURL = (severity: string) => {
        setSelectedSeverity(severity);
        updateURL({ severity });
    };

    const setSelectedStatusWithURL = (status: string) => {
        setSelectedStatus(status);
        updateURL({ status });
    };

    const setSearchTextWithURL = (search: string) => {
        setSearchText(search);
        updateURL({ search });
    };

    useEffect(() => {
        const urlSearch = searchParams.get('search') || "";
        const urlSeverity = searchParams.get('severity') || "All";
        const urlStatus = searchParams.get('status') || STATUS.OPEN;

        if (urlSearch !== searchText) setSearchText(urlSearch);
        if (urlSeverity !== selectedSeverity) setSelectedSeverity(urlSeverity);
        if (urlStatus !== selectedStatus) setSelectedStatus(urlStatus);
    }, [searchParams]);

    const sortedBugs = useMemo(() => {
        return [...bugs].sort((a, b) => {
            const aBuild = a.buildsTested?.length ? getBuildSortValue(a.buildsTested) : 0;
            const bBuild = b.buildsTested?.length ? getBuildSortValue(b.buildsTested) : 0;

            if (bBuild !== aBuild) return bBuild - aBuild;

            // reverse array for "newer" bug entries to appear first
            const aIndex = bugs.indexOf(a);
            const bIndex = bugs.indexOf(b);
            return bIndex - aIndex;
        });
    }, [bugs]);

    const allTags = useMemo(() => {
        const tagSet = new Set<Tags>();
        bugs.forEach((bug) => {
            for (const tag of bug.tags || []) tagSet.add(tag);
        });
        return [...tagSet].sort();
    }, [bugs]);

    const severities = useMemo(
        () => ["All", ...(Object.values(SEVERITY).reverse() as string[])],
        []
    );
    const statuses = useMemo(
        () => ["All", ...(Object.values(STATUS) as string[])],
        []
    );

    const filtered = useMemo(() => {
        let filtered = sortedBugs;
        if (selectedStatus !== "All") {
            filtered = filtered.filter(
                (bug) => (bug.status || STATUS.OPEN) === selectedStatus
            );
        }
        if (selectedSeverity !== "All") {
            filtered = filtered.filter(
                (bug) => bug.severity === selectedSeverity
            );
        }
        if (searchText.trim()) {
            const search = searchText.trim().toLowerCase();
            filtered = filtered.filter((bug) => {
                const spellNames = [
                    bug.spell?.name,
                    ...(bug.affectedSpells
                        ? bug.affectedSpells.map((spell) => spell.name)
                        : []),
                ]
                    .filter(Boolean)
                    .map((n) => n.toLowerCase());
                
                return (
                    spellNames.some((name) => name.includes(search)) ||
                    extractTextFromReactNode(bug.title).toLowerCase().includes(search) ||
                    (bug.description && extractTextFromReactNode(bug.description).toLowerCase().includes(search)) ||
                    (selectedSpec?.name?.toLowerCase?.() || "").includes(
                        search
                    ) ||
                    bug.tags?.some((tag) => tag.name.toLowerCase().includes(search))
                );
            });
        }
        return filtered;
    }, [sortedBugs, selectedSeverity, searchText, selectedStatus, selectedSpec]);

    const isDefault =
        searchText === "" &&
        selectedStatus === STATUS.OPEN &&
        selectedSeverity === "All";

    const clearAllFilters = () => {
        setSelectedSeverity("All");
        setSelectedStatus(STATUS.OPEN);
        setSearchText("");
        const params = new URLSearchParams(searchParams.toString());
        params.delete('search');
        params.delete('severity');
        params.delete('status');
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return {
        selectedSeverity,
        setSelectedSeverity: setSelectedSeverityWithURL,
        selectedStatus,
        setSelectedStatus: setSelectedStatusWithURL,
        searchText,
        setSearchText: setSearchTextWithURL,
        allTags,
        severities,
        statuses,
        isDefault,
        clearAllFilters,
        filtered,
    };
};
