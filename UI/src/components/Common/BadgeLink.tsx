import { Badge } from "@mantine/core"
import { PropsWithChildren } from "react"
import classes from "./BadgeLink.module.css"

interface BadgeLinkProps extends PropsWithChildren {
    url: string
}

export function BadgeLink(props: BadgeLinkProps) {
    return(
        <a href={props.url} aria-label={"Tag Link: "+ props.children?.toString()}>
            <Badge className={classes.badgelink}>
                {props.children}
            </Badge>
        </a>
    )
}