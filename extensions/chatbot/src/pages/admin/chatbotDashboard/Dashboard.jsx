import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Area from '@components/common/Area';
import './Dashboard.scss';

export default function ChatbotDashboard() {
  const [shopId, setShopId] = useState('evershop-default');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [statusData, setStatusData] = useState(null);

  // Fetch chatbot status
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chatbot/status?shop_id=${shopId}`);
      const result = await response.json();
      
      if (result.success) {
        setStatusData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch chatbot status:', error);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  // Sync data by type
  const handleSync = useCallback(async (syncType) => {
    try {
      setSyncing(syncType);
      const response = await fetch('/api/chatbot/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shop_id: shopId,
          sync_type: syncType
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh status after sync
        await fetchStatus();
        // Show success message
        alert(result.message);
      } else {
        alert(result.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync data');
    } finally {
      setSyncing(null);
    }
  }, [shopId, fetchStatus]);

  // Initial load
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const syncInfo = statusData?.syncInfo || {};
  const chatStats = statusData?.chatStats || { todayCount: 0, increasePer: 0 };

  return (
    <div className="chatbot-dashboard">
      <div className="page-header">
        <h1 className="page-title">AI Customer Service Dashboard</h1>
        <p className="page-description">
          Monitor and manage your AI chatbot knowledge base and conversations
        </p>
      </div>

      {/* Welcome Card */}
      <div className="dashboard-card welcome-card">
        <div className="card-content">
          <h2>Welcome to AI Customer Assistant</h2>
          <p>
            The AI assistant can automatically answer common customer questions about products, orders, and more.
          </p>
          <div className="action-buttons">
            <a href="/chatbot/settings" className="button primary">
              Configure Settings
            </a>
            <button 
              onClick={fetchStatus} 
              className="button secondary"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon chat-icon">💬</div>
          <div className="stat-content">
            <h3>Today's Conversations</h3>
            <div className="stat-value">{chatStats.todayCount}</div>
            <div className="stat-change">
              +{chatStats.increasePer} vs yesterday
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Base Status */}
      <div className="dashboard-card knowledge-base-card">
        <div className="card-header">
          <h2>Knowledge Base Status</h2>
          <button 
            onClick={fetchStatus} 
            className="button-plain"
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        <div className="knowledge-items">
          {/* Products */}
          <div className="knowledge-item">
            <div className="item-info">
              <div className="item-icon">📦</div>
              <div className="item-details">
                <h3>Product Data</h3>
                <div className="item-stats">
                  <span className="count">{syncInfo.productCount || 0} items</span>
                  {syncInfo.productDate && (
                    <span className="last-sync">
                      Last sync: {new Date(syncInfo.productDate).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSync('products')}
              disabled={syncing !== null}
              className={`button ${syncing === 'products' ? 'loading' : ''}`}
            >
              {syncing === 'products' ? 'Syncing...' : 'Sync Products'}
            </button>
          </div>

          {/* Orders */}
          <div className="knowledge-item">
            <div className="item-info">
              <div className="item-icon">📋</div>
              <div className="item-details">
                <h3>Order Data</h3>
                <div className="item-stats">
                  <span className="count">{syncInfo.orderCount || 0} items</span>
                  {syncInfo.orderDate && (
                    <span className="last-sync">
                      Last sync: {new Date(syncInfo.orderDate).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSync('orders')}
              disabled={syncing !== null}
              className={`button ${syncing === 'orders' ? 'loading' : ''}`}
            >
              {syncing === 'orders' ? 'Syncing...' : 'Sync Orders'}
            </button>
          </div>

          {/* Customers */}
          <div className="knowledge-item">
            <div className="item-info">
              <div className="item-icon">👥</div>
              <div className="item-details">
                <h3>Customer Data</h3>
                <div className="item-stats">
                  <span className="count">{syncInfo.customerCount || 0} items</span>
                  {syncInfo.customerDate && (
                    <span className="last-sync">
                      Last sync: {new Date(syncInfo.customerDate).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSync('customers')}
              disabled={syncing !== null}
              className={`button ${syncing === 'customers' ? 'loading' : ''}`}
            >
              {syncing === 'customers' ? 'Syncing...' : 'Sync Customers'}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card quick-actions-card">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <a href="/chatbot/settings" className="quick-action-item">
            <div className="action-icon">⚙️</div>
            <div className="action-content">
              <h3>Settings</h3>
              <p>Configure store name, logo, and sync options</p>
            </div>
          </a>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <div className="banner-icon">ℹ️</div>
        <div className="banner-content">
          <strong>Need Advanced Features?</strong>
          <p>
            Visit the full platform for detailed conversation analytics, advanced bot training, 
            and custom knowledge base management.
          </p>
          <a 
            href="http://localhost:48080/doc.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="button-link"
          >
            Visit Platform →
          </a>
        </div>
      </div>
    </div>
  );
}

ChatbotDashboard.propTypes = {};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

