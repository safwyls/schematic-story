import { Image } from '@mantine/core';

interface LogoProps {
    w?: any,
    h?: any,
}

export function SchematicStoryLogo({ w = "auto", h = "auto" }: LogoProps) {
    return(
        <Image
            src="src/assets/schematicstory.svg"
            alt="Schematic Story Logo"
            w={w}
            h={h}
        />
    )
}