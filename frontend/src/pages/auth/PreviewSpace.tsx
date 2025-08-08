import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CreditCard, Crown, Settings, User, LogOut, Sparkles, Zap, Target } from 'lucide-react';
import UserStatusDebugger from '../../components/debug/UserStatusDebugger';

const PreviewSpace: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user?.id) {
        navigate('/login');
        return;
      }

      try {
        // Get user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // If user has tenant_id, they already have full access
        if (profile?.tenant_id) {
          navigate('/dashboard');
          return;
        }

        setProfile(profile);
      } catch (error) {
        console.error('Error checking user status:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [user, navigate]);

  const handleUpgrade = () => {
    navigate('/account-creation');
  };

  const handleSettings = () => {
    // Limited settings - only profile management
    navigate('/preview/settings');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Modulyn
              </span>
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                Preview
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSettings}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={signOut}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome, {profile?.full_name || 'there'}! 👋
                </h1>
                <p className="text-lg text-gray-600">
                  You're one step away from unlocking the full power of Modulyn CRM
                </p>
              </div>
              <div className="hidden md:block">
                <Crown className="w-16 h-16 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA - Super Prominent */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="w-6 h-6" />
                    <span className="text-lg font-semibold">Complete Your Setup</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">
                    Start Your Free Trial + Unlock Full CRM Access
                  </h2>
                  <p className="text-indigo-100 mb-6 max-w-2xl">
                    Get instant access to leads management, property tracking, team collaboration, 
                    automated workflows, and advanced analytics. No commitment, cancel anytime.
                  </p>
                  <button
                    onClick={handleUpgrade}
                    className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Complete Setup & Start Free Trial</span>
                  </button>
                </div>
                <div className="hidden lg:block ml-8">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <Zap className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Preview Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* What You'll Get */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative">
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Lead Management</h3>
            <p className="text-gray-600 mb-4">
              Capture, track, and convert leads with automated workflows and smart insights.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
              🔒 Available after upgrade
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative">
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs font-bold">✓</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Profile Settings</h3>
            <p className="text-gray-600 mb-4">
              Manage your account, preferences, and notification settings.
            </p>
            <button
              onClick={handleSettings}
              className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              Access Settings →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative">
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-xs font-bold">📊</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Analytics & Reports</h3>
            <p className="text-gray-600 mb-4">
              Get powerful insights into your sales performance and team productivity.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
              🔒 Available after upgrade
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative">
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-xs font-bold">🏢</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Property Management</h3>
            <p className="text-gray-600 mb-4">
              Organize and showcase your property portfolio with advanced search and filters.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
              🔒 Available after upgrade
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative">
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-xs font-bold">👥</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Team Collaboration</h3>
            <p className="text-gray-600 mb-4">
              Work seamlessly with your team using shared tasks, notes, and communication tools.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
              🔒 Available after upgrade
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative">
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-xs font-bold">⚡</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Automation</h3>
            <p className="text-gray-600 mb-4">
              Automate follow-ups, notifications, and workflows to never miss an opportunity.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
              🔒 Available after upgrade
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Real Estate Business? 🚀
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of successful real estate professionals who've accelerated their growth with Modulyn.
            Start your free trial today - no credit card required for the first 14 days.
          </p>
          <button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg transform hover:scale-105 mx-auto flex items-center space-x-2"
          >
            <Crown className="w-5 h-5" />
            <span>Start Free Trial Now</span>
          </button>
        </div>
      </main>
      
      {/* Debug component - remove in production */}
      {process.env.NODE_ENV === 'development' && <UserStatusDebugger />}
    </div>
  );
};

export default PreviewSpace;
