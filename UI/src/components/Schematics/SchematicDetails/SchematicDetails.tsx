import { CardsCarousel } from "@/components/Carousel/CardsCarousel";
import { Card, Container, Grid, Title, Text, Group, Button, Stack, ActionIcon, Badge, useMantineTheme, useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconDownload, IconEdit, IconHeart, IconShare } from '@tabler/icons-react';
import { labeledTextProps, LabeledText } from "../../Common/LabeledText";
import { BadgeLink } from "@/components/Common/BadgeLink";
import dayjs from 'dayjs';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

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
    description: string,
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
    const editor = useCreateBlockNote();
    const [details, setDetails] = useState<Details>({
        title: "Title goes here",
        author: "Jonas Falx",
        contributors: [],
        buildSize: 'Medium',
        submittedAt: '2019-01-25',
        updatedAt: '2019-01-25',
        follows: 193580,
        downloads: 12578,
        description: `<div style="clear:both;">                                <br>                            </div>                            <h3 style="text-align: center;">BetterRuins Team</h3>                            <p>                                <img style="border-style: none;" src="https://i.imgur.com/v05gpeS.png" alt="image" width="100%" height="auto"/>                            </p>                            <h3>Description</h3>                            <h4>Structures</h4>                            <p>                                BetterRuins add <strong data-start="247" data-end="274">over 600 new structures</strong>                                to your survival world, ranging from massive ruins to small details, scattered randomly across the world. Discover graves, translocators (above and below ground), villages, climate-specific ruins, monoliths, castles, waystones, meteor impact sites, underground dungeons, and much more.                            </p>                            <h4>Story Locations</h4>                            <p>                                In addition to the structures, BetterRuins introduces <strong data-start="674" data-end="702">7 unique story locations</strong>                                . Players can find maps to these sites through loot, trader dialogue <em>(check your local luxuries trader)</em>                                , or trader shops. Those story locations features smaller, interconnected quest lines that guide you to related structures, similar to how vanilla handles its exploration content. These storylines enhance your exploration experience and offer challenges with <strong data-start="1027" data-end="1045">rewarding loot</strong>                                .                            </p>                            <h4>Blueprints</h4>                            <p>                                Ever wished you could craft blocks and items that are otherwise unobtainable or recipes that are too grindy? BetterRuins brings <strong data-start="1197" data-end="1214">22 blueprints</strong>                                , scattered throughout the world, that allow you to craft these rare blocks and items - or increase your crafting efficiency for certain recipes.                            </p>                            <h4>Lore</h4>                            <p>Our team of talented writers has crafted amazing lore for the structures, helping players uncover the mysteries of the world &rsquo;s past. A lot of ruins hold stories waiting to be discovered. Also new trader dialogue for luxuries trader yay.</p>                            <h4>Loot</h4>                            <p>                                The loot system is <strong data-start="1593" data-end="1651">enriched with valuable, unobtainable, and useful items</strong>                                , making mid- and end-game exploration even more rewarding. Also adds loot of other mods to the lootpools.<br/>                                <br/>                                Plus, many of these features are fully <strong>configurable</strong>                                to match your preferred playstyle.                            </p>                            <h3>Latest Content Update</h3>                            <p>                                <iframe src="//www.youtube.com/embed/wBP0GgZpnVU" width="600" height="352" allowfullscreen="allowfullscreen"></iframe>                            </p>                            <h3>Notes</h3>                            <ul>                                <li>                                    Compatible with all known <strong>landform</strong>                                    mods:&nbsp;                                    <span style="color: #000000;">                                        <span style="color: #2880b9;">                                            <a style="color: #2880b9;" href="https://mods.vintagestory.at/fieldsandplateaus">FieldsAndPlateaus</a>                                        </span>                                        ,                                         <span style="color: #2880b9;">                                            <a style="color: #2880b9;" href="https://mods.vintagestory.at/plainsandvalleys">PlainsAndValleys</a>                                        </span>                                        ,                                         <span style="color: #2880b9;">                                            <a style="color: #2880b9;" href="https://mods.vintagestory.at/terraprety">TerraPrety</a>                                        </span>                                        ,                                         <span style="color: #2880b9;">                                            <a style="color: #2880b9;" href="https://mods.vintagestory.at/vanillaplus">Vanilla_PlusWorldGen</a>                                        </span>                                        ,                                         <span style="color: #2880b9;">                                            <a style="color: #2880b9;" href="https://mods.vintagestory.at/worldgenfix">Worldgenfix</a>                                        </span>                                        ,                                         <span style="color: #2880b9;">                                            <a style="color: #2880b9;" href="https://mods.vintagestory.at/worldgenfixremix">Worldgenfixremix</a>                                        </span>                                        ,                                         <span style="color: #2880b9;">                                            <a style="color: #2880b9;" href="https://mods.vintagestory.at/conquestlandformoverhaul">Conquest Landform Overhaul</a>                                        </span>                                    </span>                                </li>                                <li>                                    Be aware <strong>landform</strong>                                    mods or highly modified worldgen settings will result in a different <strong>experience</strong>                                    ; it's recommended to adjust the config accordingly                                </li>                                <li>                                    Partially incompatible with                                     <span style="color: #2880b9;">                                        <a style="color: #2880b9;" href="https://mods.vintagestory.at/rivers">Rivers</a>                                    </span>                                    mod. Use at own risk and be aware that future updates of vanilla or betterruins might break worldgen for your existing world. New worlds will be fine but test new terrain gen when updating vanilla or betterruins alongside                                     <span style="color: #2880b9;">                                        <a style="color: #2880b9;" href="https://mods.vintagestory.at/rivers">Rivers</a>                                    </span>                                    mod.                                </li>                            </ul>                            <h3>FAQ</h3>                            <p>                                <strong>                                    Q: What will happen if I remove the mod?<br/>                                </strong>                                A: All the structures that have already been generated will still be present without any ? blocks. The only issue you might encounter are missing lore entries if you have acquired BetterRuins lore and the blueprint items might be gone or be ? items.                            </p>                            <p>                                <strong>                                    Q: Can I add this mod after world creation?<br/>                                </strong>                                A: Yes, but structures from this mod will only generate in chunks that are being generated with this mod active.                            </p>                            <p>                                <strong>                                    Q: Can I update this mod after world creation?<br/>                                </strong>                                A: Yes, but new or adjusted structures from this mod will only generate in chunks that are being generated with the new version active. (Warning if you are running the og rivers mod updating is not always secure. Check top of every changelog for more info.)                            </p>                            <p>                                <strong>Q: Why are there spawning that many structures with this mod equipped?</strong>                                <br/>A: Structures are more likely to spawn on flat and sea level terrain, so if you use a lower world height or use world gen mods like Plains and Valleys you might need to reduce the spawn chances of structures bcs they will spawn more often.                            </p>                            <p>                                <strong>Q: How do I know what I can do with the blueprints?</strong>                                <br/>A: Hover over the item in your inventory and press "H" to open the recipe browser for that item.                            </p>                            <p>                                <strong>Q: My treasure map said no location on map found. Did I waste my rusty gears?</strong>                                <br/>A: Yes, this is a rare bug where it didn't find the structure type nearby and results in an empty treasure map.                            </p>                            <p>                                <strong>Q: Do mobs respawn in structures and if yes how often?</strong>                                <br/>A: Yes, they can respawn from 3 to 8 times depending on the spawners (which are invisible and will self deconstruct after spawning all mobs)                            </p>                            <p>                                <strong>Q: Will vanilla ruins be present if I install this mod?</strong>                                <br/>A: Yes, BetterRuins and vanilla ruins will spawn alongside each other.                            </p>                            <p>                                <strong>Q: Can I configure the mod on my server? The config UI seems to be client-side only.</strong>                                &nbsp;<br/>                                A: [This is related to Mods ConfigLib and ImGui] Yes, server configs need to be changed directly in the server's <code>config</code>                                folder. You'll find a <code>.yaml</code>                                file for BetterRuins there. You can edit this file with a text editor to adjust server-side settings. Alternatively, you can adjust the config in a single-player world using the UI and then copy the modified <code>.yaml</code>                                file to your server's config folder.                            </p>                            <p>                                <strong>Q: Why do some chests in ruins appear to be unopenable and empty?</strong>                                <br/>A: If a chest, especially the ruined trunk variants, cannot be opened in a BetterRuins structure, it is intended to be empty. This is not a bug; it's a way to indicate empty containers within the ruins.                            </p>                            <p>                                <strong>Q: How deep are the hidden passages marked on trader maps?</strong>                                <br data-start="1567" data-end="1570"/>A: They can be quite deep. If there &rsquo;s no teleporter inside, try digging further it should be right below the marking on the map.                            </p>                            <h3>Configuration (if you want to config this mod you need these mods) (without there is no configfiles!)</h3>                            <div class="mods" style="box-sizing: border-box; color: #333; column-gap: 16px; display: grid; grid-template-columns: repeat(5, 320px); grid-auto-rows: auto; justify-content: start; line-height: 19.2px; margin: 0; padding: 0; text-rendering: optimizespeed; overflow-x: auto; white-space: nowrap;">                                <div class="mod published" style="aspect-ratio: 1 / 1; background-color: #fff; border: 1px solid #fff; border-radius: 4px; box-shadow: #aaa 1px 1px 4px 0px; box-sizing: border-box; color: #333; margin: 0; padding: 0; overflow: hidden; position: relative; text-rendering: optimizespeed;">                                    <a style="box-sizing: border-box; color: #333; text-decoration: none;" href="https://mods.vintagestory.at/configlib">                                        <img style="border-top-left-radius: 4px; border-top-right-radius: 4px; box-sizing: border-box; width: 318px; display: block; height: calc(2/3 * 100%); object-fit: contain;" src="https://moddbcdn.vintagestory.at/moddb_25fa98f09cd30c1703c520e45a7c201a.png" alt="image"/>                                    </a>                                    <div class="moddesc" style="background-color: rgba(255, 255, 255, 0.8); box-sizing: border-box; color: #333; margin: 0; padding: 4px; position: absolute; bottom: 0; left: 0; width: 100%; min-height: 108px; display: flex; flex-direction: column; align-items: flex-start; text-rendering: optimizespeed; word-wrap: break-word; white-space: normal;">                                        <h4 style="margin: 0; padding: 0;">Config lib</h4>                                        <p style="margin: 0; padding: 0;">Config library for content mods</p>                                    </div>                                </div>                                <div class="mod published" style="aspect-ratio: 1 / 1; background-color: #fff; border: 1px solid #fff; border-radius: 4px; box-shadow: #aaa 1px 1px 4px 0px; box-sizing: border-box; color: #333; margin: 0; padding: 0; overflow: hidden; position: relative; text-rendering: optimizespeed;">                                    <a style="box-sizing: border-box; color: #333; text-decoration: none;" href="https://mods.vintagestory.at/imgui">                                        <img style="border-top-left-radius: 4px; border-top-right-radius: 4px; box-sizing: border-box; width: 318px; display: block; height: calc(2/3 * 100%); object-fit: contain;" src="https://moddbcdn.vintagestory.at/moddb_d63d1a26c89ea1c0701f97ffc0debb84.png" alt="image"/>                                    </a>                                    <div class="moddesc" style="background-color: rgba(255, 255, 255, 0.8); box-sizing: border-box; color: #333; margin: 0; padding: 4px; position: absolute; bottom: 0; left: 0; width: 100%; min-height: 108px; display: flex; flex-direction: column; align-items: flex-start; text-rendering: optimizespeed; word-wrap: break-word; white-space: normal;">                                        <h4 style="margin: 0; padding: 0;">ImGui</h4>                                        <p style="margin: 0; padding: 0;">Wrapper for GUI library</p>                                    </div>                                </div>                            </div>                            <div class="spoiler">                                <div class="spoiler-toggle" spellcheck="false" data-gramm="false">Configfile</div>                                <div class="spoiler-text" spellcheck="false" data-lt-tmp-id="lt-224674" data-gramm="false">                                    <img src="https://i.imgur.com/fxNZT7S.png" alt="" width="838" height="4938"/>                                </div>                            </div>                            <h3>Recommended mods</h3>                            <div class="mods" style="box-sizing: border-box; color: #333; column-gap: 16px; display: grid; grid-template-columns: repeat(5, 320px); grid-auto-rows: auto; justify-content: start; line-height: 19.2px; margin: 0; padding: 0; text-rendering: optimizespeed; overflow-x: auto; white-space: nowrap;">                                <div class="mod published" style="aspect-ratio: 1 / 1; background-color: #fff; border: 1px solid #fff; border-radius: 4px; box-shadow: #aaa 1px 1px 4px 0px; box-sizing: border-box; color: #333; margin: 0; padding: 0; overflow: hidden; position: relative; text-rendering: optimizespeed;">                                    <a style="box-sizing: border-box; color: #333; text-decoration: none;" href="https://mods.vintagestory.at/bettertraders">                                        <img style="border-top-left-radius: 4px; border-top-right-radius: 4px; box-sizing: border-box; width: 318px; display: block;" src="https://moddbcdn.vintagestory.at/modicon1_7248ee872ba9ef4a3956e91dde60e8ee.png" alt="image"/>                                    </a>                                    <div class="moddesc" style="background-color: rgba(255, 255, 255, 0.8); box-sizing: border-box; color: #333; margin: 0; padding: 4px; position: absolute; bottom: 0; left: 0; width: 100%; min-height: 108px; display: flex; flex-direction: column; align-items: flex-start; text-rendering: optimizespeed; word-wrap: break-word; white-space: normal;">                                        <h4 style="margin: 0; padding: 0;">BetterTraders</h4>                                        <p style="margin: 0; padding: 0;">Reworks vanilla trader structures and adds new ones.</p>                                    </div>                                </div>                                <div class="mod published" style="aspect-ratio: 1 / 1; background-color: #fff; border: 1px solid #fff; border-radius: 4px; box-shadow: #aaa 1px 1px 4px 0px; box-sizing: border-box; color: #333; margin: 0; padding: 0; overflow: hidden; position: relative; text-rendering: optimizespeed;">                                    <a style="box-sizing: border-box; color: #333; text-decoration: none;" href="https://mods.vintagestory.at/thedungeon">                                        <img style="border-top-left-radius: 4px; border-top-right-radius: 4px; box-sizing: border-box; width: 318px; display: block;" src="https://moddbcdn.vintagestory.at/modicon_987822d622987c1884e2696e2fdbd3a2.png" alt="image"/>                                    </a>                                    <div class="moddesc" style="background-color: rgba(255, 255, 255, 0.8); box-sizing: border-box; color: #333; margin: 0; padding: 4px; position: absolute; bottom: 0; left: 0; width: 100%; min-height: 108px; display: flex; flex-direction: column; align-items: flex-start; text-rendering: optimizespeed; word-wrap: break-word; white-space: normal;">                                        <h4 style="margin: 0; padding: 0;">Ancient Dungeons (Th3Dungeon)</h4>                                        <p style="margin: 0; padding: 0;">Adds procedural generated dungeons to the underground of Vintage Story</p>                                    </div>                                </div>                                <div class="mod published" style="aspect-ratio: 1 / 1; background-color: #fff; border: 1px solid #fff; border-radius: 4px; box-shadow: #aaa 1px 1px 4px 0px; box-sizing: border-box; color: #333; margin: 0; padding: 0; overflow: hidden; position: relative; text-rendering: optimizespeed;">                                    <a style="box-sizing: border-box; color: #333; text-decoration: none;" href="https://mods.vintagestory.at/rlmoonsun">                                        <img style="border-top-left-radius: 4px; border-top-right-radius: 4px; box-sizing: border-box; width: 318px; display: block;" src="https://moddbcdn.vintagestory.at/modicon1_806ca25ce407b67c9f1128d4ac74ada8.png" alt="image"/>                                    </a>                                    <div class="moddesc" style="background-color: rgba(255, 255, 255, 0.8); box-sizing: border-box; color: #333; margin: 0; padding: 4px; position: absolute; bottom: 0; left: 0; width: 100%; min-height: 108px; display: flex; flex-direction: column; align-items: flex-start; text-rendering: optimizespeed; word-wrap: break-word; white-space: normal;">                                        <h4 style="margin: 0; padding: 0;">RLMoonSun</h4>                                        <p style="margin: 0; padding: 0;">Changes the texture from the sun and moon to a more realistic one.</p>                                        <p style="margin: 0; padding: 0;">&nbsp;</p>                                    </div>                                </div>                                <div class="mod published" style="aspect-ratio: 1 / 1; background-color: #fff; border: 1px solid #fff; border-radius: 4px; box-shadow: #aaa 1px 1px 4px 0px; box-sizing: border-box; color: #333; margin: 0; padding: 0; overflow: hidden; position: relative; text-rendering: optimizespeed;">                                    <a style="box-sizing: border-box; color: #333; text-decoration: none;" href="https://mods.vintagestory.at/bettertranslations">                                        <img style="border-top-left-radius: 4px; border-top-right-radius: 4px; box-sizing: border-box; width: 318px; display: block;" src="https://moddbcdn.vintagestory.at/modicon1_cf1fa1f1f0d94fd06bf4b11be0706c46.png" alt="image"/>                                    </a>                                    <div class="moddesc" style="background-color: rgba(255, 255, 255, 0.8); box-sizing: border-box; color: #333; margin: 0; padding: 4px; position: absolute; bottom: 0; left: 0; width: 100%; min-height: 108px; display: flex; flex-direction: column; align-items: flex-start; text-rendering: optimizespeed; word-wrap: break-word; white-space: normal;">                                        <h4 style="margin: 0; padding: 0;">BetterTranslations</h4>                                        <p style="margin: 0; padding: 0;">Translations from the Community for all kinds of mods. All credits to the translators!</p>                                        <p style="margin: 0; padding: 0;">&nbsp;</p>                                    </div>                                </div>                            </div>                            <p>&nbsp;</p>                            <h3>Useful Videos</h3>                            <p>                                <a href="https://www.youtube.com/watch?v=Ioe_u_DmbDQ" target="_blank" rel="noopener">How to configure BetterRuins with ConfigLib</a>                            </p>                            <p>                                <a href="https://www.youtube.com/watch?v=T5ijHVoIUbA" target="_blank" rel="noopener">How to manually spawn structures</a>                                Be aware currently buggy bcs of vanilla issues.                            </p>                            <p>                                <a href="https://www.youtube.com/watch?v=_LwwLJAwImw" target="_blank" rel="noopener">How to spawn and move story structures</a>                            </p>                            <h3 style="text-align: left;">Translation</h3>                            <p style="text-align: left;">                                Thanks to the following people for translating:<br/>                                <br/>                            </p>                            <div>                                <div>Translators: Xandoria, macoto_hino, Yanazake, Knave2000, Grigoriewich, Jefferzon, Srloboalbino, Vilderos, Adrian Misiak, hellcatcher228, Richard Rokyta, Japuk, RomainOdeval, Justice_shrimp, FoxMage3243, correobasuratx, Kiroyoku Kiara</div>                                <div>&nbsp;</div>                            </div>                            <p style="text-align: left;">                                Huge thank you to all the translation contributors! Thanks for making this mod more accessible to other languages, it's hard work!&nbsp;<br/>                                If you want to help out as well, we offer this <a href="https://crowdin.com/translate/vintage-story-mods/329" target="_blank" rel="noopener">free web editor</a>                                . Thanks!                            </p>                            <h3>                                Contributors                                <strong>                                    <br/>                                </strong>                            </h3>                            <p>Everyone that contributed to this mod is listed on the top of this page! Without this awesome team this mod wouldn't exist like it does atm. Huge thanks to everyone helping and investing time in this project!</p>                            <h3>Keywords</h3>                            <p>betterruins, better ruins, Ruins mod, Structures mod, Buildings mod, Exploration mod, Worldgen mod, World generation mod, Terrain mod, Environment mod, Adventure mod, Loot mod, Treasure mod, More ruins, Improved ruins, Enhanced ruins, Varied ruins, Different ruins, Unique ruins, Interesting ruins, Random ruins, Procedural ruins, Natural ruins, Realistic ruins, Immersive ruins, Lore structures, Historical buildings, Ancient ruins, Old structures, Abandoned places, Overworld structures, Underground ruins, Remains, Relics, Sites, Discovery mod, Procedural generation structures, Random world structures, Exploration and discovery mod, World expansion mod, worldgen mods, exploration mods, building mods, adventure mods, lore mods</p>                            <p>&nbsp;</p>                            <p>&nbsp;</p>                            <div style="clear:both;"></div>`,
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
            const blocks = await editor.tryParseHTMLToBlocks(details.description);
            editor.replaceBlocks(editor.document, blocks);
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
                    <BlockNoteView editor={editor} editable={editMode} theme={computedColorScheme === 'dark' ? 'dark' : 'light'}/>
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