import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { getCapexRequestsFilterAsync } from "../../services/capexService";
import { IModalProps, INotificationItem } from "../../types/commonTypes";
// import { convertCurrencyLabel } from "../../utils/common";
import { deleteNotificationAsync, updateNotificationAsync } from "../../services/notificationService";

interface INotificationContent extends IModalProps {
  data?: INotificationItem[]; // Optional prop to receive data from parent
}

const NotificationContent: React.FC<INotificationContent> = ({ data, closeModal, trigger }) => {
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [enableOptions, setEnableOptions] = useState<number | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setNotifications(data || []);
  }, [data]);

  const handleFilterChange = (newFilter: 'all' | 'read' | 'unread') => {
    setFilter(newFilter);
  };

  const handleDeleteNotifications = async (index: number) => {
    try {
      console.log(index);
      setEnableOptions(null);
      await deleteNotificationAsync([filteredNotifications[index].id])
      console.log("deleted");
      trigger();
    } catch {
      setEnableOptions(null);
    }
  }

  const handleNotificationClick = async (notification: INotificationItem) => {
    // Mark as read when clicked
    // if (!notification.isRead) {
    //   markAsRead(notification.id);
    // }
    notification.isRead = true;
    await updateNotificationAsync(notification.id, notification)
    // Navigate to the capex request detail page
    navigate(`/${notification.notificationType}/${notification.uniqueId}`);
    closeModal()
  };

  useEffect(() => {
    const handleScroll = () => {
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [openDropdown]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'read') return notification.isRead === true;
    if (filter === 'unread') return notification.isRead === false;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-50" style={{ minWidth: "450px", width:"500px" }}>
      {/* Modern Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-violet-700 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Notifications</h2>
              <p className="text-sm text-slate-500">Stay updated with your latest activities</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-violet-50 text-violet-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-violet-100">
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => handleFilterChange('all')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'all'
              ? "bg-white text-violet-700 shadow-sm"
              : "text-slate-600 hover:text-violet-800"
              }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'unread'
              ? "bg-white text-violet-700 shadow-sm"
              : "text-slate-600 hover:text-violet-800"
              }`}
          >
            Unread
          </button>
          <button
            onClick={() => handleFilterChange('read')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === 'read'
              ? "bg-white text-violet-700 shadow-sm"
              : "text-slate-600 hover:text-violet-800"
              }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-grow overflow-y-auto" ref={tableContainerRef} onClick={() => {
        if (enableOptions != null) {
          setEnableOptions(null);
        }
      }}>
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="w-20 h-20 bg-violet-50 border border-violet-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-950 mb-2">No notifications found</h3>
            <p className="text-sm text-slate-500 text-center max-w-sm">
              You're all caught up! New notifications will appear here when they arrive.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {filteredNotifications.map((notification, i) => (
              <div
                key={notification.id}
                className={`group relative bg-white rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md transition-all duration-200 cursor-pointer ${!notification.isRead ? 'ring-2 ring-violet-100 bg-violet-50/40' : ''
                  }`}
                onClick={() => {
                  if (enableOptions == null) {
                    handleNotificationClick(notification);
                  }
                }}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${!notification.isRead
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-slate-100 text-slate-500'
                      }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-violet-700 rounded-full"></div>
                            )}
                            <h4 className="text-sm font-semibold text-slate-950 truncate">
                              {notification.title}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                              {notification.description && notification.description.length > 150
                                ? `${notification.description.slice(0, 150)}...`
                                : notification.description}
                            </span>
                            {/* <span>•</span>
                            <span>{notification.status}</span> */}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-slate-500">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                              {/* <span className="text-xs font-medium text-green-600">
                                {convertCurrencyLabel(notification.currency || "OMR")} {notification.estimatedBudget?.toLocaleString()}
                              </span> */}
                            </div>
                            {/* <div className="flex items-center space-x-2">
                              <ShowStatus status={Number(notification.status)} type="rfps" />
                            </div> */}
                          </div>
                        </div>

                        {/* Options Menu */}
                        <div className="flex-shrink-0 ml-2">
                          <button
                            className="p-1 text-slate-400 hover:text-violet-800 rounded-lg hover:bg-violet-50 transition-colors duration-200"
                            onClick={(e) => {
                              setEnableOptions(i);
                              e.stopPropagation();
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          <div className={`absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 ${i === enableOptions ? "block" : "hidden"
                            }`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotifications(i);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationContent;
