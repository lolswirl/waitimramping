"use client";
import type React from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge, ElkNode } from "elkjs/lib/elk-api";
import { Background, BaseEdge, type Edge, type EdgeProps, Handle, type Node, type NodeProps, Position, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box, Typography, Container, IconButton } from "@mui/material";
import { Fullscreen, FullscreenExit } from "@mui/icons-material";
import PageHeader from "@components/PageHeader/PageHeader";
import { FONT, HAIRLINE, ICON, INK, RADIUS, CONTENT_WIDTH } from "@components/Theme/tokens";
import { RAINBOW_COLORS } from "@components/Buttons/RainbowCard";
import { iconFallbackUrl, iconLocalUrl } from "@util/wowhead";
import { type InteractionData, getInteractions } from "@data/interactions";
import ConfigPanel from "@components/ConfigPanel/ConfigPanel";
import { SelectChip, SpecChip } from "@components/FilterChips/FilterChips";
import { useSpec } from "@context/SpecContext";
import { GlassTooltip } from "@components/Glass/Tooltip/GlassTooltip";

const NODE_SIZE = ICON.lg;
const ACCENT = RAINBOW_COLORS[0];

interface Point {
    x: number;
    y: number;
}

interface SpellNodeData extends Record<string, unknown> {
    name: string;
    icon: string;
    iconUrl?: string;
    splitIcons?: [string, string];
}

interface RoutedEdgeData extends Record<string, unknown> {
    points: Point[];
    aura: boolean;
    from: string;
    to: string;
}

// hover lives in context so the node and edge arrays stay the same objects; changing them on every
// hover makes React Flow re-measure and briefly hide every node
const HoverContext = createContext<{ hovered: string | null; connected: Set<string> | null; container?: HTMLElement }>({ hovered: null, connected: null });

// one half of a node that shows two spells, cut along the diagonal
const NodeIcon: React.FC<{ icon: string; name: string; clip: string }> = ({ icon, name, clip }) => (
    <Box
        component="img"
        src={iconLocalUrl(icon)}
        alt={name}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = iconFallbackUrl(icon);
        }}
        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", clipPath: clip }}
    />
);

const SpellNode: React.FC<NodeProps<Node<SpellNodeData>>> = ({ id, data }) => {
    const { hovered, connected, container } = useContext(HoverContext);
    const dimmed = connected !== null && !connected.has(id);
    return (
        <GlassTooltip title={data.name} placement="top" arrow disableInteractive slotProps={{ popper: { container } }}>
            <Box sx={{ width: NODE_SIZE, height: NODE_SIZE, opacity: dimmed ? 0.25 : 1, transition: "opacity 0.15s ease" }}>
                <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
                {data.splitIcons ? (
                    <Box
                        sx={{
                            position: "relative",
                            width: NODE_SIZE,
                            height: NODE_SIZE,
                            borderRadius: `${RADIUS.control}px`,
                            border: `1px solid ${id === hovered ? ACCENT : HAIRLINE}`,
                            overflow: "hidden",
                            backgroundColor: "background.paper",
                        }}
                    >
                        <NodeIcon icon={data.splitIcons[0]} name={data.name} clip="polygon(0 0, 100% 0, 0 100%)" />
                        <NodeIcon icon={data.splitIcons[1]} name={data.name} clip="polygon(100% 0, 100% 100%, 0 100%)" />
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(to bottom right, transparent calc(50% - 1px), rgba(0,0,0,0.8) 50%, transparent calc(50% + 1px))",
                            }}
                        />
                    </Box>
                ) : (
                    <Box
                        component="img"
                        src={data.iconUrl ?? iconLocalUrl(data.icon)}
                        alt={data.name}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = iconFallbackUrl(data.icon);
                        }}
                        sx={{
                            width: NODE_SIZE,
                            height: NODE_SIZE,
                            borderRadius: `${RADIUS.control}px`,
                            border: `1px solid ${id === hovered ? ACCENT : HAIRLINE}`,
                            backgroundColor: "background.paper",
                            display: "block",
                        }}
                    />
                )}
                <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
            </Box>
        </GlassTooltip>
    );
};

const ARROW = 5;

// the layout engine routes each arrow itself, so it can end anywhere along the side of an icon
const RoutedEdge: React.FC<EdgeProps<Edge<RoutedEdgeData>>> = ({ id, source, target, data }) => {
    const { hovered, container } = useContext(HoverContext);
    const [cursor, setCursor] = useState<Point>({ x: 0, y: 0 });
    const [overLine, setOverLine] = useState(false);
    const anchor = useMemo(() => ({ getBoundingClientRect: () => new DOMRect(cursor.x, cursor.y, 0, 0) }), [cursor]);
    if (!data || data.points.length < 2) return null;

    const active = overLine || (hovered !== null && (source === hovered || target === hovered));
    const dimmed = hovered !== null && !active;
    const color = active ? ACCENT : INK.muted;
    const points = data.points;
    const end = points[points.length - 1];
    const prev = points[points.length - 2];
    const length = Math.hypot(end.x - prev.x, end.y - prev.y) || 1;
    const dx = (end.x - prev.x) / length;
    const dy = (end.y - prev.y) / length;
    const base = { x: end.x - dx * ARROW * 1.6, y: end.y - dy * ARROW * 1.6 };
    const head = `${end.x},${end.y} ${base.x - dy * ARROW},${base.y + dx * ARROW} ${base.x + dy * ARROW},${base.y - dx * ARROW}`;
    const path = [...points.slice(0, -1), base].map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return (
        <g opacity={dimmed ? 0.1 : 1} style={{ transition: "opacity 0.15s ease" }}>
            <BaseEdge
                id={id}
                path={path}
                interactionWidth={0}
                style={{ stroke: color, strokeWidth: active ? 2 : 1, strokeDasharray: data.aura ? "3 3" : undefined }}
            />
            <polygon points={head} fill={color} />
            <GlassTooltip
                title={`${data.from} → ${data.to}`}
                placement="top"
                slotProps={{ popper: { anchorEl: anchor, container } }}
            >
                <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={10}
                    style={{ pointerEvents: "stroke" }}
                    onMouseEnter={() => setOverLine(true)}
                    onMouseLeave={() => setOverLine(false)}
                    onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
                />
            </GlassTooltip>
        </g>
    );
};

const nodeTypes = { spell: SpellNode };
const edgeTypes = { routed: RoutedEdge };
const elk = new ELK();

interface Layout {
    positions: Map<string, Point>;
    routes: Map<string, Point[]>;
}

// spells that link to nothing else form small islands, which the layout engine parks in a corner away from
// the main chart. slide each island along its own row until the next icon or arrow is a gap away, so it sits
// as close to the rest as it can without touching anything; arrows inside the island move with it
const ISLAND_GAP = 24;
const ISLAND_STEP = 8;

const pullIslandsIn = (links: InteractionData["links"], positions: Map<string, Point>, routes: Map<string, Point[]>) => {
    const parent = new Map([...positions.keys()].map((id) => [id, id]));
    const find = (id: string): string => {
        const up = parent.get(id) as string;
        if (up === id) return id;
        const root = find(up);
        parent.set(id, root);
        return root;
    };
    for (const l of links) parent.set(find(String(l.from)), find(String(l.to)));

    const groups = new Map<string, string[]>();
    for (const id of positions.keys()) groups.set(find(id), [...(groups.get(find(id)) ?? []), id]);
    const [main, ...islands] = [...groups.values()].sort((a, b) => b.length - a.length);
    const inMain = new Set(main);

    // everything an island must keep clear of, as rectangles: the icons and every arrow segment of the main chart
    const obstacles: { x0: number; x1: number; y0: number; y1: number }[] = main.map((id) => {
        const { x, y } = positions.get(id) as Point;
        return { x0: x, x1: x + NODE_SIZE, y0: y, y1: y + NODE_SIZE };
    });
    for (const [id, points] of routes) {
        const [from, to] = id.split(">");
        if (!inMain.has(from) || !inMain.has(to)) continue;
        for (let i = 1; i < points.length; i++) {
            const [a, b] = [points[i - 1], points[i]];
            obstacles.push({ x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), y0: Math.min(a.y, b.y), y1: Math.max(a.y, b.y) });
        }
    }
    const maxX = Math.max(...obstacles.map((o) => o.x1));

    for (const island of islands) {
        const spots = island.map((id) => positions.get(id) as Point);
        const box = {
            x0: Math.min(...spots.map((p) => p.x)) - ISLAND_GAP,
            x1: Math.max(...spots.map((p) => p.x)) + NODE_SIZE + ISLAND_GAP,
            y0: Math.min(...spots.map((p) => p.y)) - ISLAND_GAP,
            y1: Math.max(...spots.map((p) => p.y)) + NODE_SIZE + ISLAND_GAP,
        };
        const free = (shift: number) => !obstacles.some((o) => o.x0 < box.x1 + shift && o.x1 > box.x0 + shift && o.y0 < box.y1 && o.y1 > box.y0);

        let shift = 0;
        while (box.x1 + shift + ISLAND_STEP < maxX && free(shift + ISLAND_STEP)) shift += ISLAND_STEP;

        for (const id of island) positions.set(id, { x: (positions.get(id) as Point).x + shift, y: (positions.get(id) as Point).y });
        const members = new Set(island);
        for (const [id, points] of routes) {
            const [from, to] = id.split(">");
            if (members.has(from) && members.has(to)) routes.set(id, points.map((pt) => ({ x: pt.x + shift, y: pt.y })));
        }

        // the next island has to stop short of this one rather than land on the same spot
        for (const id of island) {
            const { x, y } = positions.get(id) as Point;
            obstacles.push({ x0: x, x1: x + NODE_SIZE, y0: y, y1: y + NODE_SIZE });
        }
        for (const [id, points] of routes) {
            const [from, to] = id.split(">");
            if (!members.has(from) || !members.has(to)) continue;
            for (let i = 1; i < points.length; i++) {
                const [p, q] = [points[i - 1], points[i]];
                obstacles.push({ x0: Math.min(p.x, q.x), x1: Math.max(p.x, q.x), y0: Math.min(p.y, q.y), y1: Math.max(p.y, q.y) });
            }
        }
    }
};

const layout = async (interactions: InteractionData): Promise<Layout> => {
    const root: ElkNode = {
        id: "root",
        layoutOptions: {
            "elk.algorithm": "layered",
            "elk.direction": "RIGHT",
            "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
            "elk.edgeRouting": "ORTHOGONAL",
            "elk.layered.spacing.nodeNodeBetweenLayers": "28",
            "elk.layered.spacing.edgeNodeBetweenLayers": "12",
            "elk.layered.spacing.edgeEdgeBetweenLayers": "6",
            "elk.spacing.nodeNode": "8",
            "elk.spacing.edgeNode": "10",
            "elk.spacing.edgeEdge": "8",
        },
        children: interactions.nodes.map((n) => ({ id: String(n.id), width: NODE_SIZE, height: NODE_SIZE })),
        edges: interactions.links.map((l) => ({ id: `${l.from}>${l.to}`, sources: [String(l.from)], targets: [String(l.to)] })),
    };
    const graph = await elk.layout(root);

    const positions = new Map((graph.children ?? []).map((c) => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }]));
    const routes = new Map<string, Point[]>();
    for (const edge of (graph.edges ?? []) as ElkExtendedEdge[]) {
        const section = edge.sections?.[0];
        if (!section) continue;
        routes.set(edge.id, [section.startPoint, ...(section.bendPoints ?? []), section.endPoint]);
    }
    pullIslandsIn(interactions.links, positions, routes);
    return { positions, routes };
};

const Interactions: React.FC<{ title: React.ReactNode; description: React.ReactNode }> = ({ title, description }) => {
    const [placed, setPlaced] = useState<Layout | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [withHero, setWithHero] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    const { spec, setSpec } = useSpec();

    const interactions = getInteractions(spec, withHero);

    // the chart is laid out again for each spec, so the old one is dropped first
    useEffect(() => {
        setPlaced(null);
        setHovered(null);
        if (!interactions) return;
        let current = true;
        layout(interactions).then((result) => {
            if (current) setPlaced(result);
        });
        return () => {
            current = false;
        };
    }, [interactions]);

    useEffect(() => {
        const sync = () => setFullscreen(document.fullscreenElement === chartRef.current);
        document.addEventListener("fullscreenchange", sync);
        return () => document.removeEventListener("fullscreenchange", sync);
    }, []);

    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else chartRef.current?.requestFullscreen();
    };

    const connected = useMemo(() => {
        if (!hovered || !interactions) return null;
        const ids = new Set([hovered]);
        for (const l of interactions.links) {
            if (String(l.from) === hovered) ids.add(String(l.to));
            if (String(l.to) === hovered) ids.add(String(l.from));
        }
        return ids;
    }, [hovered, interactions]);

    const nodes: Node<SpellNodeData>[] = useMemo(() => {
        if (!placed || !interactions) return [];
        return interactions.nodes.map((n) => ({
            id: String(n.id),
            type: "spell",
            position: placed.positions.get(String(n.id)) ?? { x: 0, y: 0 },
            data: {
                name: n.name,
                icon: n.icon,
                iconUrl: "iconUrl" in n ? n.iconUrl : undefined,
                splitIcons: "splitIcons" in n ? (n.splitIcons as [string, string]) : undefined,
            },
        }));
    }, [placed, interactions]);

    const edges: Edge<RoutedEdgeData>[] = useMemo(() => {
        if (!placed || !interactions) return [];
        const names = new Map(interactions.nodes.map((n) => [String(n.id), n.name]));
        return interactions.links.map((l) => {
            const id = `${l.from}>${l.to}`;
            return {
                id,
                source: String(l.from),
                target: String(l.to),
                type: "routed",
                data: { points: placed.routes.get(id) ?? [], aura: l.kinds.length === 1 && l.kinds[0] === "Apply Aura",
                    from: names.get(String(l.from)) ?? "",
                    to: names.get(String(l.to)) ?? "",
                },
            };
        });
    }, [placed, interactions]);

    return (
        <Container sx={{ display: "flex", flexDirection: "column", gap: 1, width: CONTENT_WIDTH.wide, height: "100%", minHeight: 0, boxSizing: "border-box", }}>
            <PageHeader title={title} subtitle={description} />

            <ConfigPanel
              sx={{ maxWidth: CONTENT_WIDTH.wide }}
              accent={spec.color}
                leading={
                    <>
                        <SpecChip accent={spec.color} spec={spec} onChange={setSpec} />
                        <SelectChip
                            accent={spec.color}
                            title="hero talents"
                            value={withHero ? "on" : "off"}
                            options={[
                                { value: "off", label: "off" },
                                { value: "on", label: "on" },
                            ]}
                            onChange={(value) => setWithHero(value === "on")}
                            active={withHero}
                        />
                    </>
                }
                sections = {[]}
            />
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 0 }}>
                <Box
                    ref={chartRef}
                    sx={{
                        position: "relative",
                        flex: 1,
                        minHeight: 0,
                        backgroundColor: "background.default",
                        border: `1px solid ${HAIRLINE}`,
                        borderRadius: `${RADIUS.card}px`,
                        overflow: "hidden",
                        "& .react-flow__edge": { pointerEvents: "none" },
                    }}
                >
                    <IconButton
                        onClick={toggleFullscreen}
                        aria-label={fullscreen ? "exit full view" : "open full view"}
                        size="small"
                        sx={{ position: "absolute", top: 8, right: 8, zIndex: 5 }}
                    >
                        {fullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                    </IconButton>
                    {!interactions && (
                        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                            <Typography sx={{ fontSize: FONT.body, color: "text.secondary" }}>there's no interaction chart for {spec.name} {spec.class} yet</Typography>
                        </Box>
                    )}
                    {placed && (
                        <HoverContext.Provider value={{ hovered, connected, container: fullscreen ? (chartRef.current ?? undefined) : undefined }}>
                            <ReactFlow
                                key={`${spec.key}-${fullscreen}`}
                                nodes={nodes}
                                edges={edges}
                                nodeTypes={nodeTypes}
                                edgeTypes={edgeTypes}
                                colorMode="dark"
                                fitView
                                fitViewOptions={{ padding: 0.08, maxZoom: 1.5 }}
                                nodesConnectable={false}
                                nodesDraggable={false}
                                elementsSelectable={false}
                                onNodeMouseEnter={(_, node) => setHovered(node.id)}
                                onNodeMouseLeave={() => setHovered(null)}
                            >
                                <Background color={HAIRLINE} />
                            </ReactFlow>
                        </HoverContext.Provider>
                    )}
                </Box>
                <Typography sx={{ mt: 0.5, fontSize: FONT.micro, lineHeight: 1.4, color: "text.disabled", flexShrink: 0 }}>
                    {interactions ? `generated from ${interactions.source}. hover a spell to follow its connections.` : "charts are generated from SimulationCraft spell data and added spec by spec."}
                </Typography>
            </Box>
        </Container>
    );
};

export default Interactions;
