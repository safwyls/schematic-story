import { IconBookmark, IconHeart, IconShare } from '@tabler/icons-react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Card,
  Center,
  Group,
  Image,
  Text,
  useMantineTheme,
} from '@mantine/core';
import classes from './SchematicCard.module.css';
import { MouseEventHandler } from 'react';

interface SchematicCardProps {
  badge?: string,
  title: string,
  description: string,
  author: Author,
  image: string,
  date: string // todo: change this to dayjs later
  url: string
}

interface Author {
  id: string,
  name: string,
  avatarUrl: string
}

export function SchematicCard(props: SchematicCardProps) {
  const linkProps = { href: props.url };
  const theme = useMantineTheme();

  const onHeart: MouseEventHandler<HTMLButtonElement> | undefined = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Heart action
    alert("Heart!");
  }

  const onSave: MouseEventHandler<HTMLButtonElement> | undefined = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Heart action
    alert("Save!");
  }

  const onShare: MouseEventHandler<HTMLButtonElement> | undefined = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Heart action
    alert("Share!");
  }

  return (
    <Card withBorder radius="md" className={classes.card}>
      <Card.Section>
        <a {...linkProps}>
          <Image src={props.image} height={180} />
        </a>
      </Card.Section>
      
      {props.badge != null ?
          <Badge className={classes.rating} variant="gradient" gradient={{ from: 'yellow', to: 'red' }}>
            {props.badge}
          </Badge>
        :
          <></>
      }

      <Text className={classes.title} fw={500} lineClamp={1} component="a" {...linkProps}>
        {props.title}
      </Text>

      <Text fz="sm" c="dimmed" lineClamp={4}>
        {props.description}
      </Text>

      <Group justify="space-between" className={classes.footer}>
        <Center>
          <Avatar
            src={props.author.avatarUrl}
            size={24}
            radius="xl"
            mr="xs"
          />
          <Text fz="xs" component="a" href={"/user/" + props.author.name} inline>
            {props.author.name}
          </Text>
        </Center>

        <Group gap={8} mr={0}>
          <ActionIcon className={classes.action} onClick={onHeart}>
            <IconHeart size={16} color={theme.colors.red[6]} />
          </ActionIcon>
          <ActionIcon className={classes.action} onClick={onShare}>
            <IconShare size={16} color={theme.colors.blue[6]} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}