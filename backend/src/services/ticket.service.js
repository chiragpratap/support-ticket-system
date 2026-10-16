 import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import {
  emitToUser,
  emitToAdmins,
} from "../socket.js";
import { createNotification } from "./notification.service.js";

// Prepare a safe, small payload for Socket.IO events.
function ticketEventData(ticket) {
  return {
    ticketId: ticket._id.toString(),
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,

    assignedTo:
      ticket.assignedTo?._id?.toString() ??
      ticket.assignedTo?.toString() ??
      null,

    createdBy:
      ticket.createdBy?._id?.toString() ??
      ticket.createdBy?.toString(),

    updatedAt: ticket.updatedAt,
  };
}

// Notify ticket owner, assignee, and admin dashboard.
 
 
async function notifyTicketChange(ticket, event) {
  const payload = ticketEventData(ticket);

  // Collect unique recipients.
  const recipients = [
    ...new Set(
      [payload.createdBy, payload.assignedTo].filter(Boolean)
    ),
  ];

  // Save notifications and emit the saved objects.
  if (event !== "ticket:created") {
    try {
      const savedNotifications = await Promise.all(
        recipients.map((recipient) =>
          createNotification({
            recipient,
            ticketId: payload.ticketId,
            type: event,
          })
        )
      );

      savedNotifications.forEach((notification, index) => {
        if (notification) {
          emitToUser(
            recipients[index],
            "notification:new",
            notification
          );
        }
      });
    } catch (error) {
      console.error(
        "Failed to save ticket notifications:",
        error
      );
    }
  }

  // Emit ticket events.
  for (const recipient of recipients) {
    emitToUser(recipient, event, payload);
  }

  // Refresh admin dashboard.
  emitToAdmins("ticket:changed", payload);
  emitToAdmins("dashboard:refresh", {
    reason: event,
  });
}



const makeError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const isAdmin = (user) => user.role === "admin";

// Find a ticket the current user is allowed to access.
const findAccessibleTicket = async (ticketId, user) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw makeError("Invalid ticket ID", 400);
  }

  const filter = { _id: ticketId };

  if (!isAdmin(user)) {
    filter.createdBy = user._id;
  }

  const ticket = await Ticket.findOne(filter)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  if (!ticket) {
    throw makeError("Ticket not found", 404);
  }

  return ticket;
};

// Create a ticket.
export const createTicket = async (data, user) => {
  const ticket = await Ticket.create({
    title: data.title,
    description: data.description,
    priority: data.priority ?? "medium",
    createdBy: user._id,
  });

  await notifyTicketChange(ticket, "ticket:created");

  return ticket;
};

// List tickets with pagination and optional filters.
export const listTickets = async (user, query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

  const filter = {};

  if (!isAdmin(user)) {
    filter.createdBy = user._id;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (isAdmin(user) && query.assignedTo) {
    filter.assignedTo =
      query.assignedTo === "unassigned"
        ? null
        : query.assignedTo;
  }

  if (query.q) {
    const escaped = query.q.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const search = new RegExp(escaped, "i");

    filter.$or = [
      { title: search },
      { description: search },
    ];
  }

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Ticket.countDocuments(filter),
  ]);

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get one accessible ticket.
export const getTicket = async (ticketId, user) => {
  return findAccessibleTicket(ticketId, user);
};

// Update ticket title or description.
export const updateTicket = async (ticketId, data, user) => {
  const ticket = await findAccessibleTicket(ticketId, user);

  if (!isAdmin(user) && ticket.status !== "open") {
    throw makeError(
      "Only open tickets can be edited",
      403
    );
  }

  if (ticket.status === "closed") {
    throw makeError("Closed tickets cannot be edited", 400);
  }

  if (data.title !== undefined) {
    ticket.title = data.title;
  }

  if (data.description !== undefined) {
    ticket.description = data.description;
  }

  await ticket.save();

  await notifyTicketChange(ticket, "ticket:updated");

  return ticket;
};

// Close a ticket.
export const closeTicket = async (ticketId, user) => {
  const ticket = await findAccessibleTicket(ticketId, user);

  if (ticket.status === "closed") {
    throw makeError("Ticket is already closed", 400);
  }

  ticket.status = "closed";
  ticket.closedAt = new Date();

  await ticket.save();

  await notifyTicketChange(ticket, "ticket:closed");

  return ticket;
};

// Admin-only status update.
// Keep the admin authorization middleware on the route.
export const updateTicketStatus = async (ticketId, status) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw makeError("Invalid ticket ID", 400);
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw makeError("Ticket not found", 404);
  }

  if (ticket.status === "closed") {
    throw makeError(
      "Closed tickets cannot be reopened",
      400
    );
  }

  ticket.status = status;
  ticket.closedAt =
    status === "closed" ? new Date() : null;

  await ticket.save();

   await notifyTicketChange(ticket, "ticket:status_changed");

  return ticket;
};

// Admin-only priority update.
export const updateTicketPriority = async (
  ticketId,
  priority
) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw makeError("Invalid ticket ID", 400);
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw makeError("Ticket not found", 404);
  }

  if (ticket.status === "closed") {
    throw makeError(
      "Closed tickets cannot be changed",
      400
    );
  }

  ticket.priority = priority;

  await ticket.save();

   await notifyTicketChange(ticket, "ticket:priority_changed");

  return ticket;
};

// Admin-only assignment update.
export const assignTicket = async (
  ticketId,
  assignedTo
) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    throw makeError("Invalid ticket ID", 400);
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw makeError("Ticket not found", 404);
  }

  if (ticket.status === "closed") {
    throw makeError(
      "Closed tickets cannot be assigned",
      400
    );
  }

  if (assignedTo !== null) {
    if (!mongoose.isValidObjectId(assignedTo)) {
      throw makeError("Invalid assignee ID", 400);
    }

    const admin = await User.findOne({
      _id: assignedTo,
      role: "admin",
    });

    if (!admin) {
      throw makeError(
        "Assignee must be an admin",
        400
      );
    }
  }

  ticket.assignedTo = assignedTo;

  await ticket.save();

  await notifyTicketChange(ticket, "ticket:assigned");

  return ticket;
};