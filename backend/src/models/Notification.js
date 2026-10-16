import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "ticket:assigned",
        "ticket:updated",
        "ticket:status_changed",
        "ticket:priority_changed",
        "ticket:closed",
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

export default mongoose.model(
  "Notification",
  notificationSchema
);