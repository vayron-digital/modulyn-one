import React from 'react';

interface ActivityItem {
  icon: React.ReactNode;
  text: string;
  time: string;
  avatar: string;
}

interface RecentActivityWidgetProps {
  recentActivity: ActivityItem[];
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ recentActivity }) => (
  <ul className="space-y-3">
    {recentActivity.map((item, idx) => (
      <li key={idx} className="flex items-center gap-3">
        <img src={item.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-black" />
        <span className="text-black">{item.text}</span>
        <span className="ml-auto text-xs text-gray-500">{item.time}</span>
      </li>
    ))}
  </ul>
);

export default RecentActivityWidget; 