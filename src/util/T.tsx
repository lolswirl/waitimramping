import React, { type ReactElement, type ReactNode } from "react";
import { getCapsMode } from "@util/stringManipulation";

const applyCase = (str: string): string => {
    if (str === undefined || str === null) return "";
    return getCapsMode() ? str : str.toLowerCase();
};

function applyT(node: ReactNode): ReactNode {
    if (node == null || typeof node === "boolean") return node;
    if (typeof node === "number") return node;
    if (typeof node === "string") return applyCase(node);

    if (Array.isArray(node)) {
        return node.map((child, i) => (
            <React.Fragment key={i}>{applyT(child)}</React.Fragment>
        ));
    }

    if (React.isValidElement(node)) {
        const props = (node as ReactElement).props as Record<string, unknown>;
        if (props?.children) {
            return React.cloneElement(node as ReactElement, {
                ...props,
                children: applyT(props.children as ReactNode),
            } as Record<string, unknown>);
        }
        return node;
    }

    return node;
}

function T(str: string): string;
function T(props: { children: ReactNode }): ReactElement;
function T(arg: string | { children: ReactNode }): string | ReactElement {
    if (typeof arg === "string") return applyCase(arg);
    if (getCapsMode()) return <>{arg.children}</>;
    return <>{applyT(arg.children)}</>;
}

export default T;
export { T };
