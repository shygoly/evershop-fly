import fs from 'fs';
import path from 'path';
import config from 'config';
import { CONSTANTS } from '../../lib/helpers.js';
import { warning } from '../../lib/log/logger.js';
import { getSetting, refreshSetting } from './services/setting.js';

export default async function bootstrapSettingModule() {
  const defaultTheme = config.has('system.theme')
    ? config.get('system.theme')
    : null;

  let activeTheme = defaultTheme;

  try {
    await refreshSetting();
    activeTheme = await getSetting('activeTheme', defaultTheme);
  } catch (e) {
    warning(
      `Unable to resolve active theme from settings store, continuing with configured default. Reason: ${e.message}`
    );
    activeTheme = defaultTheme;
  }

  if (typeof activeTheme !== 'string' || !activeTheme) {
    return;
  }

  const desiredThemePath = path.resolve(CONSTANTS.THEMEPATH, activeTheme);
  if (!fs.existsSync(desiredThemePath)) {
    warning(
      `Theme '${activeTheme}' referenced in settings does not exist. Falling back to '${defaultTheme}'.`
    );
    return;
  }

  const previousMutationFlag = process.env.ALLOW_CONFIG_MUTATIONS;
  process.env.ALLOW_CONFIG_MUTATIONS = 'true';
  config.util.extendDeep(config, {
    system: {
      theme: activeTheme
    }
  });
  process.env.ALLOW_CONFIG_MUTATIONS = previousMutationFlag;
}
