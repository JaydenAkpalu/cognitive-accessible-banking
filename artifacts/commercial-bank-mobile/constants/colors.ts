/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const light = {
    // Legacy aliases (kept for backward compatibility)
    text: '#172b4d',
    tint: '#0b3b78',

    // Core surfaces
    background: '#f7f9fc',
    foreground: '#172b4d',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#172b4d',

    // Primary action color (buttons, links, active states)
    primary: '#0b3b78',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#eaf1f9',
    secondaryForeground: '#172b4d',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#f1f4f8',
    mutedForeground: '#6f7d8f',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#f7eaf2',
    accentForeground: '#92005c',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#dfe4ec',
    input: '#dfe4ec',

    navy: '#0b3b78',
    navyMid: '#174e93',
    navyDeep: '#172b4d',
    magenta: '#92005c',
    magentaDeep: '#76004f',
    magentaSoft: '#f7eaf2',
    blueSoft: '#eaf1f9',
    success: '#15805c',
    white: '#ffffff',
};

const cognitive = {
  ...light,
  text: '#292a28',
  tint: '#35666a',
  background: '#f4f1eb',
  foreground: '#292a28',
  card: '#fffefa',
  cardForeground: '#292a28',
  primary: '#35666a',
  primaryForeground: '#ffffff',
  secondary: '#ebe9e3',
  secondaryForeground: '#292a28',
  muted: '#e9e7e1',
  mutedForeground: '#5c5d59',
  accent: '#e2ebe7',
  accentForeground: '#35666a',
  destructive: '#b96b68',
  destructiveForeground: '#ffffff',
  border: '#d8d6cf',
  input: '#d8d6cf',
  navy: '#35666a',
  navyMid: '#35666a',
  navyDeep: '#292a28',
  magenta: '#35666a',
  magentaDeep: '#35666a',
  magentaSoft: '#e2ebe7',
  blueSoft: '#ebe9e3',
  success: '#47765d',
  white: '#fffefa',
};

const colors = {
  light,
  cognitive,

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 14,
};

export default colors;
