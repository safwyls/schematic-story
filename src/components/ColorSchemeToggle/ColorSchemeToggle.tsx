import { ActionIcon, Group, MantineColorScheme, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';;
import {
  IconMoon,
  IconSun
} from '@tabler/icons-react'
import cx from 'clsx';
import classes from './ColorSchemeToggle.module.css';

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  
  const rotateColorScheme = (computedColorScheme : MantineColorScheme): any => {
    console.log(computedColorScheme);
    switch (computedColorScheme){
      case "light":
        return setColorScheme("dark");
      case "dark":
        return setColorScheme("auto");
      case "auto":
        return setColorScheme("light");
    }    
  }

  return (
      <ActionIcon
        onClick={() => setColorScheme(computedColorScheme === "dark" ? "light" : "dark")}
        variant="default"
        size="lg"
        radius="md"
        aria-label="Toggle color scheme"
      >
        <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
        <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
      </ActionIcon>
  );
}
