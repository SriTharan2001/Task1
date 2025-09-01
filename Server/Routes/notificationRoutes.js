const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Create notification
router.post("/", notificationController.createNotification);

// Get all notifications for user
router.get("/:userId", notificationController.getUserNotifications);

// Mark one notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Delete notification
// router.delete("/:id", notificationController.deleteNotification);

// Get unread count
router.get("/:userId/unread/count", notificationController.getUnreadCount);

module.exports = router;
