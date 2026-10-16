# 🎫 Support Ticket Management System

A full-stack web application for managing customer support tickets, tracking ticket status, assigning tickets to administrators, and delivering real-time updates and notifications.

## 🚀 Features

- **Authentication & Authorization** — Secure registration, login, JWT-based authentication, and role-based access control.
- **Ticket Management** — Create, view, edit, and close support tickets.
- **Status Management** — Track ticket progress through different statuses.
- **Priority Management** — Manage ticket priorities.
- **Ticket Assignment** — Allow administrators to assign tickets.
- **Real-Time Updates** — Socket.IO integration for live ticket updates without manually refreshing the page.
- **Notifications** — Notify relevant users about ticket changes.
- **Role-Based Permissions** — Separate administrative actions from normal user actions.
- **REST API** — Backend APIs for authentication, tickets, and notifications.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Socket.IO

## 📁 Project Structure

```text
support-ticket-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
└── README.md
```

## ⚙️ Prerequisites

Make sure you have installed:

- Node.js and npm
- Git
- MongoDB locally or a MongoDB Atlas database
- A code editor such as Visual Studio Code

## 💻 Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd support-ticket-system
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory.

Example:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
```

Use the exact environment variable names expected by your backend code. Add any other required variables for email, authentication, or external services if your implementation uses them.

### 3. Start the Backend

```bash
npm run dev
```

If your backend does not define a `dev` script, use the start command specified in its `package.json`.

The backend should be available at:

```text
http://localhost:5000
```

### 4. Configure the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`.

Example:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Use the variable name and URL format expected by your frontend Axios configuration.

### 5. Start the Frontend

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://localhost:5173
```

## 🔌 API Overview

The following endpoints are part of the ticket management API. All ticket endpoints require authentication unless otherwise configured.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a user |
| POST | `/api/v1/auth/login` | Log in |
| GET | `/api/v1/tickets` | Retrieve tickets |
| POST | `/api/v1/tickets` | Create a ticket |
| GET | `/api/v1/tickets/:id` | Retrieve a ticket |
| PATCH | `/api/v1/tickets/:id` | Update ticket details |
| PATCH | `/api/v1/tickets/:id/close` | Close a ticket |
| PATCH | `/api/v1/tickets/:id/status` | Update ticket status |
| PATCH | `/api/v1/tickets/:id/priority` | Update ticket priority |
| PATCH | `/api/v1/tickets/:id/assign` | Assign a ticket |

Administrative endpoints require the appropriate role. Verify the actual authentication and authorization requirements in your backend routes before relying on this table.

## ⚡ Real-Time Communication

The application uses Socket.IO to support real-time communication between the backend and connected clients.

When ticket information changes, the backend can emit events to relevant users and administrators. The frontend listens for those events and refreshes ticket data.

Example event names:

- `ticket:created`
- `ticket:updated`
- `ticket:closed`
- `ticket:status_changed`
- `ticket:priority_changed`
- `ticket:assigned`
- `notification:new`
- `dashboard:refresh`

Actual behavior depends on the events implemented and registered in the application.

## 🔐 Security

- Keep database credentials and JWT secrets in environment variables.
- Never commit `.env` files or production secrets to GitHub.
- Configure CORS to allow only the intended frontend origins.
- Validate incoming request data on the backend.
- Enforce authorization for administrative actions.
- Use HTTPS for production deployments.
- Restrict MongoDB Atlas network access appropriately.

## ☁️ Deployment

The application can be deployed using the following services:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

Before deployment:

1. Configure a production MongoDB Atlas database.
2. Add the required backend environment variables in Render.
3. Configure backend CORS for the deployed frontend URL.
4. Configure Socket.IO CORS for the deployed frontend origin.
5. Set the frontend API URL to the deployed backend URL.
6. Configure the production Socket.IO URL.
7. Test authentication, ticket operations, permissions, notifications, and real-time updates.

Do not use `localhost` URLs in production configuration.

## 🧪 Testing Checklist

- [ ] User registration and login
- [ ] Authentication and protected routes
- [ ] Ticket creation and listing
- [ ] Ticket editing and closing
- [ ] Admin status and priority updates
- [ ] Ticket assignment
- [ ] Role-based authorization
- [ ] Real-time ticket updates
- [ ] Notifications and read status
- [ ] Production API and database connectivity

## 🎯 Project Objective

The goal of this project is to provide a centralized support ticket management platform with secure authentication, organized ticket workflows, role-based access control, and real-time communication.

## 👨‍💻 Author

**Your Name**

GitHub: [Your GitHub Profile](YOUR_GITHUB_PROFILE_URL)

---

*Built with React, Node.js, Express, MongoDB, Redux Toolkit, and Socket.IO.*