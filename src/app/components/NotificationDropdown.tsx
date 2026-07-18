import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, Trash2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  currentUser: any;
}

interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAtUtc: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ currentUser }) => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      if (!currentUser?.id) return;
      const res = await axios.get(`/api/notifications?userId=${currentUser.id}`);
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 flex flex-col items-center">
                <Bell className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`group p-4 hover:bg-gray-50 transition-colors cursor-default ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                    onClick={(e) => !n.isRead && handleMarkAsRead(n.id, e)}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        n.type === 'Error' ? 'bg-red-100 text-red-600' :
                        n.type === 'Warning' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAtUtc), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button onClick={(e) => handleMarkAsRead(n.id, e)} className="text-gray-400 hover:text-blue-600" title="Mark as read">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={(e) => handleDelete(n.id, e)} className="text-gray-400 hover:text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
