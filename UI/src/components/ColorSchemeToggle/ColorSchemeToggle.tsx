import { ActionIcon, Badge, Group, useMantineColorScheme } from '@mantine/core';;
import {
  IconDeviceDesktop,
  IconMoon,
  IconSun
} from '@tabler/icons-react'

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

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
