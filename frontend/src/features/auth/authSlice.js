
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const savedUser = localStorage.getItem("user");

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

// POST /api/v1/auth/login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const data = response.data.data;

      const user = data.user;
      const token = data.token ?? data.accessToken;

      if (!user || !token) {
        return rejectWithValue(
          "Login response is missing the user or token."
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { user, token };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed."
      );
    }
  }
);

// POST /api/v1/auth/register
export const registerUser = createAsyncThunk(
  "auth/register",
  async (details, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", details);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed.";
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
