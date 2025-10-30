import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Area from '@components/common/Area';
import './Settings.scss';

export default function ChatbotSettings() {
  const [shopId] = useState('evershop-default');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    shop_name: '',
    shop_logo_url: '',
    sync_products: true,
    sync_orders: true,
    sync_customers: true,
    backend_api_url: 'http://localhost:48080'
  });

  // Fetch current settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chatbot/status?shop_id=${shopId}`);
      const result = await response.json();
      
      if (result.success && result.data?.setting) {
        setSettings({
          shop_name: result.data.setting.shop_name || '',
          shop_logo_url: result.data.setting.shop_logo_url || '',
          sync_products: result.data.setting.sync_products !== false,
          sync_orders: result.data.setting.sync_orders !== false,
          sync_customers: result.data.setting.sync_customers !== false,
          backend_api_url: result.data.setting.backend_api_url || 'http://localhost:48080'
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  // Save settings
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await fetch('/api/chatbot/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shop_id: shopId,
          ...settings
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Settings saved successfully!');
      } else {
        alert(result.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [shopId, settings]);

  // Handle field changes
  const handleChange = useCallback((field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle file upload
  const handleLogoUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', 'chatbot/logos');

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.data?.url) {
        handleChange('shop_logo_url', result.data.url);
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Failed to upload logo');
    }
  }, [handleChange]);

  // Initial load
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (loading) {
    return <div className="loading-state">Loading settings...</div>;
  }

  return (
    <div className="chatbot-settings">
      <div className="page-header">
        <h1 className="page-title">Chatbot Settings</h1>
        <p className="page-description">
          Configure your AI customer service bot appearance and data synchronization
        </p>
      </div>

      <form onSubmit={handleSave}>
        {/* Store Information Section */}
        <div className="settings-card">
          <div className="card-header">
            <h2>Store Information</h2>
            <p className="card-description">
              Name and avatar will be displayed in customer conversations
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="shop_name">Store Name</label>
            <input
              type="text"
              id="shop_name"
              className="form-input"
              value={settings.shop_name}
              onChange={(e) => handleChange('shop_name', e.target.value)}
              placeholder="Enter your store name"
            />
            <p className="field-hint">
              This name will be shown to customers when they chat with the bot
            </p>
          </div>

          <div className="form-group">
            <label>Store Logo</label>
            <div className="logo-upload-area">
              {settings.shop_logo_url ? (
                <div className="logo-preview">
                  <img src={settings.shop_logo_url} alt="Store Logo" />
                  <button
                    type="button"
                    className="button-remove"
                    onClick={() => handleChange('shop_logo_url', '')}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <label htmlFor="logo-upload" className="upload-label">
                    Click to upload logo
                  </label>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                </div>
              )}
            </div>
            <p className="field-hint">
              Recommended size: 200x200px, PNG or JPG format
            </p>
          </div>
        </div>

        {/* Data Synchronization Section */}
        <div className="settings-card">
          <div className="card-header">
            <h2>Data Synchronization</h2>
            <p className="card-description">
              Select which data types to sync to the AI knowledge base
            </p>
          </div>

          <div className="sync-options">
            <div className="sync-option-item">
              <div className="option-header">
                <div className="option-info">
                  <div className="option-icon">📦</div>
                  <div>
                    <h3>Products</h3>
                    <p>Sync all published products to help customers with product inquiries</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.sync_products}
                    onChange={(e) => handleChange('sync_products', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="sync-option-item">
              <div className="option-header">
                <div className="option-info">
                  <div className="option-icon">📋</div>
                  <div>
                    <h3>Orders</h3>
                    <p>Sync order data to help with order status and shipping inquiries</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.sync_orders}
                    onChange={(e) => handleChange('sync_orders', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="sync-option-item">
              <div className="option-header">
                <div className="option-info">
                  <div className="option-icon">👥</div>
                  <div>
                    <h3>Customers</h3>
                    <p>Sync customer data for personalized service</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.sync_customers}
                    onChange={(e) => handleChange('sync_customers', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="settings-card">
          <div className="card-header">
            <h2>Advanced Settings</h2>
            <p className="card-description">
              Configure backend API connection
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="backend_api_url">Backend API URL</label>
            <input
              type="text"
              id="backend_api_url"
              className="form-input"
              value={settings.backend_api_url}
              onChange={(e) => handleChange('backend_api_url', e.target.value)}
              placeholder="http://localhost:48080"
            />
            <p className="field-hint">
              The URL of the chatbot admin backend API
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="button primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <a href="/chatbot/dashboard" className="button secondary">
            Cancel
          </a>
        </div>
      </form>

      {/* Info Box */}
      <div className="info-box">
        <div className="info-icon">💡</div>
        <div className="info-content">
          <strong>Tip:</strong>
          <p>
            After saving settings, go to the Dashboard to sync your data to the AI knowledge base.
            The bot will use this data to answer customer questions automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

ChatbotSettings.propTypes = {};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

