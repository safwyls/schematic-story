import { CardsCarousel } from "@/components/Carousel/CardsCarousel";
import { Container } from "@mantine/core";

interface SchematicProps {
    id: number
}

export function SchematicDetails(props: SchematicProps) {

    return (
        <Container fluid>
            <CardsCarousel />
        </Container>
    )
}