import { useState } from 'react';
import {
  IconChevronDown,
  IconHeart,
  IconLogout,
  IconMessage,
  IconPlayerPause,
  IconSettings,
  IconStar,
  IconSwitchHorizontal,
  IconTrash,
  IconArrowsShuffle,
  IconBookDownload,
  IconTrendingUp,
  IconTag,
  IconCirclePlus,
  IconUser
} from '@tabler/icons-react';
import cx from 'clsx';
import {
  Anchor,
  Avatar,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  HoverCard,
  Menu,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import SchematicStoryLogo from "@/assets/schematicstory.svg?react";
import classes from './HeaderMegaMenu.module.css';
import { ColorSchemeToggle } from '../ColorSchemeToggle/ColorSchemeToggle';
import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const mockdata = [
  {
    icon: IconTrendingUp,
    title: 'Trending',
    description: 'See what schematics are trending today',
  },
  {
    icon: IconCirclePlus,
    title: 'Newest',
    description: 'Take a look at the latest additions',
  },
  {
    icon: IconBookDownload,
    title: 'Most Downloaded',
    description: 'Grab our most downloaded schematics',
  },
  {
    icon: IconTag,
    title: 'By Tag',
    description: 'Browse by tag',
  },
  {
    icon: IconArrowsShuffle,
    title: 'Random',
    description: 'Open a random schematic',
  },
];

const user = {
  name: 'Jonas Falx',
  email: 'jonas.falx@vintagestory.at',
  image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-10.png',
};

export function HeaderMegaMenu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const theme = useMantineTheme();
  const auth = useAuth();
  
  const signOutRedirect = () => {
    const clientId = "5pk6av8r8nctg7cphchlt7pe2s";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://<user pool domain>";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}>
      <Group wrap="nowrap" align="flex-start">
        <ThemeIcon size={34} variant="default" radius="md">
          <item.icon size={22} color={theme.colors.blue[6]} />
        </ThemeIcon>
        <div>
          <Text size="sm" fw={500}>
            {item.title}
          </Text>
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

  return (
    <Box pb={60} style={{position: 'sticky', top: 0, zIndex: 1}}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Group h="100%" gap={0} visibleFrom="sm">
          <a href="/"><SchematicStoryLogo height={60}/></a>
            <a href="/" className={classes.link}>
              Home
            </a>
            <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Schematics
                    </Box>
                    <IconChevronDown size={16} color={theme.colors.blue[6]} />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Schematics</Text>
                  <Anchor href="/schematics" fz="xs">
                    View all
                  </Anchor>
                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>

                <div className={classes.dropdownFooter}>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} fz="sm">
                        Get started
                      </Text>
                      <Text size="xs" c="dimmed">
                        Upload your creation!
                      </Text>
                    </div>
                    <Button variant="default">Upload</Button>
                  </Group>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>
            <Anchor href="https://mods.vintagestory.at" target="_blank" className={classes.link}>
              ModDB
            </Anchor>
            <Anchor href="/#faq" className={classes.link}>
              FAQ
            </Anchor>
            <Link to="/#contact-us" className={classes.link}>
              About
            </Link>
          </Group>

          <Group visibleFrom="sm">
            <ColorSchemeToggle />
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                >
                  <Group gap={7}>
                    <Avatar src={user.image} alt={user.name} radius="xl" size={20} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {user.name}
                    </Text>
                    <IconChevronDown size={12} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconHeart 
                    size={16} 
                    color={theme.colors.red[6]} 
                    stroke={1.5} />}
                >
                  Followed schematics
                </Menu.Item>                
                <Menu.Item
                  leftSection={<IconUser 
                    size={16} 
                    color={theme.colors.blue[6]} 
                    stroke={1.5} />}
                >
                  Followed seraphs
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconMessage 
                    size={16} 
                    color={theme.colors.yellow[6]} 
                    stroke={1.5} />}
                >
                  Your comments
                </Menu.Item>

                <Menu.Label>Settings</Menu.Label>
                <Menu.Item 
                  leftSection={<IconSettings 
                    size={16} 
                    stroke={1.5} />}
                >
                  Account settings
                </Menu.Item>
                <Menu.Item 
                  leftSection={<IconLogout 
                    size={16} 
                    stroke={1.5} 
                    onClick={() => signOutRedirect()} />}
                >
                  Logout
                </Menu.Item>
                
                <Menu.Divider />

                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item color="red" leftSection={<IconTrash size={16} stroke={1.5} />}>
                  Delete account
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider my="sm" />

          <a href="#" className={classes.link}>
            Home
          </a>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Features
              </Box>
              <IconChevronDown size={16} color={theme.colors.blue[6]} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>
          <a href="#" className={classes.link}>
            Learn
          </a>
          <a href="#" className={classes.link}>
            Academy
          </a>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                >
                  <Group gap={7}>
                    <Avatar src={user.image} alt={user.name} radius="xl" size={20} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {user.name}
                    </Text>
                    <IconChevronDown size={12} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconHeart size={16} color={theme.colors.red[6]} stroke={1.5} />}
                >
                  Followed schematics
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconStar size={16} color={theme.colors.yellow[6]} stroke={1.5} />}
                >
                  Saved schematics
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconMessage size={16} color={theme.colors.blue[6]} stroke={1.5} />}
                >
                  Your comments
                </Menu.Item>

                <Menu.Label>Settings</Menu.Label>
                <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
                  Account settings
                </Menu.Item>
                <Menu.Item leftSection={<IconSwitchHorizontal size={16} stroke={1.5} />}>
                  Change account
                </Menu.Item>
                <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />}>Logout</Menu.Item>

                <Menu.Divider />

                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item leftSection={<IconPlayerPause size={16} stroke={1.5} />}>
                  Pause subscription
                </Menu.Item>
                <Menu.Item color="red" leftSection={<IconTrash size={16} stroke={1.5} />}>
                  Delete account
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
