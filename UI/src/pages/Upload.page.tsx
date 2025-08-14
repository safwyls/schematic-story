import DescriptionBlockNote from "@/components/Blocknote/DescriptionBlockNote";
import { User, Vec3d } from "@/types/common";
import { BlockNoteView } from "@blocknote/mantine";
import { Badge, Button, Card, Container, FileInput, Grid, GridCol, Group, Paper, Stack, TagsInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect, useState } from "react";


export function UploadPage() {
    const [tagList, setTagList] = useState<string[]>([]);
    const [userList, setUserList] = useState<string[]>([]);
    const [dimensions, setDimensions] = useState<Vec3d>({x: 0, y: 0, z: 0});
    const [json, setJson] = useState<any>();
    
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            title: 'My Schematic',
            description: 'Schematic description',
        },
        validate: {
        },
    });

    const handleSubmit = () => {
    }

    const handleFileUpload = (file: any) => {
        if (file == null) {
            setJson(null);
            return;
        }
        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = e => {
            if (typeof(e.target?.result) == "string") {
                let jsonObj = JSON.parse(e.target.result);                
                setJson(jsonObj);
            }
        };
    }

    useEffect(() => {
        if (json == null) {
            setDimensions({
                x: 0,
                y: 0,
                z: 0
            })
        } else {
            setDimensions({
                x: json["SizeX"] as number,
                y: json["SizeY"] as number,
                z: json["SizeZ"] as number
            })
        }
    }, [json])

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

    return (
        <Container>
            <Grid grow>
                <GridCol span={12}>
                    <Title>
                        Upload a new schematic
                    </Title>
                </GridCol>
                <GridCol span={12}>        
                        <form onSubmit={form.onSubmit(handleSubmit)}>       
                            <Card>
                                <Group justify="flex-end">
                                    <Button type="submit">
                                        <IconDeviceFloppy /> Submit
                                    </Button>
                                </Group>
                                <Stack>
                                    <FileInput
                                        clearable
                                        accept=".json, .zip"
                                        label="Schematic file"
                                        description="(.json, .zip)"
                                        onChange={handleFileUpload}
                                    />
                                    <TextInput label="Title"/>
                                    <TagsInput data={userList} label="Contributors"/>
                                    <TagsInput data={tagList} label="Tags" description="press enter to add a tag"/>
                                    <Group gap="xs">                                    
                                        <Title order={6}>Dimensions:</Title>
                                        <Badge>X: {dimensions.x}</Badge>
                                        <Badge>Z: {dimensions.z}</Badge>
                                        <Badge>Y: {dimensions.y}</Badge>
                                    </Group>
                                    <DescriptionBlockNote label="Description" editMode={true} />
                                </Stack>
                            </Card>
                        </form>
                </GridCol>
            </Grid>
        </Container>
    );
}