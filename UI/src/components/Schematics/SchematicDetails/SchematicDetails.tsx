import { CardsCarousel } from "@/components/Carousel/CardsCarousel";
import { Card, Container, Grid, Title, Group, Button, Stack, ActionIcon, Badge, useComputedColorScheme, Paper } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconDownload, IconEdit, IconHeart, IconShare } from '@tabler/icons-react';
import { labeledTextProps, LabeledText } from "../../Common/LabeledText";
import { BadgeLink } from "@/components/Common/BadgeLink";
import dayjs from 'dayjs';
import { BlockNoteView, darkDefaultTheme, lightDefaultTheme, Theme } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Block } from "@blocknote/core";


const lightBlueTheme = {
  colors: lightDefaultTheme.colors,
  borderRadius: 4,
  fontFamily: "Helvetica Neue, sans-serif",
} satisfies Theme;

const darkBlueTheme = {
  colors: {
    ...darkDefaultTheme,
    editor: {
      text: "#ffffff",
      background: "#284871"
    },
    highlights: darkDefaultTheme.colors!.highlights,
  },
} satisfies Theme;

const blueTheme = {
  light: lightBlueTheme,
  dark: darkBlueTheme,
};

interface SchematicProps {
    id: string | undefined
}

interface Details {
    title: string,
    author: string,
    contributors: string[],
    buildSize: string,
    submittedAt: string,
    updatedAt: string,
    follows: number,
    downloads: number,
    description: any[],
    tags: string[],
    dimensions: Vec3d,
    fileSize: number
}

interface Vec3d {
    x: number,
    y: number,
    z: number
}

function SectionText(props: labeledTextProps) {
    return (        
        <Card.Section inheritPadding py={5}>
            <LabeledText label={props.label}>{props.children}</LabeledText>
        </Card.Section>
    )
}

export function SchematicDetails(props: SchematicProps) {
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editable, setEditable] = useState<boolean>(false);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const editor = useCreateBlockNote({
        initialContent: [
        {
            type: "paragraph",
            content: "Welcome to this demo!",
        },
        {
            type: "paragraph",
        },
        {
            type: "paragraph",
            content: [
            {
                type: "text",
                text: "Blocks:",
                styles: { bold: true },
            },
            ],
        },
        {
            type: "paragraph",
            content: "Paragraph",
        },
        {
            type: "heading",
            content: "Heading",
        },
        {
            id: "toggle-heading",
            type: "heading",
            props: { isToggleable: true },
            content: "Toggle Heading",
        },
        {
            type: "quote",
            content: "Quote",
        },
        {
            type: "bulletListItem",
            content: "Bullet List Item",
        },
        {
            type: "numberedListItem",
            content: "Numbered List Item",
        },
        {
            type: "checkListItem",
            content: "Check List Item",
        },
        {
            id: "toggle-list-item",
            type: "toggleListItem",
            content: "Toggle List Item",
        },
        {
            type: "codeBlock",
            props: { language: "javascript" },
            content: "console.log('Hello, world!');",
        },
        {
            type: "table",
            content: {
            type: "tableContent",
            rows: [
                {
                cells: ["Table Cell", "Table Cell", "Table Cell"],
                },
                {
                cells: ["Table Cell", "Table Cell", "Table Cell"],
                },
                {
                cells: ["Table Cell", "Table Cell", "Table Cell"],
                },
            ],
            },
        },
        {
            type: "file",
        },
        {
            type: "image",
            props: {
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
            caption:
                "From https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg",
            },
        },
        {
            type: "video",
            props: {
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
            caption:
                "From https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
            },
        },
        {
            type: "audio",
            props: {
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
            caption:
                "From https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
            },
        },
        {
            type: "paragraph",
        },
        {
            type: "paragraph",
            content: [
            {
                type: "text",
                text: "Inline Content:",
                styles: { bold: true },
            },
            ],
        },
        {
            type: "paragraph",
            content: [
            {
                type: "text",
                text: "Styled Text",
                styles: {
                bold: true,
                italic: true,
                textColor: "red",
                backgroundColor: "blue",
                },
            },
            {
                type: "text",
                text: " ",
                styles: {},
            },
            {
                type: "link",
                content: "Link",
                href: "https://www.blocknotejs.org",
            },
            ],
        },
        {
            type: "paragraph",
        },
        ],
    });
    const [details, setDetails] = useState<Details>({
        title: "Title goes here",
        author: "Jonas Falx",
        contributors: [],
        buildSize: 'Medium',
        submittedAt: '2019-01-25',
        updatedAt: '2019-01-25',
        follows: 193580,
        downloads: 12578,
        description: [],
        tags: ["vanilla", "ruin"],
        dimensions: {x: 745, y: 95, z: 120},
        fileSize: 125647
    });

    function formatBytes(bytes: number, decimals = 2): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024; // or 1000 for decimal units
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const onEditClick = () => {
        if (editMode) {
            // save changes here

        }

        setEditMode(!editMode);
    }

    useEffect(() => {
        async function loadInitialHTML() {
        }
        loadInitialHTML();
    }, [])

    useEffect(() => {
        // Get schematic details by id
    }, [props.id])

    useEffect(() => {
        // logic for who to show edit button to goes here
        setEditable(true);
    }, [])

    return (
        <Container>
            <Grid grow>
                <Grid.Col span={12}>
                    <Title>{details.title}</Title>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Group align="fill" grow gap="sm">
                        <CardsCarousel />
                        <Stack justify="space-between">
                            <Card shadow="xs" radius="md">
                                <SectionText label="Author">{details.author}</SectionText>
                                <SectionText label="Contributors">{details.contributors.map(c => c + " ")}</SectionText>
                                <SectionText label="Build Size">{details.buildSize}</SectionText>
                                <SectionText label="Submitted At">{dayjs(details.submittedAt).toString()}</SectionText>
                                <SectionText label="Last Updated">{dayjs(details.updatedAt).toString()}</SectionText>
                                <SectionText label="Follows">{details.follows}</SectionText>
                                <SectionText label="Downloads">{details.downloads}</SectionText>
                            </Card>
                            <Card p="0.75em">
                                <Group gap="xs">                                    
                                    <Title order={6}>Tags:</Title>                                        
                                    <Group gap="xs">
                                        {details.tags.map((t, i) => (
                                            <BadgeLink key={i} url={"/tags/"+ t}>{t}</BadgeLink>
                                        ))}
                                    </Group>
                                </Group>
                            </Card>
                            <Card p="0.75em">
                                <Group gap="xs">                                    
                                    <Title order={6}>Dimensions:</Title>
                                    <Badge>X: {details.dimensions.x}</Badge>
                                    <Badge>Z: {details.dimensions.z}</Badge>
                                    <Badge>Y: {details.dimensions.y}</Badge>
                                </Group>
                            </Card>
                            <Group justify="center">
                                <Button variant="gradient" aria-label="Download"><IconDownload height={16}/>Download - {formatBytes(details.fileSize)}</Button>
                                <ActionIcon size="lg" color="red" aria-label="Follow"><IconHeart/></ActionIcon>
                                <ActionIcon size="lg" color="blue" aria-label="Share"><IconShare/></ActionIcon>
                                {
                                    editable ?
                                        <Button 
                                            variant="filled" 
                                            onClick={onEditClick}
                                            color={editMode ? "green" : "yellow" }
                                            aria-label="Edit"
                                        >
                                            <IconEdit height={16}/>{editMode ? "Save" : "Edit"}
                                        </Button>
                                    :
                                    <></>
                                }
                                
                            </Group>
                        </Stack>
                    </Group>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Paper p={0}>
                        <BlockNoteView 
                            editor={editor} 
                            editable={editMode} 
                            theme={computedColorScheme === 'dark' ? darkBlueTheme : lightBlueTheme}
                            onChange={() => setBlocks(editor.document)}
                        />
                    </Paper>
                </Grid.Col>
                <Grid.Col span={12}>
                    More from {details.author}
                    <Group>
                        
                    </Group>
                </Grid.Col>
            </Grid>
        </Container>
    )
}