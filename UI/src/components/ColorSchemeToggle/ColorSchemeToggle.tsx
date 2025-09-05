import { ActionIcon, Badge, Button, Divider, Group, Text, useMantineColorScheme } from '@mantine/core';;
import {
  IconDeviceDesktop,
  IconMoon,
  IconSun
} from '@tabler/icons-react'

export function ColorSchemeToggle(props: {mobile?: boolean}) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  if (props.mobile){
    return (
        <>
        <Divider/>
        <Group justify="space-between" px={0} gap="0">
            <Button
                onClick={() => setColorScheme("light")}
                variant="transparent"
                color="yellow"
                size="md"
                aria-label="Light color scheme"
                px="0.5rem"
            >
                <IconSun  /> <Text px="0.25rem">Light</Text>
            </Button>
            <Button
                onClick={() => setColorScheme("dark")}
                variant="transparent"
                color="black"
                size="md"
                aria-label="Dark color scheme"
                px="0.5rem"
            >
                <IconMoon /> <Text px="0.25rem">Dark</Text>
            </Button> 
            <Button
                onClick={() => setColorScheme("auto")}
                variant="transparent"
                size="md"
                aria-label="Auto color scheme"
                px="0.5rem"
            >
                <IconDeviceDesktop /> <Text px="0.25rem">System</Text>
            </Button>
        </Group></>
    );
  }
  else {
    return (
        <Badge size="xl" variant="light">
            <Group gap="0">
                <ActionIcon
                    onClick={() => setColorScheme("light")}
                    variant="transparent"
                    color="yellow"
                    size="sm"
                    aria-label="Light color scheme"
                >
                    <IconSun stroke={1.5} />
                </ActionIcon>
                <ActionIcon
                    onClick={() => setColorScheme("dark")}
                    variant="transparent"
                    color="black"
                    size="sm"
                    aria-label="Dark color scheme"
                    >
                    <IconMoon stroke={1.5} />
                </ActionIcon>
                <ActionIcon
                    onClick={() => setColorScheme("auto")}
                    variant="transparent"
                    size="sm"
                    aria-label="Auto color scheme"
                    >
                    <IconDeviceDesktop stroke={1.5} />
                </ActionIcon>
            </Group>
        </Badge>
    ); 
  }
}
