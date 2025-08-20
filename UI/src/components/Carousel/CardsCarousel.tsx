import { Carousel } from '@mantine/carousel';
import { Button, Paper, Text, Title, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import '@mantine/carousel/styles.css';
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
            <div>
                <Text className={classes.category} size="xs">
                    {caption}
                </Text>
            </div>
        </Paper>
    );
}

export function CardsCarousel(props: CarouselProps) {
    const theme = useMantineTheme();
    const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
    const slides = props.cards.map((item, index) => {
        console.log(item.image);
        return (
            <Carousel.Slide key={index} >
                <Card key={index} {...item} />
            </Carousel.Slide>
    )});

    return (
        <Carousel
            slideSize={{ base: '100%', sm: '100%' }}
            slideGap={2}
            emblaOptions={{ align: 'start', slidesToScroll: 1 }}
        >
        {slides}
        </Carousel>
    );
}