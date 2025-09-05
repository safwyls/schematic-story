import { useEffect, useState } from "react";
import DescriptionBlockNote from "@/components/Blocknote/DescriptionBlockNote";
import { ImageUpload, UploadedImage } from "@/components/ImageUpload/ImageUpload";
import { Badge, Button, Card, Center, Container, Divider, FileInput, Grid, GridCol, Group, HoverCard, Stack, Stepper, TagsInput, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { Vec3d } from "@/types/common";
import { Block } from "@blocknote/core";
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/api/client';
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export function UploadPage() {
    const { idToken } = useAuth();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState<string>('');
    const [tagList, setTagList] = useState<string[]>([]);
    const [userList, setUserList] = useState<string[]>([]);
    const [active, setActive] = useState(0);

    // Schematic details
    const [gameVersion, setGameVersion] = useState<string>("0.0.0");
    const [uniqueBlockCount, setUniqueBlockCount] = useState<number>(0);
    const [uniqueItemCount, setUniqueItemCount] = useState<number>(0);
    const [blockCount, setBlockCount] = useState<number>(0);
    const [decorativeBlockCount, setDecorativeBlockCount] = useState<number>(0);
    const [blockEntityCount, setBlockEntityCount] = useState<number>(0);
    const [entityCount, setEntityCount] = useState<number>(0);
    const [dimensions, setDimensions] = useState<Vec3d>({x: 0, y: 0, z: 0});
    
    const [schematicJson, setSchematicJson] = useState<any>();
    const [descriptionJson, setDescriptionJson] = useState<any>();
    const [descriptionBlocks, setDescriptionBlocks] = useState<Block[]>(templateBlocks);

    const [uploadUrl, setUploadUrl] = useState<string>('');
    const [s3key, setS3key] = useState<string>('');
    const [expiresIn, setExpiresIn] = useState<number>(0);
    const [coverImageUrl, setCoverImageUrl] = useState<string>('');

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            title: 'My Schematic',
            description: 'Schematic description',
        },
        validate: {
        },
    });

    // Mutation for requesting upload URL
    const requestUploadUrlMutation = useMutation({
        mutationFn: async (requestBody: any) => {
            const response = await apiClient.post('/schematics/upload-url', requestBody);      
            return response;
        }
    });

    // Mutation for creating a schematic in the database
    const uploadSchematicMutation = useMutation({
      mutationFn: async (requestBody: any) => {
        const response = await apiClient.post('/schematics', requestBody);      
        return response;
      }
    });

    const onImageUploadSuccess = (_images: UploadedImage[]) => {
        setActive(3);
        setCoverImageUrl(_images[0].url);
    }

    // Handle form submission
    const handleSubmit = () => {
        console.log(descriptionJson)
        setActive(5);

        createSchematic();
    }

    const createSchematic = () => {
        const requestBody = {
            title: title,
            description: descriptionJson,
            tags: tagList,
            users: userList,
            
            dimensions: {
                "width": dimensions.x,
                "height": dimensions.y,
                "length": dimensions.z
            },

            fileUrl: uploadUrl,
            coverImageUrl: coverImageUrl,
            blockCount: blockCount,
        };

        uploadSchematicMutation.mutate(requestBody);
    }

    const handleDescriptionChange = (blocks: Block[]) => {        
        setDescriptionJson(JSON.stringify(blocks));
        setActive(4);
    }

    // Handle file upload
    const handleFileUpload = async (file: any) => {
        if (file == null) {
            setSchematicJson(null);
            return;
        }
        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = e => {
            if (typeof(e.target?.result) == "string") {
                let jsonObj = JSON.parse(e.target.result);                
                setSchematicJson(jsonObj);
            }
        };

        const { uploadUrl, s3key, expiresIn } = await requestUploadUrlMutation.mutateAsync({
            "filename": file.name,
            "contentType": "application/json"
        });

        setUploadUrl(uploadUrl);
        setS3key(s3key);
        setExpiresIn(expiresIn);
    }

    // Parse schematic details and assign to state
    useEffect(() => {
        if (schematicJson == null) {
            setDimensions({
                x: 0,
                y: 0,
                z: 0
            })
            setGameVersion("0.0.0");
            setUniqueBlockCount(0);
            setUniqueItemCount(0);
            setBlockCount(0);
            setDecorativeBlockCount(0);
            setBlockEntityCount(0);
            setEntityCount(0);
        } else {
            setDimensions({
                x: schematicJson["SizeX"] as number,
                y: schematicJson["SizeY"] as number,
                z: schematicJson["SizeZ"] as number
            })
            setGameVersion(schematicJson["GameVersion"] as string);
            setBlockCount(schematicJson["BlockIds"].length || 0);
            setUniqueBlockCount(Object.keys(schematicJson["BlockCodes"]).length || 0);
            setUniqueItemCount(Object.keys(schematicJson["ItemCodes"]).length || 0);
            setDecorativeBlockCount(schematicJson["DecorIds"].length || 0);
            setBlockEntityCount(Object.keys(schematicJson["BlockEntities"]).length || 0);
            setEntityCount(Object.keys(schematicJson["Entities"]).length || 0);
            
            // Move stepper forward
            setActive(2);
        }
    }, [schematicJson])

    // Temp data for tags
    useEffect(() => {
        setUserList([
            'test',
            'test2'            
        ]);

        setTagList([
            "vanilla",
            "ruin",
            "modded",
            "castle",
            "underground",
            "mine"
        ]);
        
    }, [])

    const statGroup = (label: string, values: string[] | number[], description: string) => {
        return (
            <Group gap="xs">
                <HoverCard width={280} shadow="md">
                    <HoverCard.Target>
                        <Group gap="xs">
                            <Title order={6}>{label}:</Title>
                            {values.map((value, index) => (
                                <Badge key={index}>{typeof value === 'number' ? value.toLocaleString() : value}</Badge>
                            ))}
                        </Group>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                        <Text size="sm">
                            {description}
                        </Text>
                    </HoverCard.Dropdown>
                </HoverCard>
            </Group>
        )
    }

    return (
        <>
            <Stepper visibleFrom="md" active={active} onStepClick={setActive} orientation="vertical" p="md"
                style={{
                    position: 'fixed',
                    top: 80,
                    left: 40,
                    width: '100%',
                    maxWidth: '400px'
                }}
            >
                <Stepper.Step label="Details" description="Set title and details" />
                <Stepper.Step label="Schematic" description="Upload schematic json" />
                <Stepper.Step label="Images" description="Upload images" />
                <Stepper.Step label="Description" description="Add a description" />
                <Stepper.Step label="Submit" description="Submit your schematic" />
            </Stepper>
            <Container>
                <Grid grow>
                    <GridCol span={12} py="xl">
                        <Center>
                            <Title>
                                Upload a new schematic
                            </Title>
                        </Center>
                    </GridCol>
                    <GridCol span={12}>               
                        <form onSubmit={form.onSubmit(handleSubmit)}>       
                            <Card>
                                <Group mih={80} pb="md" justify="space-between">
                                    <Title order={1}>{title}</Title>
                                    <Button type="submit">
                                        <IconDeviceFloppy /> Submit
                                    </Button>
                                </Group>
                                <Divider pb="md"/>
                                <Stack>
                                    <TextInput label="Title" required value={title} onChange={(e) => {
                                        setTitle(e.target.value);
                                        setActive(1);
                                    }}/>
                                    <TagsInput data={userList} label="Contributors"/>
                                    <TagsInput data={tagList} label="Tags" description="press enter to add a tag"/>     
                                    
                                    <FileInput
                                        required
                                        clearable
                                        accept=".json, .zip"
                                        label="Schematic file"
                                        description="(.json, .zip)"
                                        onChange={handleFileUpload}
                                    />
                                        
                                    <Stack align="center">
                                        <Group gap="md">
                                            {statGroup("Dimensions", [`x: ${dimensions.x}`, `y: ${dimensions.y}`, `z: ${dimensions.z}`], "The dimensions of the schematic (Y is height)")}
                                            {statGroup("Game Version", [gameVersion], "The game version this schematic was created in")}
                                        </Group>
                                        <Group gap="md">
                                            {statGroup("Blocks", [blockCount.toLocaleString()], "The number of blocks in the schematic")}
                                            {statGroup("Block Entities", [blockEntityCount.toLocaleString()], "The number of block entities in the schematic")}
                                            {statGroup("Entities", [entityCount.toLocaleString()], "The number of entities in the schematic")}    
                                        </Group>                                    
                                    </Stack>

                                    <ImageUpload maxImages={10} onUploadSuccess={onImageUploadSuccess} onUploadStarted={() => {}} onUploadProgress={() => {}} stagingMode={true}/>
                                    
                                    <Center>
                                        <Group gap="xs">
                                            <Button onClick={() => {setDescriptionBlocks(templateBlocks)}}>Restore Template</Button>
                                            <Button onClick={() => {setDescriptionBlocks([])}}>Clear Description</Button>
                                        </Group>
                                    </Center>
                                    <DescriptionBlockNote 
                                        label="Description" 
                                        editMode={true} 
                                        content={descriptionBlocks}
                                        onContentChange={handleDescriptionChange} />
                                </Stack>
                            </Card>
                        </form>
                    </GridCol>
                </Grid>
            </Container>
        </>
    );
}