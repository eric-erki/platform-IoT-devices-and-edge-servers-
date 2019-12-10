const breakpoints = ['480px', '768px', '1024px'];

const colors = {
  primary: '#57e3ff',
  background: '#222222',

  black: '#000',
  white: '#fff',
  transparent: 'transparent',
  inputBackground: '#181818',

  blacks: [
    'rgba(0,0,0,.05)',
    'rgba(0,0,0,.1)',
    'rgba(0,0,0,.2)',
    'rgba(0,0,0,.3)',
    'rgba(0,0,0,.4)',
    'rgba(0,0,0,.5)',
    'rgba(0,0,0,.6)',
    'rgba(0,0,0,.7)',
    'rgba(0,0,0,.8)',
    'rgba(0,0,0,.9)',
  ],
  whites: [
    'rgba(255,255,255,.05)',
    'rgba(255,255,255,.1)',
    'rgba(255,255,255,.2)',
    'rgba(255,255,255,.3)',
    'rgba(255,255,255,.4)',
    'rgba(255,255,255,.5)',
    'rgba(255,255,255,.6)',
    'rgba(255,255,255,.7)',
    'rgba(255,255,255,.8)',
    'rgba(255,255,255,.9)',
  ],
};

export default {
  colors,

  space: [
    0,
    4,
    8,
    12,
    16,
    24,
    32,
    40,
    48,
    64,
    128,
    256,
    384,
    448,
    512,
    768,
    1024,
  ],

  fontSizes: [12, 14, 16, 18, 24, 36, 48, 64, 72],

  fontWeights: [100, 300, 400, 500, 600, 700, 900],

  radii: [0, 4, 8, 12, 16, 9999, '100%'],

  sizes: [8, 12, 16, 24, 32, 40, 48, 64, 128, 256, 384, 448, 512, 768, 1024],

  breakpoints,

  borders: [`1px solid ${colors.primary}`, `3px solid ${colors.primary}`],

  shadows: [
    `0 2px 4px ${colors.blacks[1]}, 0 2px 4px ${colors.blacks[2]}`,
    `0 3px 6px ${colors.blacks[1]}, 0 3px 6px ${colors.blacks[2]}`,
  ],

  mediaQueries: {
    small: `@media screen and (min-width: ${breakpoints[0]})`,
    medium: `@media screen and (min-width: ${breakpoints[1]})`,
    large: `@media screen and (min-width: ${breakpoints[2]})`,
  },
};

export const labelColors = [
  '#0ebeff',
  '#ae63e4',
  '#fcd000',
  '#ff3c41',
  '#76daff',
];
