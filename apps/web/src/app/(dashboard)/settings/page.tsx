'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calendar,
  Globe,
  Smartphone
} from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  timezone: z.string(),
  avatar: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const notificationSettings = [
  {
    id: 'email_bet_results',
    label: 'Bet Results',
    description: 'Get notified when your bets are settled',
    enabled: true
  },
  {
    id: 'email_weekly_summary',
    label: 'Weekly Summary',
    description: 'Receive weekly performance reports',
    enabled: true
  },
  {
    id: 'email_insights',
    label: 'AI Insights',
    description: 'Get personalized betting recommendations',
    enabled: false
  },
  {
    id: 'push_bet_reminders',
    label: 'Bet Reminders',
    description: 'Remind me about upcoming games',
    enabled: true
  },
  {
    id: 'push_limit_warnings',
    label: 'Limit Warnings',
    description: 'Alert when approaching betting limits',
    enabled: true
  }
]

const bettingLimits = {
  dailyLimit: 500,
  weeklyLimit: 2000,
  monthlyLimit: 5000,
  enabled: true
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState(notificationSettings)
  const [limits, setLimits] = useState(bettingLimits)
  const [isLoading, setIsLoading] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'John Doe',
      email: 'john@example.com',
      timezone: 'America/New_York',
    }
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' },
  ]

  const handleProfileSubmit = async (data: any) => {
    setIsLoading(true)
    // API call to update profile
    setTimeout(() => {
      setIsLoading(false)
      console.log('Profile updated:', data)
    }, 1000)
  }

  const handlePasswordSubmit = async (data: any) => {
    setIsLoading(true)
    // API call to change password
    setTimeout(() => {
      setIsLoading(false)
      passwordForm.reset()
      console.log('Password changed')
    }, 1000)
  }

  const handleNotificationToggle = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, enabled: !notif.enabled }
          : notif
      )
    )
  }

  const handleLimitChange = (field: string, value: number) => {
    setLimits(prev => ({ ...prev, [field]: value }))
  }

  const handleDataExport = async () => {
    setIsLoading(true)
    // API call to generate export
    setTimeout(() => {
      setIsLoading(false)
      // Download would start here
      console.log('Data export initiated')
    }, 2000)
  }

  const handleAccountDelete = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsLoading(true)
      // API call to delete account
      setTimeout(() => {
        setIsLoading(false)
        console.log('Account deletion initiated')
      }, 2000)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'limits', label: 'Betting Limits', icon: DollarSign },
    { id: 'data', label: 'Data & Privacy', icon: Download },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                    <p className="text-xs text-gray-500">
                      JPG, GIF or PNG. 1MB max.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...profileForm.register('name')}
                      placeholder="Enter your full name"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-red-600">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register('email')}
                      placeholder="Enter your email"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      {...profileForm.register('timezone')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">Premium Member</Badge>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about your betting activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    {notifications.filter(n => n.id.startsWith('email')).map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{notification.label}</div>
                          <div className="text-sm text-gray-600">{notification.description}</div>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle(notification.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notification.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notification.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                  <div className="space-y-4">
                    {notifications.filter(n => n.id.startsWith('push')).map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{notification.label}</div>
                          <div className="text-sm text-gray-600">{notification.description}</div>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle(notification.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notification.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notification.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    placeholder="Enter current password"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-red-600">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      {...passwordForm.register('newPassword')}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    placeholder="Confirm new password"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Shield className="mr-2 h-4 w-4" />
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Authenticator App</div>
                  <div className="text-sm text-gray-600">
                    Use an authenticator app to generate verification codes
                  </div>
                </div>
                <Button variant="outline">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Betting Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Responsible Gambling Limits</CardTitle>
              <CardDescription>
                Set limits to help manage your betting activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800">Limits Enabled</div>
                      <div className="text-sm text-green-600">
                        Spending limits are currently active
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setLimits(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      limits.enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        limits.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Daily Limit ($)</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={limits.dailyLimit}
                      onChange={(e) => handleLimitChange('dailyLimit', Number(e.target.value))}
                      disabled={!limits.enabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weeklyLimit">Weekly Limit ($)</Label>
                    <Input
                      id="weeklyLimit"
                      type="number"
                      value={limits.weeklyLimit}
                      onChange={(e) => handleLimitChange('weeklyLimit', Number(e.target.value))}
                      disabled={!limits.enabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyLimit">Monthly Limit ($)</Label>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      value={limits.monthlyLimit}
                      onChange={(e) => handleLimitChange('monthlyLimit', Number(e.target.value))}
                      disabled={!limits.enabled}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important</p>
                      <p>
                        Limit changes take 24 hours to take effect. This cooling-off period helps ensure responsible gambling practices.
                      </p>
                    </div>
                  </div>
                </div>

                <Button disabled={!limits.enabled}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Limits
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data & Privacy Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>
                Download your betting data and account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" onClick={handleDataExport} disabled={isLoading}>
                    <Download className="mr-2 h-4 w-4" />
                    {isLoading ? 'Generating...' : 'Export All Data'}
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Betting History
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Exports include your betting history, account settings, and personal data in CSV and JSON formats.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-red-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">Delete Account</h4>
                      <p className="text-sm text-red-600 mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleAccountDelete}
                      disabled={isLoading}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}