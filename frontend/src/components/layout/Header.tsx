import React from 'react';
import styles from './DashboardLayout.module.css';

export interface HeaderTab {
  label: string;
  href: string;
  active?: boolean;
  badge?: number | string;
  onClick?: () => void;
}

interface HeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  tabs?: HeaderTab[];
}

const Header: React.FC<HeaderProps> = ({ title, breadcrumbs, tabs }) => {
  return (
    <header className={styles.mainHeader}>
      {breadcrumbs && (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          {breadcrumbs.map((bc, idx) => (
            <span key={bc.label}>
              {bc.href ? (
                <a href={bc.href}>{bc.label}</a>
              ) : (
                <span>{bc.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && ' / '}
            </span>
          ))}
        </nav>
      )}
      <h1 className={styles.title}>{title}</h1>
      {tabs && tabs.length > 0 && (
        <nav className={styles.navTabs} id="nav-tabs">
          {tabs.map(tab => (
            <a
              key={tab.label}
              href={tab.href}
              className={tab.active ? 'active' : ''}
              onClick={tab.onClick}
            >
              {tab.label}
              {tab.badge !== undefined && <span>{tab.badge}</span>}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header; 