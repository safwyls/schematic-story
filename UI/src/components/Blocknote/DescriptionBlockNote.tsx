import { useState, useEffect } from "react";
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

export default function DescriptionBlockNote(props: {
    label?: string, 
    editMode: boolean,    
    content: Block[],
    onContentChange: (blocks: Block[]) => void
}) {
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const editor = useCreateBlockNote({
        initialContent: props.content.length > 0 ? props.content : []
    });

    // Update editor content when props.content changes
    useEffect(() => {
        if (editor && props.content.length === 0) {
            // Clear the editor when content is empty
            editor.replaceBlocks(editor.document, []);
        } else if (editor && props.content.length > 0) {
            // Update editor with new content
            editor.replaceBlocks(editor.document, props.content);
        }
    }, [props.content, editor]);
    
    return (
        <Input.Wrapper label={props.label}>
            <Card radius="md" px={0} mih={500}>
                <BlockNoteView 
                    editor={editor} 
                    editable={props.editMode} 
                    theme={computedColorScheme === 'dark' ? darkBlueTheme : lightBlueTheme}
                    onChange={() => {
                        const newBlocks = editor.document;
                        props.onContentChange(newBlocks);
                    }}
                />
            </Card>
        </Input.Wrapper>
    );
}