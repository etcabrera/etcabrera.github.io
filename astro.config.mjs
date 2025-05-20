// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://etcabrera.github.io',
    i18n: {
    defaultLocale: "es",
    locales: ["es", "en", "it"],
  }
});
