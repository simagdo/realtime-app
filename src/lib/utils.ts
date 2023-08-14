import clsx, {ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function chatHrefConstructor(id1: string, id2: string) {
    const sortedIDs = [id1, id2].sort();
    return `${sortedIDs[0]}--${sortedIDs[1]}`;
}

export function toPusherKey(key: string) {
    return key.replace(/:/g, '__');
}