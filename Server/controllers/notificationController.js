const Notification = require("../Models/Notification");
const mongoose = require("mongoose");

// ➤ Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    const notification = new Notification({ userId, message, type });
    await notification.save();

    // Optional: push via socket.io if available
    if (req.io) {
      req.io.emit("notification_update", { type: "NEW_NOTIFICATION", payload: notification });
    }

    res.status(201).json(notification);
  } catch (err) {
    console.error("Create Notification Error:", err);
    res.status(500).json({ message: "Failed to create notification" });
  }
};

// ➤ Fetch all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("Fetch Notification Error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// ➤ Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification id" });
    }

    const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("MarkAsRead Error:", err);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// ➤ Delete a notification
// exports.deleteNotification = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid notification id" });
//     }

//     const deleted = await Notification.findByIdAndDelete(id);
//     if (!deleted) {
//       return res.status(404).json({ message: "Notification not found" });
//     }

//     res.json({ message: "Notification deleted successfully" });
//   } catch (err) {
//     console.error("Delete Notification Error:", err);
//     res.status(500).json({ message: "Failed to delete notification" });
//   }
// };

// ➤ Count unread notifications
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const count = await Notification.countDocuments({ userId, isRead: false });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error("Unread Count Error:", err);
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};
