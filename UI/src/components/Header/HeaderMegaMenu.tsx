import {
  IconChevronDown,
  IconHeart,
  IconLogout,
  IconMessage,
  IconSettings,
  IconStar,
  IconArrowsShuffle,
  IconBookDownload,
  IconTrendingUp,
  IconTag,
  IconCirclePlus,
  IconUser,
  IconLogin,
  IconList
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
  Loader,
  Menu,
  NavLink,
  ScrollArea,
  SimpleGrid,
  Stack,
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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'

const mockdata = [
  {
    icon: IconTrendingUp,
    title: 'Trending',
    description: 'See what schematics are trending today',
    url: '/schematics'
  },
  {
    icon: IconCirclePlus,
    title: 'Latest',
    description: 'Take a look at the latest additions',
    url: '/schematics'
  },
  {
    icon: IconBookDownload,
    title: 'Most Downloaded',
    description: 'Grab our most downloaded schematics',
    url: '/schematics'
  },
  {
    icon: IconTag,
    title: 'By Tag',
    description: 'Browse by tag',
    url: '/schematics'
  },
  {
    icon: IconArrowsShuffle,
    title: 'Random',
    description: 'Open a random schematic',
    url: `/schematic/${1}`
  },
];

export function HeaderMegaMenu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const [userMenuOpened, { toggle: toggleUserMenu }] = useDisclosure(false);
  const theme = useMantineTheme();
  const auth = useAuth();
  const navigate = useNavigate();
  const { 
    user,
    avatar,
    avatarLoading,
    isAuthenticated,
    login,
    logout
  } = useAuth()
  const username = user?.profile.preferred_username;

  const loginRedirectTo = (redirectPath: string) => {
    const redirectUri = `${window.location.origin}${redirectPath}`;
    
    login({
      redirect_uri: redirectUri
    });
  }
  
  const navigateTo = (path: string) => {
    closeDrawer();
    navigate(path);
  }

  const links = mockdata.map((item) => (
    <UnstyledButton className={classes.subLink} key={item.title}  onClick={() => navigateTo(item.url)}>
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
    <Box style={{position: 'sticky', top: 0, zIndex: 1000}}>
      <header className={classes.header}>
        <Group justify="space-between">
          <Group gap={0}>
            <a href="/"><SchematicStoryLogo className={classes.logo} /></a>
            <Group gap={0} h={60} visibleFrom="md">
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
                      <Button variant="default" onClick={() => navigate('/upload')}>Upload</Button>
                    </Group>
                  </div>
                </HoverCard.Dropdown>
              </HoverCard>
              <Anchor href="/swagger" className={classes.link}>
                API
              </Anchor>
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
          </Group>

          <Group visibleFrom="md">
            <ColorSchemeToggle />
            
            {isAuthenticated 
              ?
                <Menu
                  width={260}
                  position="bottom-end"
                  transitionProps={{ transition: 'pop-top-right' }}
                  trigger="click"
                  withinPortal
                  zIndex={1000000}
                >
                  <Menu.Target>
                    <UnstyledButton
                      py="lg"
                      className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                    >
                      <Group gap={7}>
                        {avatarLoading 
                          ? <Loader size="xs" />
                          : <Avatar src={avatar?.thumbnailUrl} alt={username} radius="xl" size={20} />
                        }
                        <Text fw={500} size="sm" lh={1} mr={3}>
                          {username}
                        </Text>
                        <IconChevronDown size={12} stroke={1.5} />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      onClick={() => navigate('/profile/' + username + '/schematics')}
                      leftSection={<IconHeart size={16} color={theme.colors.red[6]} stroke={1.5} />}
                    >
                      Followed schematics
                    </Menu.Item>                
                    <Menu.Item
                      onClick={() => navigate('/profile/' + username + '/users')}
                      leftSection={<IconUser size={16} color={theme.colors.blue[6]} stroke={1.5} />}
                    >
                      Followed seraphs
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => navigate('/profile/' + username + '/comments')}
                      leftSection={<IconMessage size={16} color={theme.colors.yellow[6]} stroke={1.5} />}
                    >
                      Your comments
                    </Menu.Item>

                    <Menu.Label>Settings</Menu.Label>
                    <Menu.Item 
                      leftSection={<IconSettings size={16} stroke={1.5} />}
                      onClick={() => navigate('/account')}
                    >
                      Account settings
                    </Menu.Item>
                    
                    <Menu.Item 
                      leftSection={<IconLogout size={16} stroke={1.5} />}
                      onClick={logout} 
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              :
                <UnstyledButton 
                  onClick={login}
                  className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                >
                  <Group gap={7}>
                    <IconLogin size={16} stroke={1.5} />
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      Login
                    </Text>
                  </Group>
                </UnstyledButton>
            }
          </Group>
          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="md" />
        </Group>
      </header>
    
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        hiddenFrom="md"
        title={<SchematicStoryLogo height={40}/>}
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider my="sm" />

          <NavLink label="Home" href="/" className={classes.link}/>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Center inline>
              <Box component="span" mr={5}>
                Schematics
              </Box>
              <IconChevronDown size={16} color={theme.colors.blue[6]} />
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>
            <UnstyledButton className={classes.subLink} key={"view-all"} onClick={() => navigateTo("/schematics")}>
              <Group wrap="nowrap" align="flex-start">
                <ThemeIcon size={34} variant="default" radius="md">
                  <IconList size={22} color={theme.colors.blue[6]} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500}>
                    View All
                  </Text>
                  <Text size="xs" c="dimmed">
                    Browse all available schematics
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
            {links}
          </Collapse>
          <NavLink onClick={closeDrawer} label="FAQ" href="/#faq" className={classes.link}/>
          <NavLink onClick={closeDrawer} label="About" href="/#contact-us" className={classes.link}/>

          <Divider my="sm" />

          <Stack justify="center">
            {isAuthenticated 
              ?
                <>
                  <Group gap={7} className={classes.link}  onClick={toggleUserMenu}>
                    {avatarLoading 
                      ? <Loader size="xs" />
                      : <Avatar src={avatar?.thumbnailUrl} alt={username} radius="xl" size={20} />
                    }
                    <Text fw={500} size="sm" lh={1} mr={3}>
                      {username}
                    </Text>
                    <IconChevronDown size={16} color={theme.colors.blue[6]}/>
                  </Group>
                  <Collapse in={userMenuOpened}>
                    <NavLink
                      label="Followed schematics"
                      href="/schematics/following"
                      leftSection={<IconHeart size={16} color={theme.colors.red[6]} stroke={1.5} />}
                    />
                    <NavLink
                      label="Saved schematics"
                      href="/schematics/saved"
                      leftSection={<IconStar size={16} color={theme.colors.yellow[6]} stroke={1.5} />}
                    />
                    <NavLink 
                      label="Account settings"
                      href="/account"
                      leftSection={<IconSettings size={16} stroke={1.5} />}
                    />
                    <NavLink 
                      label="Logout"
                      onClick={logout}
                      leftSection={<IconLogout size={16} stroke={1.5} />}
                    />
                  </Collapse>
                </>
              :
                <NavLink 
                  label="Login"
                  onClick={login}
                  leftSection={<Avatar src="" alt="Login button" radius="xl" size={20} />}
                />
            }
            <ColorSchemeToggle mobile/>
          </Stack>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
