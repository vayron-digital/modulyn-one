import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Archive, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    archive,
    markAllAsRead
  } = useNotifications();

  const [isOpen, setIsOpen] = React.useState(false);

  const handleNotificationClick = (notification: any) => {
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }

    if (notification.related_to_type === 'task' && notification.related_to_id) {
      navigate(`/tasks/${notification.related_to_id}`);
    } else if ((notification.notification_type === 'lead_updated' || notification.notification_type === 'lead_followup') && notification.related_to_id) {
      navigate(`/leads/${notification.related_to_id}`);
    } else if (notification.notification_type === 'event_reminder' && notification.related_to_id) {
      navigate(`/events/${notification.related_to_id}`);
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return '📋';
      case 'task_updated':
        return '✏️';
      case 'task_due_soon':
        return '⏰';
      case 'task_overdue':
        return '⚠️';
      case 'task_commented':
        return '💬';
      case 'task_status_changed':
        return '🔄';
      case 'task_priority_changed':
        return '🎯';
      case 'lead_updated':
        return '📝';
      case 'lead_followup':
        return '🔔';
      case 'event_reminder':
        return '📅';
      default:
        return '📢';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex items-start gap-3 p-4 cursor-pointer',
                  notification.status === 'unread' && 'bg-muted'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="text-lg">{getNotificationIcon(notification.notification_type)}</span>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true
                    })}
                  </p>
                </div>
                {notification.status === 'unread' && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 