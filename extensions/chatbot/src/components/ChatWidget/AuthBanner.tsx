import React from 'react';
import type { UserRole } from '../../types/chat';
import './AuthBanner.scss';

interface AuthBannerProps {
  userRole: UserRole;
  customerName?: string;
  onLoginClick: () => void;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({ 
  userRole, 
  customerName,
  onLoginClick 
}) => {
  if (userRole === 'customer') {
    return (
      <div className="chat-auth-banner chat-auth-banner--customer">
        <span className="chat-auth-banner__icon">✓</span>
        <span className="chat-auth-banner__text">
          {customerName ? `${customerName} • Full Access` : 'Full Access'}
        </span>
      </div>
    );
  }

  return (
    <div className="chat-auth-banner chat-auth-banner--visitor">
      <span className="chat-auth-banner__text">Guest Mode</span>
      <button 
        className="chat-auth-banner__login-btn" 
        onClick={onLoginClick}
        type="button"
      >
        Login
      </button>
      <span className="chat-auth-banner__hint">to ask about orders</span>
    </div>
  );
};

