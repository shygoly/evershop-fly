import React from 'react';
import PropTypes from 'prop-types';
import { Field } from '@components/common/form/Field';

export default function HelloWidgetSetting({ helloWidget: { text, className } }) {
  return (
    <div>
      <p>Configure your Hello Float Widget</p>
      <Field
        type="text"
        name="settings[text]"
        label="Button Tooltip Text"
        value={text}
        placeholder="Enter tooltip text for the button"
      />
      <Field
        type="text"
        name="settings[className]"
        label="Custom CSS Classes"
        value={className}
        placeholder="Enter custom CSS classes"
      />
    </div>
  );
}

HelloWidgetSetting.propTypes = {
  helloWidget: PropTypes.shape({
    text: PropTypes.string,
    className: PropTypes.string,
  }),
};

HelloWidgetSetting.defaultProps = {
  helloWidget: {
    text: "Hello, world!",
    className: "",
  },
};

export const query = `
  query Query($settings: JSON) {
    helloWidget(settings: $settings) {
      text
      className
    }
  }
`;

export const variables = `{
  settings: getWidgetSetting()
}`;
