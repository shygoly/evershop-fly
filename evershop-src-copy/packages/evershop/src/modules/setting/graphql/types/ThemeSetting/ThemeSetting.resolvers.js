import fs from 'fs';
import { CONSTANTS } from '../../../../../lib/helpers.js';
import { getConfig } from '../../../../../lib/util/getConfig.js';

function getThemeDirectories() {
  try {
    return fs
      .readdirSync(CONSTANTS.THEMEPATH, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .sort();
  } catch (e) {
    return [];
  }
}

function humanizeThemeName(themeName) {
  const spaced = themeName.replace(/[-_]+/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export default {
  Query: {
    themes: () =>
      getThemeDirectories().map((name) => ({
        name,
        label: humanizeThemeName(name)
      }))
  },
  Setting: {
    activeTheme: (setting) => {
      const record = setting.find((item) => item.name === 'activeTheme');
      if (record && typeof record.value === 'string') {
        return record.value;
      }
      const configuredTheme = getConfig('system.theme', null);
      if (typeof configuredTheme === 'string') {
        return configuredTheme;
      }
      const themes = getThemeDirectories();
      return themes.length ? themes[0] : null;
    }
  }
};
