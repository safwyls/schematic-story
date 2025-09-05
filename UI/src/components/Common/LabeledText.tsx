import { Group, Text } from "@mantine/core";
import { PropsWithChildren } from "react";

export interface labeledTextProps extends PropsWithChildren {
    label: string
}

export function LabeledText(props: labeledTextProps) {
    return (
        // Make sure to use polymorphism for children Text item to avoid div nested in paragraph       
        <Group gap="xs">
            <Text fw={500}>{props.label}:</Text>
            <Text fw={400} c="dimmed" component="span">{props.children}</Text>
        </Group>
    )
}