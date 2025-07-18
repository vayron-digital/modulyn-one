import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFeatures } from '../hooks/useFeatures';
import { DESIGN } from '../lib/design';

export default function Navigation() {
  const location = useLocation();
  const features = useFeatures();

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8"
                style={{ height: DESIGN.logo.height, width: DESIGN.logo.width }}
                src="/logo.png"
                alt="Your Company"
              />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`${
                    location.pathname === '/'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } rounded-md px-3 py-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>
                {features.leads !== false && (
                  <Link
                    to="/leads"
                    className={`${
                      location.pathname === '/leads'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Leads
                  </Link>
                )}
                {features.dumped_leads && (
                  <Link
                    to="/dumped-leads"
                    className={`${
                      location.pathname === '/dumped-leads'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } rounded-md px-3 py-2 text-sm font-medium`}
                  >
                    Dumped Leads
                  </Link>
                )}
                <Link
                  to="/calls"
                  className={`${
                    location.pathname === '/calls'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } rounded-md px-3 py-2 text-sm font-medium`}
                >
                  Calls
                </Link>
                <Link
                  to="/reports"
                  className={`${
                    location.pathname === '/reports'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } rounded-md px-3 py-2 text-sm font-medium`}
                >
                  Reports
                </Link>
              </div>
            </div>
          </div>
          {/* ... existing user menu ... */}
        </div>
      </div>
    </nav>
  );
} 