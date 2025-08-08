import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, User, Mail, Camera, Save, Crown, CreditCard } from 'lucide-react';

const PreviewSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    profile_image_url: ''
  });

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user?.id) {
        navigate('/login');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // If user has tenant_id, redirect to full settings
        if (profile?.tenant_id) {
          navigate('/settings');
          return;
        }

        setProfile(profile);
        setFormData({
          full_name: profile.full_name || '',
          email: profile.email || '',
          profile_image_url: profile.profile_image_url || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          profile_image_url: formData.profile_image_url
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => ({
        ...prev,
        full_name: formData.full_name,
        profile_image_url: formData.profile_image_url
      }));

      // Show success message (you can replace with toast)
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/account-creation');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/preview')}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Preview Settings
                </span>
              </div>
            </div>
            
            <button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upgrade Banner */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-2">🔒 Limited Settings Access</h2>
                <p className="text-indigo-100">
                  Unlock full settings, team management, integrations, and more with a paid plan.
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                className="bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Complete Setup</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
                <p className="text-gray-600 text-sm">Update your basic profile details</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {formData.profile_image_url ? (
                      <img
                        src={formData.profile_image_url}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{formData.full_name || 'User'}</h4>
                    <p className="text-sm text-gray-500">Update your profile photo</p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Profile Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.profile_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, profile_image_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Locked Features Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h4 className="font-bold text-gray-900 mb-4">🔒 Premium Features</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Team Management</span>
                  <span className="text-indigo-600 font-medium">Pro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Integrations</span>
                  <span className="text-indigo-600 font-medium">Pro</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Advanced Analytics</span>
                  <span className="text-purple-600 font-medium">Plus</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Custom Workflows</span>
                  <span className="text-purple-600 font-medium">Plus</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API Access</span>
                  <span className="text-purple-600 font-medium">Plus</span>
                </div>
              </div>
              <button
                onClick={handleUpgrade}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Unlock All Features
              </button>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 p-6">
              <h4 className="font-bold text-green-900 mb-2">✨ What's Included</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 14-day free trial</li>
                <li>• No setup fees</li>
                <li>• Cancel anytime</li>
                <li>• Full CRM access</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PreviewSettings;
