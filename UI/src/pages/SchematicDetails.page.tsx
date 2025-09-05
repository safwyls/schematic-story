import { CardsCarousel } from "@/components/Carousel/CardsCarousel";
import { Card, Container, Grid, Title, Group, Button, Stack, ActionIcon, Badge } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconDownload, IconEdit, IconHeart, IconShare } from '@tabler/icons-react';
import { labeledTextProps, LabeledText } from "@/components/Common/LabeledText";
import { BadgeLink } from "@/components/Common/BadgeLink";
import dayjs from 'dayjs';
import DescriptionBlockNote from "@/components/Blocknote/DescriptionBlockNote";
import { Details, SchematicProps } from "@/types/common";
import { useParams } from "react-router-dom";
import { Block } from "@blocknote/core";

function SectionText(props: labeledTextProps) {
    return (        
        <Card.Section inheritPadding py={5}>
            <LabeledText label={props.label}>{props.children}</LabeledText>
        </Card.Section>
    )
}

// Remove this later when we fetch the blocks from the server
const templateBlocks: Block[] = [
    {
      "id": "title-block",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 1,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Medieval Windmill Design",
          "styles": {
            "bold": true
          }
        }
      ],
      "children": []
    },
    {
      "id": "summary-block",
      "type": "paragraph",
      "props": {
        "textColor": "gray",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "A fully functional windmill design for your Vintage Story settlement. Features working sails, grain processing area, and storage loft. Perfect for mid-game food production automation.",
          "styles": {
            "italic": true
          }
        }
      ],
      "children": []
    },
    {
      "id": "divider-1",
      "type": "paragraph",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [],
      "children": []
    },
    {
      "id": "overview-heading",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 2,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Build Overview",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "overview-content",
      "type": "paragraph",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "This windmill design combines functionality with medieval aesthetics. The structure includes a ",
          "styles": {}
        },
        {
          "type": "text",
          "text": "working quern grinding mechanism",
          "styles": {
            "bold": true
          }
        },
        {
          "type": "text",
          "text": ", efficient ",
          "styles": {}
        },
        {
          "type": "text",
          "text": "grain storage system",
          "styles": {
            "bold": true
          }
        },
        {
          "type": "text",
          "text": ", and detailed exterior featuring rotating windmill sails. The design is optimized for wind efficiency and can process large quantities of grain automatically.",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "image-placeholder-1",
      "type": "image",
      "props": {
        "name": "Windmill Exterior",
        "backgroundColor": "default",
        "textAlignment": "center",
        "url": "https://wiki.vintagestory.at/images/7/7b/Windmill_Example.png",
        "caption": "Windmill exterior view - replace with your actual build screenshot",
        "showPreview": true,
        "previewWidth": 500
      },
      "content": undefined,
      "children": []
    },
    {
      "id": "difficulty-info",
      "type": "paragraph",
      "props": {
        "textColor": "blue",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "Build Complexity: Intermediate | Estimated Time: 3-4 hours | Schematic Size: 15x15x25 blocks",
          "styles": {
            "bold": true
          }
        }
      ],
      "children": []
    },
    {
      "id": "materials-heading",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 2,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Required Materials",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "stone-materials",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 3,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Stone & Foundation:",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "stone-list",
      "type": "bulletListItem",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "Cobblestone blocks (200+)",
          "styles": {}
        }
      ],
      "children": [
        {
          "id": "stone-2",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Stone bricks (150+)",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "stone-3",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Granite blocks for foundation (80+)",
              "styles": {}
            }
          ],
          "children": []
        }
      ]
    },
    {
      "id": "wood-materials",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 3,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Wood & Structure:",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "wood-list",
      "type": "bulletListItem",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "Oak logs (120+)",
          "styles": {}
        }
      ],
      "children": [
        {
          "id": "wood-2",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Oak planks (300+)",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "wood-3",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Wooden beams for windmill mechanism (50+)",
              "styles": {}
            }
          ],
          "children": []
        }
      ]
    },
    {
      "id": "mechanism-materials",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 3,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Functional Components:",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "mechanism-list",
      "type": "bulletListItem",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "Quern (1x) for grain processing",
          "styles": {}
        }
      ],
      "children": [
        {
          "id": "mech-2",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Storage vessels (4-6x)",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "mech-3",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Linen or canvas for windmill sails (20+ pieces)",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "mech-4",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Iron components for axles and gears",
              "styles": {}
            }
          ],
          "children": []
        }
      ]
    },
    {
      "id": "schematic-heading",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 2,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Schematic File & Installation",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "schematic-description",
      "type": "paragraph",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "The schematic includes the complete windmill structure with interior mechanisms. Use the ",
          "styles": {}
        },
        {
          "type": "text",
          "text": "/we import",
          "styles": {
            "backgroundColor": "#f1f3f5"
          }
        },
        {
          "type": "text",
          "text": " command to place the structure, then add functional components manually.",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "schematic-image",
      "type": "image",
      "props": {
        "backgroundColor": "default",
        "textAlignment": "center",
        "url": "https://wiki.vintagestory.at/images/thumb/1/1b/Worldeditgui.png/600px-Worldeditgui.png",
        "caption": "Schematic blueprint view - replace with your WorldEdit visualization",
        "name": "schematic-image",
        "showPreview": true,
        "previewWidth": 500
      },
      "content": undefined,
      "children": []
    },
    {
      "id": "installation-warning",
      "type": "paragraph",
      "props": {
        "textColor": "red",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "Important:",
          "styles": {
            "bold": true
          }
        },
        {
          "type": "text",
          "text": " Clear a 20x20 area before importing. The schematic includes air blocks that will replace existing terrain. Save your world before importing in case adjustments are needed.",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "installation-heading",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 2,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Installation Instructions",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "install-steps",
      "type": "numberedListItem",
      "props": {
        "start": 1,
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "Download the .schematic file and place it in your Vintage Story schematics folder",
          "styles": {}
        }
      ],
      "children": [
        {
          "id": "install-2",
          "type": "numberedListItem",
          "props": {
            "start": 2,
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Find a suitable location with good wind exposure (hills or open plains work best)",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "install-3",
          "type": "numberedListItem",
          "props": {
            "start": 3,
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Enable WorldEdit mode with /we on command",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "install-4",
          "type": "numberedListItem",
          "props": {
            "start": 4,
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Position yourself where you want the windmill base and run /we import filename",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "install-5",
          "type": "numberedListItem",
          "props": {
            "start": 5,
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Manually place the quern and connect the windmill mechanism",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "install-6",
          "type": "numberedListItem",
          "props": {
            "start": 6,
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Add storage vessels and test the grinding mechanism",
              "styles": {}
            }
          ],
          "children": []
        }
      ]
    },
    {
      "id": "interior-image",
      "type": "image",
      "props": {
        "backgroundColor": "default",
        "textAlignment": "center",
        "url": "https://wiki.vintagestory.at/images/1/15/Example_Mill.png",
        "caption": "Interior mechanism layout - add screenshots of each floor",
        "name": "interior-image",
        "showPreview": true,
        "previewWidth": 500
      },
      "content": undefined,
      "children": []
    },
    {
      "id": "features-heading",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 2,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Build Features & Layout",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "tips-heading",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 2,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Building Tips & Customization",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "tips-info",
      "type": "paragraph",
      "props": {
        "textColor": "green",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "Customization Ideas:",
          "styles": {
            "bold": true
          }
        },
        {
          "type": "text",
          "text": " Add decorative flower boxes, expand storage capacity, or modify the exterior with different wood types for regional variations. Consider building a miller's cottage nearby for full immersion.",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "tips-list",
      "type": "bulletListItem",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "Position the windmill on elevated terrain for maximum wind efficiency",
          "styles": {}
        }
      ],
      "children": [
        {
          "id": "tip-2",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Keep the surrounding area clear of tall trees or buildings that might block wind",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "tip-3",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "The stone foundation prevents moisture damage and adds structural stability",
              "styles": {}
            }
          ],
          "children": []
        },
        {
          "id": "tip-4",
          "type": "bulletListItem",
          "props": {
            "textColor": "default",
            "backgroundColor": "default",
            "textAlignment": "left"
          },
          "content": [
            {
              "type": "text",
              "text": "Consider building multiple windmills for large-scale farming operations",
              "styles": {}
            }
          ],
          "children": []
        }
      ]
    },
    {
      "id": "conclusion-heading",
      "type": "heading",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left",
        "level": 2,
        "isToggleable": false
      },
      "content": [
        {
          "type": "text",
          "text": "Final Notes",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "conclusion-text",
      "type": "paragraph",
      "props": {
        "textColor": "default",
        "backgroundColor": "default",
        "textAlignment": "left"
      },
      "content": [
        {
          "type": "text",
          "text": "This windmill design balances historical authenticity with game functionality. The structure provides an efficient grain processing solution while adding character to your settlement. Experiment with different wood combinations and decorative elements to match your build style and regional aesthetic preferences.",
          "styles": {}
        }
      ],
      "children": []
    },
    {
      "id": "share-note",
      "type": "paragraph",
      "props": {
        "textColor": "purple",
        "backgroundColor": "default",
        "textAlignment": "center"
      },
      "content": [
        {
          "type": "text",
          "text": "Share Your Build!",
          "styles": {
            "bold": true
          }
        },
        {
          "type": "text",
          "text": " Post screenshots of your completed windmill and any modifications you made. Include the world seed and coordinates if you built it in a particularly scenic location.",
          "styles": {}
        }
      ],
      "children": []
    }
]

export function SchematicDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editable, setEditable] = useState<boolean>(false);
    const [descriptionJson, setDescriptionJson] = useState<any>();
    const [descriptionBlocks, setDescriptionBlocks] = useState<Block[]>(templateBlocks);
    
    // Temp data until we implement fetching
    const [details, setDetails] = useState<Details>({
        title: "Title goes here",
        author: "Jonas Falx",
        contributors: ["Shintharo12", "Freakyuser396"],
        buildSize: 'Medium',
        submittedAt: '2019-01-25',
        updatedAt: '2019-01-25',
        follows: 193580,
        downloads: 12578,
        description: [],
        tags: ["vanilla", "ruin"],
        images: [{
            image: "https://wiki.vintagestory.at/images/7/7b/Windmill_Example.png"
        },
        {
            image: "https://wiki.vintagestory.at/images/1/15/Example_Mill.png"
        }],
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

    const handleDescriptionChange = (blocks: Block[]) => {
        setDescriptionJson(JSON.stringify(blocks));
    }

    useEffect(() => {
        async function loadInitialHTML() {
        }
        loadInitialHTML();
    }, [])

    useEffect(() => {
        // Get schematic details by id
    }, [id])

    useEffect(() => {
        // logic for who to show edit button to goes here
        setEditable(true);
    }, [])

    return (
        <Container>
            <Grid grow>
                <Grid.Col span={12} py="xl">
                    <Title>{details.title}</Title>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Group align="fill" grow gap="sm">
                        <CardsCarousel cards={details.images} />
                        <Stack justify="space-between">
                            <Card shadow="xs" radius="md">
                                <SectionText label="Author">{details.author}</SectionText>
                                <SectionText label="Contributors">
                                    <Group gap="xs">
                                        {details.contributors.map((user: string) => {
                                            return (
                                                <BadgeLink 
                                                    color="blue"
                                                    url={"/user/" + user} 
                                                    key={user}
                                                >
                                                    {user}
                                                </BadgeLink>
                                            )
                                        })}
                                    </Group>
                                </SectionText>
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
                                        {details.tags.map((t) => (
                                            <BadgeLink key={t} url={"/tags/"+ t}>{t}</BadgeLink>
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
                                    editable &&
                                        <Button 
                                            variant="filled" 
                                            onClick={onEditClick}
                                            color={editMode ? "green" : "yellow" }
                                            aria-label="Edit"
                                        >
                                            <IconEdit height={16}/>{editMode ? "Save" : "Edit"}
                                        </Button>
                                }
                            </Group>
                        </Stack>
                    </Group>
                </Grid.Col>
                <Grid.Col span={12}>
                    <DescriptionBlockNote 
                        editMode={editMode} 
                        content={descriptionBlocks}
                        onContentChange={handleDescriptionChange} />
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