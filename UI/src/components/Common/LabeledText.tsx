import { Group, Text } from "@mantine/core";
import { PropsWithChildren } from "react";

interface labeledTextProps extends PropsWithChildren {
    label: string
}

export function LabeledText(props: labeledTextProps) {
    return (        
        <Group gap="xs">
            <Text fw={500}>{props.label}:</Text>
            <Text fw={400}>{props.children}</Text>
        </Group>
    )
}