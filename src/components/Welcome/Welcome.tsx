import { Anchor, Text, Title } from '@mantine/core';
import classes from './Welcome.module.css';

export function Welcome() {
  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'blue', to: 'cyan' }}>
          Schematic Story
        </Text>
      </Title>
      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl" pb={120}>
        This website seeks to provide an open location for sharing your Vintage Story creations through world edit schematic files. 
        Take a look around, contribute to the database of available schematics, and make yourself at home!        
      </Text>
    </>
  );
}
