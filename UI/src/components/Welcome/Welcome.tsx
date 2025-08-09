import { Anchor, Card, Text, Title, Container, Blockquote, Space } from '@mantine/core';
import classes from './Welcome.module.css';

export function Welcome() {
  return (
    <Container>
      <Title className={classes.title} ta="center" mt={20}>
        Welcome to{' '}
        <Space />
        <Text inherit variant="gradient" component="span" gradient={{ from: 'blue', to: 'cyan' }}>
          Schematic Story
        </Text>
      </Title>
      <Card maw="70%" ta="center" mx="auto" mt="xl" pb={40}>
        <Text fw={500} c="dimmed" >
          This website seeks to provide an open location for sharing your Vintage Story creations through world edit schematic files.
          <Space my="1em" />
          Take a look around, 
          <Space />
          contribute to the library of available schematics,
          <Space />
          and, most importantly, make yourself at home!
        </Text>
      </Card>
    </Container>
  );
}
