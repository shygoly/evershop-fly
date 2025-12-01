import fs from 'fs';
import path from 'path';
import {
  commit,
  insertOnUpdate,
  rollback
} from '@evershop/postgres-query-builder';
import config from 'config';
import { CONSTANTS } from '../../../../lib/helpers.js';
import { getConnection } from '../../../../lib/postgres/connection.js';
import { INTERNAL_SERVER_ERROR, OK } from '../../../../lib/util/httpStatus.js';
import { refreshSetting } from '../../services/setting.js';

export default async (request, response, next) => {
  const { body } = request;
  const connection = await getConnection();
  let nextActiveTheme;
  try {
    // Loop through the body and insert the data
    const promises = [];
    Object.keys(body).forEach((key) => {
      const value = body[key];
      if (key === 'activeTheme' && typeof value === 'string') {
        const desiredTheme = value.trim();
        if (!desiredTheme) {
          throw new Error('Theme name can not be empty');
        }
        const themePath = path.resolve(CONSTANTS.THEMEPATH, desiredTheme);
        if (!fs.existsSync(themePath)) {
          throw new Error(
            `Theme '${desiredTheme}' not found. Make sure it exists under ${CONSTANTS.THEMEPATH}`
          );
        }
        nextActiveTheme = desiredTheme;
      }
      // Check if the value is a object or array
      if (typeof value === 'object') {
        promises.push(
          insertOnUpdate('setting', ['name'])
            .given({
              name: key,
              value: JSON.stringify(value),
              is_json: 1
            })
            .execute(connection, false)
        );
      } else {
        promises.push(
          insertOnUpdate('setting', ['name'])
            .given({
              name: key,
              value,
              is_json: 0
            })
            .execute(connection, false)
        );
      }
    });
    await Promise.all(promises);
    await commit(connection);
    // Refresh the setting
    await refreshSetting();
    if (nextActiveTheme) {
      const previousMutationFlag = process.env.ALLOW_CONFIG_MUTATIONS;
      process.env.ALLOW_CONFIG_MUTATIONS = 'true';
      config.util.extendDeep(config, {
        system: {
          theme: nextActiveTheme
        }
      });
      process.env.ALLOW_CONFIG_MUTATIONS = previousMutationFlag;
    }
    response.status(OK);
    response.json({
      data: {}
    });
  } catch (error) {
    await rollback(connection);
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: error.message
      }
    });
  }
};
