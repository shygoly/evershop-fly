import { Card } from '@components/admin/cms/Card';
import PropTypes from 'prop-types';
import React from 'react';

export default function ThemeSettingMenu({ themeSettingUrl }) {
  return (
    <Card.Session title={<a href={themeSettingUrl}>Theme Manager</a>}>
      <div>Select which storefront theme is active</div>
    </Card.Session>
  );
}

ThemeSettingMenu.propTypes = {
  themeSettingUrl: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'settingPageMenu',
  sortOrder: 12
};

export const query = `
  query ThemeSettingMenu {
    themeSettingUrl: url(routeId: "themeSetting")
  }
`;
