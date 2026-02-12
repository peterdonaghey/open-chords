/**
 * Type declarations for themes.js
 */
import type { Theme, ThemesByCategory } from './types/theme';

declare const themes: Record<string, Theme>;
declare function getThemesByCategory(): ThemesByCategory;

export { themes, getThemesByCategory };
