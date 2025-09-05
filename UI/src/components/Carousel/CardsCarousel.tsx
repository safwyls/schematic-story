import { Carousel } from '@mantine/carousel';
import { Paper, Text } from '@mantine/core';
import classes from './CardsCarousel.module.css';

export interface ImageCard {
    image: string;
    caption?: string;
}

interface CarouselProps {
    cards: ImageCard[]
}

function Card({ image, caption }: ImageCard) {
    return (
        <Paper
            shadow="md"
            p="xl"
            radius="md"
            style={{ backgroundImage: `url(${image})` }}
            className={classes.card}
        >
            <Text className={classes.category} size="md">
                {caption}
            </Text>
        </Paper>
    );
}

export function CardsCarousel(props: CarouselProps) {
    const slides = props.cards.map((item, index) => {
        return (
            <Carousel.Slide key={index} >
                <Card key={index} {...item} />
            </Carousel.Slide>
    )});

    return (
        <Carousel 
            withIndicators
            slideSize={{ base: '100%', sm: '100%' }}
            slideGap={2}
        >
            {slides}
        </Carousel>
    );
}