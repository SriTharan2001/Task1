import React, { useEffect, useState, useRef } from "react"; // Added useRef
import io, { Socket } from "socket.io-client"; // Import socket.io client

interface NotificationTab {
  label: string;
  count: number;
}

interface Message {
  id: string; // Changed from number to string to match API's _id
  text: string;
  isNew?: boolean;
}

interface NotificationDropdownProps {
  userId: string; // Assuming userId is passed as a prop
  onCountChange?: (count: number) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId, onCountChange }) => {
  const [activeTab, setActiveTab] = useState<"messages" | "feeds">("messages");
  const [notifications, setNotifications] = useState<Message[]>([]);
  const [feeds, setFeeds] = useState<Message[]>([]); // Assuming feeds will also be fetched
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const messageLimit = 3;
  const socketRef = useRef<Socket | null>(null); // Ref to hold the socket instance

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        // Define a more specific type for the notification data from the API
        interface ApiResponseNotification {
          _id: string;
          message: string;
          isRead: boolean;
        }
        const response = await fetch(`/api/notifications/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiResponseNotification[] = await response.json();
        setNotifications(data.map((notif) => ({
          id: notif._id,
          text: notif.message,
          isNew: !notif.isRead,
        })));
      } catch (err: unknown) {
        console.error("Error fetching notifications:", err);
        if (err instanceof Error) {
          setError(`Failed to load notifications: ${err.message}`);
        } else {
          setError("Failed to load notifications.");
        }
        setNotifications([]);
        setFeeds([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchNotifications();
    }
  }, [userId]); // Re-fetch if userId changes

  // Socket.IO integration
  useEffect(() => {
    // Connect to the socket server
    // Assuming the backend is running on the same host and port, or a known URL
    // In a real app, this URL might come from environment variables or a config
    const socketUrl = window.location.origin; // Or a specific URL like "http://localhost:5000"
    socketRef.current = io(socketUrl);

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
    });

    socketRef.current.on("notification_update", (data) => {
      const newNotification = data.payload; // Assuming payload contains the notification object
      if (newNotification && newNotification.userId === userId) { // Ensure notification is for the current user
        setNotifications((prevNotifications) => {
          // Add new notification and potentially limit the list
          const updatedNotifications = [
            { id: newNotification._id, text: newNotification.message, isNew: !newNotification.isRead },
            ...prevNotifications
          ];
          // Keep only the latest N notifications if needed
          return updatedNotifications.slice(0, messageLimit + 5); // Keep a few extra
        });
      }
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Cleanup socket connection on component unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]); // Re-establish connection if userId changes

  // Calculate counts for tabs
  const messageCount = notifications.filter((m) => m.isNew).length;
  const feedCount = feeds.filter((f) => f.isNew).length; // Assuming feeds can also be new

  const tabs: Record<"messages" | "feeds", NotificationTab> = {
    messages: { label: "Messages", count: messageCount },
    feeds: { label: "Feeds", count: feedCount },
  };

  const currentData = activeTab === "messages" ? notifications : feeds;

  // Send count to parent whenever notifications change
  useEffect(() => {
    if (onCountChange) {
      onCountChange(messageCount); // Only sending message count as per original logic
    }
  }, [notifications, onCountChange, messageCount]); // Depend on notifications and messageCount

  // Function to mark a notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === id ? { ...notif, isNew: false } : notif
        )
      );
      // Update parent count if needed
      if (onCountChange) {
        const notificationToUpdate = notifications.find(n => n.id === id);
        if (notificationToUpdate && notificationToUpdate.isNew) {
          onCountChange(messageCount - 1);
        }
      }
    } catch (err: unknown) {
      console.error("Error marking notification as read:", err);
      if (err instanceof Error) {
        setError(`Failed to mark notification as read: ${err.message}`);
      } else {
        setError("Failed to mark notification as read.");
      }
    }
  };

  // Function to handle clicking on a notification item
  const handleNotificationClick = (item: Message) => {
    if (item.isNew) {
      handleMarkAsRead(item.id);
    }
    // Optionally, navigate to a specific page or perform another action
    console.log("Clicked notification:", item.text);
  };

  return (
    <div className="w-80 bg-white shadow-lg rounded-2xl p-4 border">
      {/* Header */}
      <div className="text-center mb-2">
        <p className="font-bold text-gray-800">{tabs[activeTab].count} New</p>
        <p className="text-sm text-gray-500">User Notification</p>
      </div>

      <hr />

      {/* Tabs */}
      <div className="flex justify-between mt-2">
        {Object.entries(tabs).map(([key, tab]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "messages" | "feeds")}
            className={`flex-1 py-2 text-sm ${
              activeTab === key
                ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                : "text-gray-700 font-normal"
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="h-48 overflow-y-auto mt-2 text-sm">
        {loading && <p className="text-center text-gray-500">Loading notifications...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && currentData.length > 0 ? (
          <>
            <ul className="space-y-2">
              {currentData.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-2 rounded-md hover:bg-gray-100 text-gray-800 font-normal cursor-pointer ${
                    item.isNew ? "bg-blue-100 font-semibold" : "bg-gray-50"
                  }`}
                >
                  {item.text}
                </li>
              ))}
            </ul>

            {/* Conditional warning for too many messages */}
            {activeTab === "messages" && notifications.length > messageLimit && (
              <div className="mt-3 text-red-600 text-xs font-semibold text-center">
                ⚠️ You have too many messages, please check them soon.
              </div>
            )}
          </>
        ) : (
          !loading && !error && (
            <div className="flex items-center justify-center h-full text-gray-400">
              No {activeTab === "messages" ? "messages" : "feeds"} yet
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="text-center border-t pt-2">
        <button className="text-sm text-gray-700 hover:underline">
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
