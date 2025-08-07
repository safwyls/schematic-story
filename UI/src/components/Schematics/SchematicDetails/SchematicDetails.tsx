import { CardsCarousel } from "@/components/Carousel/CardsCarousel";
import { Container } from "@mantine/core";

interface SchematicProps {
    id: string | undefined
}

export function SchematicDetails(props: SchematicProps) {

    return (
        <Container>
            <CardsCarousel />
        </Container>
    )
}