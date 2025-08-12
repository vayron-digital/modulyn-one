import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FullScreenLoader from './FullScreenLoader'
import { HomeIcon, UsersIcon, ChartBarIcon, CogIcon, PhoneIcon, ClipboardDocumentCheckIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { useFeatures } from '../hooks/useFeatures';
import { DESIGN } from '../lib/design';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const features = useFeatures();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', user.id)
          .single()
        
        setIsAdmin(profile?.is_admin || profile?.role === 'Administrator' || false)
      }
    }

    checkAdminStatus()
  }, [])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
      setIsLoggingOut(false)
    }
  }

  const navItems = [
    features.dashboard !== false && { path: '/', label: 'Dashboard', icon: HomeIcon },
    features.leads !== false && { path: '/leads', label: 'Leads', icon: UsersIcon },
    features.properties !== false && { path: '/properties', label: 'Properties', icon: BuildingOfficeIcon },
    features.contacts && { path: '/contacts', label: 'Contacts Management', icon: PhoneIcon },
    features.tasks !== false && { path: '/tasks', label: 'Tasks', icon: ClipboardDocumentCheckIcon },
    features.team && { path: '/team', label: 'Team', icon: UserGroupIcon },
    features.reports && { path: '/reports', label: 'Reports', icon: ChartBarIcon },
    features.settings !== false && { path: '/settings', label: 'Settings', icon: CogIcon },
  ].filter(Boolean);

  const adminNavItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: HomeIcon },
    { 
      path: '/admin/users', 
      label: 'User Management', 
      icon: UserGroupIcon,
      subItems: [
        { path: '/admin/users/list', label: 'Users List' },
        { path: '/admin/users/new', label: 'Add User' },
        { path: '/admin/users/hierarchy', label: 'Team Hierarchy' }
      ]
    },
    { path: '/admin/reports', label: 'Reports', icon: ChartBarIcon },
    { path: '/admin/settings', label: 'Settings', icon: CogIcon }
  ]

  const showContent = isOpen || isHovered

  // Ensure theme values are strings
  const primaryColor = typeof DESIGN.colors.primary === 'string' ? DESIGN.colors.primary : '#ff0141';

  return (
    <>
      {isLoggingOut && <FullScreenLoader />}
      <div 
        className={`flex flex-col transition-all duration-300 ease-in-out`}
        style={{ width: isOpen || isHovered ? DESIGN.sidebarWidth : 80, background: primaryColor, color: '#fff' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.path
                      ? 'bg-[#b29c6d] text-white'
                      : 'text-gray-300 hover:bg-[#b29c6d] hover:text-white'
                  }`}
                  title={!showContent ? item.label : undefined}
                >
                  <Icon
                    className={`${showContent ? 'mr-3' : 'mx-auto'} h-6 w-6 ${
                      location.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  {showContent && <span>{item.label}</span>}
                </Link>
              )
            })}
            {isAdmin && (
              <div className="border-t border-gray-700 my-2"></div>
            )}
            {isAdmin && adminNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.path
                      ? 'bg-[#b29c6d] text-white'
                      : 'text-gray-300 hover:bg-[#b29c6d] hover:text-white'
                  }`}
                  title={!showContent ? item.label : undefined}
                >
                  <Icon
                    className={`${showContent ? 'mr-3' : 'mx-auto'} h-6 w-6 ${
                      location.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  {showContent && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-[#b29c6d] p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-shrink-0 w-full group block"
            title={!showContent ? "Sign out" : undefined}
          >
            <div className="flex items-center">
              <div>
                <svg
                  className={`${showContent ? 'inline-block' : 'mx-auto'} h-6 w-6 text-gray-400 group-hover:text-white`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              {showContent && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white">Sign out</p>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </>
  )
} 