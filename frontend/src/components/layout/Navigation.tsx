import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../common/NotificationBell';

export default function Navigation() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-primary-dark shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="Modulyn One" 
                  style={{ 
                    height: '32px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }} 
                />
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <NotificationBell />
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-white mr-4">{user?.email}</span>
                  <button
                    onClick={signOut}
                    className="text-white hover:text-primary"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 