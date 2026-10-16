
import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(5000),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().trim().min(5).max(120).optional(),
  description: z.string().trim().min(10).max(5000).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
);

export const ticketIdSchema = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  "Invalid ticket ID"
);

export const statusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

export const prioritySchema = z.object({
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export const assignTicketSchema = z.object({
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable(),
});
