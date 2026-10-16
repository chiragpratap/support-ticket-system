 
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/notifications");

      // Your API returns notifications at the root level.
      return {
        items: response.data.notifications ?? [],
        unreadCount: response.data.unreadCount ?? 0,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch notifications"
      );
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark notification as read"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",

  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },

  reducers: {
    addNotification(state, action) {
      const notification = action.payload;
      if (!notification) return;

      const id = notification._id ?? notification.id;

      if (
        id &&
        state.items.some(
          (item) => (item._id ?? item.id) === id
        )
      ) {
        return;
      }

      state.items.unshift(notification);

      if (!notification.isRead) {
        state.unreadCount += 1;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.items.find(
          (item) =>
            (item._id ?? item.id) === action.payload
        );

        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(
            0,
            state.unreadCount - 1
          );
        }
      });
  },
});

export const { addNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
