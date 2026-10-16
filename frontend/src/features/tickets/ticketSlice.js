 import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

// GET /api/v1/tickets
export const fetchTickets = createAsyncThunk(
  "tickets/fetchTickets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/tickets");
      const data = response.data.data;
      const tickets = Array.isArray(data) ? data : data?.tickets;

      if (!Array.isArray(tickets)) {
        return rejectWithValue("Unexpected ticket API response.");
      }

      return tickets;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tickets."
      );
    }
  }
);

// POST /api/v1/tickets
export const createTicket = createAsyncThunk(
  "tickets/createTicket",
  async (ticketDetails, { rejectWithValue }) => {
    try {
      const response = await api.post("/tickets", ticketDetails);
      const data = response.data.data;
      const ticket = data?.ticket ?? data;

      if (!ticket?._id && !ticket?.id) {
        return rejectWithValue("Unexpected create-ticket response.");
      }

      return ticket;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create ticket."
      );
    }
  }
);

const getTicketFromResponse = (response) => {
  const data = response.data.data;
  return data?.ticket ?? data;
};

// PATCH /api/v1/tickets/:id
export const updateTicket = createAsyncThunk(
  "tickets/updateTicket",
  async ({ id, title, description }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tickets/${id}`, {
        title,
        description,
      });
      return getTicketFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update ticket."
      );
    }
  }
);

// PATCH /api/v1/tickets/:id/close
export const closeTicket = createAsyncThunk(
  "tickets/closeTicket",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tickets/${id}/close`);
      return getTicketFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to close ticket."
      );
    }
  }
);

// PATCH /api/v1/tickets/:id/status
export const updateTicketStatus = createAsyncThunk(
  "tickets/updateTicketStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tickets/${id}/status`, {
        status,
      });
      return getTicketFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status."
      );
    }
  }
);

// PATCH /api/v1/tickets/:id/priority
export const updateTicketPriority = createAsyncThunk(
  "tickets/updateTicketPriority",
  async ({ id, priority }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tickets/${id}/priority`, {
        priority,
      });
      return getTicketFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update priority."
      );
    }
  }
);

// PATCH /api/v1/tickets/:id/assign
export const assignTicket = createAsyncThunk(
  "tickets/assignTicket",
  async ({ id, assignedTo }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tickets/${id}/assign`, {
        assignedTo,
      });
      return getTicketFromResponse(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign ticket."
      );
    }
  }
);

// Replace an existing ticket in Redux state
const replaceTicket = (state, updatedTicket) => {
  const id = updatedTicket?._id ?? updatedTicket?.id;

  if (!id) return;

  const index = state.items.findIndex(
    (ticket) =>
      String(ticket._id ?? ticket.id) === String(id)
  );

  if (index !== -1) {
    state.items[index] = {
      ...state.items[index],
      ...updatedTicket,
    };
  }
};

const ticketSlice = createSlice({
  name: "tickets",

  initialState: {
    items: [],
    loading: false,
    creating: false,
    error: null,
  },

  reducers: {
    clearTicketError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch tickets.";
      })

      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.creating = false;
        state.error =
          action.payload || "Failed to create ticket.";
      })

      // Update ticket details
      .addCase(updateTicket.fulfilled, (state, action) => {
        replaceTicket(state, action.payload);
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to update ticket.";
      })

      // Close ticket
      .addCase(closeTicket.fulfilled, (state, action) => {
        replaceTicket(state, action.payload);
      })
      .addCase(closeTicket.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to close ticket.";
      })

      // Update status
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        replaceTicket(state, action.payload);
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to update status.";
      })

      // Update priority
      .addCase(updateTicketPriority.fulfilled, (state, action) => {
        replaceTicket(state, action.payload);
      })
      .addCase(updateTicketPriority.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to update priority.";
      })

      // Assign ticket
      .addCase(assignTicket.fulfilled, (state, action) => {
        replaceTicket(state, action.payload);
      })
      .addCase(assignTicket.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to assign ticket.";
      });
  },
});

export const { clearTicketError } = ticketSlice.actions;

export default ticketSlice.reducer;