export interface InteractionNode {
    id: number;
    name: string;
    icon: string;
    iconUrl?: string;
    splitIcons?: [string, string];
}

export interface InteractionLink {
    from: number;
    to: number;
    kinds: string[];
}

// what the chart draws, with names and icons filled in
export interface InteractionData {
    source: string;
    nodes: InteractionNode[];
    links: InteractionLink[];
}

// what scripts/gen-interactions.mjs writes: ids and links, with names and icons left to the spell data
export interface StoredInteractions {
    source: string;
    nodes: number[];
    heroNodes: number[];
    extraNodes: { id: number; name: string; iconUrl?: string; spellIds?: [number, number] }[];
    links: InteractionLink[];
}
