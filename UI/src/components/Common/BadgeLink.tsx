import { Badge } from "@mantine/core"
import { PropsWithChildren } from "react"
import classes from "./BadgeLink.module.css"

interface BadgeLinkProps extends PropsWithChildren {
    url: string,
    color?: string
}

function wordToColor(word: string | undefined): string {
    if (word == null) return "";

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
        hash = word.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Keep in 32-bit range
    }

    // Map hash to [0, 16777215] (0xFFFFFF)
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ('00' + value.toString(16)).slice(-2);
    }

    return color;
}

export function BadgeLink(props: BadgeLinkProps) {
    return(
        <a href={props.url} aria-label={"Tag Link: "+ props.children?.toString()}>
            <Badge className={classes.badgelink} color={props.color ?? wordToColor(props.children?.toString())}>
                {props.children}
            </Badge>
        </a>
    )
}