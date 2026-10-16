
import { z } from "zod";
import {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  closeTicket,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
} from "../services/ticket.service.js";

import {
  createTicketSchema,
  updateTicketSchema,
  ticketIdSchema,
  statusSchema,
  prioritySchema,
  assignTicketSchema,
} from "../validators/ticket.validator.js";

const validate = (schema, data, res) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return null;
  }

  return result.data;
};

const run = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const sendSuccess = (res, message, data, status = 200) =>
  res.status(status).json({ success: true, message, data });

export const create = run(async (req, res) => {
  const data = validate(createTicketSchema, req.body, res);
  if (!data) return;

  const ticket = await createTicket(data, req.user);

  sendSuccess(res, "Ticket created", { ticket }, 201);
});

export const list = run(async (req, res) => {
  const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  q: z.string().trim().max(100).optional(),
  assignedTo: z.union([
    z.string().regex(/^[0-9a-fA-F]{24}$/),
    z.literal("unassigned"),
  ]).optional(),
});
  const query = validate(querySchema, req.query, res);
  if (!query) return;

  const data = await listTickets(req.user, query);
  sendSuccess(res, "Tickets retrieved", data);
});

export const getOne = run(async (req, res) => {
  const id = validate(ticketIdSchema, req.params.id, res);
  if (!id) return;

  const ticket = await getTicket(id, req.user);
  sendSuccess(res, "Ticket retrieved", { ticket });
});

export const update = run(async (req, res) => {
  const id = validate(ticketIdSchema, req.params.id, res);
  if (!id) return;

  const data = validate(updateTicketSchema, req.body, res);
  if (!data) return;

  const ticket = await updateTicket(id, data, req.user);
  sendSuccess(res, "Ticket updated", { ticket });
});

export const close = run(async (req, res) => {
  const id = validate(ticketIdSchema, req.params.id, res);
  if (!id) return;

  const ticket = await closeTicket(id, req.user);
  sendSuccess(res, "Ticket closed", { ticket });
});

export const changeStatus = run(async (req, res) => {
  const id = validate(ticketIdSchema, req.params.id, res);
  if (!id) return;

  const data = validate(statusSchema, req.body, res);
  if (!data) return;

  const ticket = await updateTicketStatus(id, data.status);
  sendSuccess(res, "Ticket status updated", { ticket });
});

export const changePriority = run(async (req, res) => {
  const id = validate(ticketIdSchema, req.params.id, res);
  if (!id) return;

  const data = validate(prioritySchema, req.body, res);
  if (!data) return;

  const ticket = await updateTicketPriority(id, data.priority);
  sendSuccess(res, "Ticket priority updated", { ticket });
});

export const assign = run(async (req, res) => {
  const id = validate(ticketIdSchema, req.params.id, res);
  if (!id) return;

  const data = validate(assignTicketSchema, req.body, res);
  if (!data) return;

  const ticket = await assignTicket(id, data.assignedTo);
  sendSuccess(res, "Ticket assigned", { ticket });
});
