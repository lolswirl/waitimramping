"use client";

import type React from "react";
import { WowLink } from "@components/SpellLink/SpellLink";
import { wowheadItemUrl } from "@util/wowhead";

export interface Item {
    name: string;
    id: number;
    icon: string;
}

interface ItemLinkProps {
    item: Item;
    size?: number;
    gap?: number;
    sx?: any;
    textSx?: any;
    noLink?: boolean;
}

const ItemLink: React.FC<ItemLinkProps> = ({ item, ...rest }) => (
    <WowLink
        name={item.name}
        icon={item.icon}
        href={wowheadItemUrl(item.id)}
        {...rest}
    />
);

export default ItemLink;
