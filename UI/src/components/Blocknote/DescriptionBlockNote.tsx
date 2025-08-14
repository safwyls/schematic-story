import { useState } from "react";
import { BlockNoteView, darkDefaultTheme, lightDefaultTheme, Theme } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { Block } from "@blocknote/core";
import { useComputedColorScheme, Input, Card } from "@mantine/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

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

export default function DescriptionBlockNote(props: {label?: string, editMode: boolean}) {
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
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
    
    return (
        <Input.Wrapper label={props.label}>
            <Card radius="md" px={0}>
                <BlockNoteView 
                    editor={editor} 
                    editable={props.editMode} 
                    theme={computedColorScheme === 'dark' ? darkBlueTheme : lightBlueTheme}
                    onChange={() => setBlocks(editor.document)}
                />
            </Card>
        </Input.Wrapper>
    );
}