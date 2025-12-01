import React from 'react';
import PropTypes from 'prop-types';

export default function HelloWidget({ helloWidget: { text, className } }) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${className}`}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        width: '56px',
        height: '56px',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(220,38,38,0.35)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}
      title={text || "Hello World"}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
      </svg>
    </div>
  );
}

HelloWidget.propTypes = {
  helloWidget: PropTypes.shape({
    text: PropTypes.string,
    className: PropTypes.string,
  }),
};

HelloWidget.defaultProps = {
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
