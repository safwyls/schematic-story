import { CardsCarousel } from "@/components/Carousel/CardsCarousel";
import { Card, Container, Flex, Grid, Title, Text, Group, Button, Stack, ActionIcon, Badge } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconDownload, IconHeart, IconShare } from '@tabler/icons-react';
import { LabeledText } from "../../Common/LabeledText";
import { BadgeLink } from "@/components/Common/BadgeLink";

interface SchematicProps {
    id: string | undefined
}

export function SchematicDetails(props: SchematicProps) {
    const [title, setTitle] = useState('Title Goes Here');
    const [author, setAuthor] = useState('Jonas Falx');
    const [description, setDescription] = useState('Description');
    const [details, setDetails] = useState('Details');
    const [tags, setTags] = useState(["vanilla", "ruin"])

    useEffect(() => {
        // Get schematic details by id
    }, [props.id])

    return (
        <Container>
            <Grid grow>
                <Grid.Col span={12}>
                    <Title>{title}</Title>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Group align="fill" grow gap="sm">
                        <CardsCarousel />
                        <Stack justify="space-between">
                            <Card shadow="xs" radius="md">
                                <Card.Section inheritPadding py="xs">
                                    <LabeledText label="Tags">
                                        <Group gap="xs">
                                            {tags.map(t => (
                                                <BadgeLink url={"/tags/"+ t}>{t}</BadgeLink>
                                            ))}
                                        </Group>
                                    </LabeledText>
                                </Card.Section>
                                <Card.Section inheritPadding py="xs">
                                    <LabeledText label="Author">{author}</LabeledText>
                                </Card.Section>
                                <Card.Section inheritPadding py="xs">
                                    <LabeledText label="Contributors">none</LabeledText>
                                </Card.Section>
                                <Card.Section inheritPadding py="xs">
                                    <LabeledText label="Size">Medium</LabeledText>
                                </Card.Section>
                                <Card.Section inheritPadding py="xs">
                                    <LabeledText label="Submitted At">June 8th, 2025</LabeledText>
                                </Card.Section>
                            </Card>
                            <Group justify="center">
                                <Button variant="filled" aria-label="Download"><IconDownload height={16}/>Download</Button>
                                <ActionIcon size="lg" color="red" aria-label="Follow"><IconHeart/></ActionIcon>
                                <ActionIcon variant="outline" size="lg" aria-label="Share"><IconShare/></ActionIcon>
                            </Group>
                        </Stack>
                    </Group>
                </Grid.Col>
                <Grid.Col span={12}>
                    {description}
                </Grid.Col>
                <Grid.Col span={12}>
                    More from {author}
                    <Flex>
                        
                    </Flex>
                </Grid.Col>
            </Grid>
        </Container>
    )
}