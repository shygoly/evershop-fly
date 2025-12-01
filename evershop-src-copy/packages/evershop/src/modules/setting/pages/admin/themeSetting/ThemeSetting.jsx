import { Card } from '@components/admin/cms/Card';
import SettingMenu from '@components/admin/setting/SettingMenu';
import { Field } from '@components/common/form/Field';
import { Form } from '@components/common/form/Form';
import PropTypes from 'prop-types';
import React from 'react';
import { toast } from 'react-toastify';

export default function ThemeSetting({
  saveSettingApi,
  themes,
  setting: { activeTheme }
}) {
  const availableThemes = themes.length
    ? themes
    : [{ name: activeTheme, label: activeTheme }];

  const options = availableThemes.map((theme) => ({
    value: theme.name,
    text: theme.label || theme.name
  }));

  const initialTheme =
    activeTheme && options.find((option) => option.value === activeTheme)
      ? activeTheme
      : options[0]?.value;

  return (
    <div className="main-content-inner">
      <div className="grid grid-cols-6 gap-x-8 grid-flow-row ">
        <div className="col-span-2">
          <SettingMenu />
        </div>
        <div className="col-span-4">
          <Form
            id="themeSetting"
            method="POST"
            action={saveSettingApi}
            onSuccess={(response) => {
              if (!response.error) {
                toast.success('Theme updated');
              } else {
                toast.error(response.error.message);
              }
            }}
          >
            <Card>
              <Card.Session title="Theme Selection">
                <p className="text-sm text-gray-500 mb-4">
                  Choose the storefront theme to activate. Changes take effect
                  immediately without requiring a redeploy.
                </p>
                <Field
                  type="select"
                  name="activeTheme"
                  label="Active Theme"
                  value={initialTheme}
                  options={options}
                />
              </Card.Session>
            </Card>
          </Form>
        </div>
      </div>
    </div>
  );
}

ThemeSetting.propTypes = {
  saveSettingApi: PropTypes.string.isRequired,
  setting: PropTypes.shape({
    activeTheme: PropTypes.string
  }).isRequired,
  themes: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      name: PropTypes.string.isRequired
    })
  ).isRequired
};

export const layout = {
  areaId: 'content',
  sortOrder: 15
};

export const query = `
  query ThemeSettingPage {
    saveSettingApi: url(routeId: "saveSetting")
    themes {
      name
      label
    }
    setting {
      activeTheme
    }
  }
`;
