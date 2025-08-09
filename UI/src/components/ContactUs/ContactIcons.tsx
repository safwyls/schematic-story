import { IconAt, IconBrandDiscord, IconBrandGithub, IconSun } from '@tabler/icons-react';
import { Box, Stack, Text } from '@mantine/core';
import classes from './ContactIcons.module.css';

interface ContactIconProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  icon: typeof IconSun;
  title: React.ReactNode;
  description: React.ReactNode;
  url: string
}

function ContactIcon({ icon: Icon, title, description, url, ...others }: ContactIconProps) {
  return (
    <div className={classes.wrapper} {...others}>
      <Box mr="md">
        <Icon size={24} />
      </Box>

      <a style={{ textDecoration: "none", color: 'unset' }} href={url} target="_blank">
      <div>
        <Text size="xs" className={classes.title}>
          {title}
        </Text>
        <Text className={classes.description}>{description}</Text>
      </div>
      </a>
    </div>
  );
}

const MOCKDATA = [
  { title: 'Email', description: 'safwyl@pm.me', icon: IconAt, url: "mailto:safwyl@pm.me" },
  { title: 'GitHub', description: 'github.com/safwyls', icon: IconBrandGithub, url: "https://github.com/safwyls" },
  { title: 'Discord', description: '@safwyl', icon: IconBrandDiscord, url: "https://discord.com/users/safwyl" }
];

export function ContactIconsList() {
  const items = MOCKDATA.map((item, index) => <ContactIcon key={index} {...item} />);
  return <Stack>{items}</Stack>;
}