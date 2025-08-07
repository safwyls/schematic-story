import { createTheme, MantineColorsTuple } from '@mantine/core';

// Blueprint tone based on #1581F3
const blueprint: MantineColorsTuple = [
  '#e0f0ff', // 0 - lightest
  '#b9d9fb',
  '#8fc1f7',
  '#66a9f4',
  '#3c91f0',
  '#1581f3', // 5 - base color
  '#1169ca',
  '#0d53a0',
  '#083d76',
  '#04264d', // 9 - darkest, good for background
];

export const blueprintTheme = createTheme({
  primaryColor: 'blueprint',
  primaryShade: 5,

  colors: {
    blueprint,
  },

  fontFamily: 'Roboto Mono, monospace',

  defaultRadius: 'sm',

  headings: {
    fontFamily: 'Roboto Mono, monospace',
    fontWeight: '700',
  },

  components: {
    Paper: {
      styles: (theme) => ({
        root: {
          backgroundColor: blueprint[8],
          color: blueprint[0],           // text
        },
      }),
    },
    Button: {
      styles: (theme) => ({
        root: {
          backgroundColor: blueprint[5],
          color: theme.white,
          '&:hover': {
            backgroundColor: blueprint[6],
          },
        },
      }),
    },
  },

  other: {
    backgroundDefault: blueprint[5],
    backgroundPaper: blueprint[9],
    textPrimary: blueprint[0],
    textSecondary: blueprint[2],
    divider: blueprint[7],
    error: '#FF5C5C',
    warning: '#FFB347',
    success: '#6BCB77',
    info: '#3FA9F5',
  },
});
