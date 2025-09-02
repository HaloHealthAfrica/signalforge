import { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette,
  Save
} from 'lucide-react';

export const SettingsView = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'trading' | 'notifications' | 'api' | 'security'>('general')

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'trading', label: 'Trading', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Save },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="h-full bg-dark-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-dark-400">Configure your trading platform preferences</p>
        </div>

        {/* Settings Layout */}
        <div className="flex space-x-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="trading-card">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-600 text-white'
                          : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <div className="trading-card">
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Theme
                    </label>
                    <select className="trading-select w-full">
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Language
                    </label>
                    <select className="trading-select w-full">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Time Zone
                    </label>
                    <select className="trading-select w-full">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Date Format
                    </label>
                    <select className="trading-select w-full">
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trading' && (
              <div className="trading-card">
                <h3 className="text-lg font-semibold text-white mb-4">Trading Preferences</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Default Risk Per Trade (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="2"
                      step="0.1"
                      className="trading-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Default Position Size ($)
                    </label>
                    <input
                      type="number"
                      defaultValue="1000"
                      step="100"
                      className="trading-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Commission Per Trade ($)
                    </label>
                    <input
                      type="number"
                      defaultValue="1.00"
                      step="0.01"
                      className="trading-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Slippage Tolerance (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="0.1"
                      step="0.01"
                      className="trading-input w-full"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoStopLoss"
                      defaultChecked
                      className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="autoStopLoss" className="text-sm text-white">
                      Auto-calculate stop loss based on ATR
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="confirmOrders"
                      defaultChecked
                      className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="confirmOrders" className="text-sm text-white">
                      Require confirmation for all orders
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="trading-card">
                <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Signal Alerts</p>
                      <p className="text-sm text-dark-400">Get notified when new AI signals are generated</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Order Executions</p>
                      <p className="text-sm text-dark-400">Notifications when orders are filled</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Risk Alerts</p>
                      <p className="text-sm text-dark-400">Warnings when approaching risk limits</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Market Updates</p>
                      <p className="text-sm text-dark-400">Daily market summary and analysis</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Notification Method
                    </label>
                    <select className="trading-select w-full">
                      <option value="email">Email</option>
                      <option value="push">Push Notifications</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="trading-card">
                <h3 className="text-lg font-semibold text-white mb-4">API Configuration</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Polygon.io API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your API key"
                      className="trading-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      TwelveData API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your API key"
                      className="trading-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Tradier API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your API key"
                      className="trading-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Tradier Access Token
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your access token"
                      className="trading-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Account ID
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your account ID"
                      className="trading-input w-full"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="paperTrading"
                      defaultChecked
                      className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="paperTrading" className="text-sm text-white">
                      Enable paper trading mode
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="trading-card">
                <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="trading-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="trading-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="trading-input w-full"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="twoFactor"
                      className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="twoFactor" className="text-sm text-white">
                      Enable two-factor authentication
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sessionTimeout"
                      defaultChecked
                      className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="sessionTimeout" className="text-sm text-white">
                      Auto-logout after 30 minutes of inactivity
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      IP Whitelist
                    </label>
                    <textarea
                      placeholder="Enter allowed IP addresses (one per line)"
                      rows={3}
                      className="trading-input w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button className="trading-button-primary px-6 py-3">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
