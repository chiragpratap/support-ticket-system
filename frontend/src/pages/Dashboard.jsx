import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import {
  assignTicket,
  closeTicket,
  createTicket,
  fetchTickets,
  updateTicket,
  updateTicketPriority,
  updateTicketStatus,
} from "../features/tickets/ticketSlice";
import NotificationBell from "../components/NotificationBell";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const {
    items = [],
    loading = false,
    creating = false,
    error = null,
  } = useSelector((state) => state.tickets);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const getTicketId = (ticket) => ticket?._id ?? ticket?.id;

  const getErrorMessage = (errorValue, fallback) =>
    typeof errorValue === "string" ? errorValue : fallback;

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    setFormError("");

    try {
      await dispatch(
        createTicket({
          title: title.trim(),
          description: description.trim(),
          priority,
        })
      ).unwrap();

      setTitle("");
      setDescription("");
      setPriority("medium");
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not create ticket."));
    }
  };

  const handleEdit = (ticket) => {
    setEditingId(getTicketId(ticket));
    setEditTitle(ticket.title ?? "");
    setEditDescription(ticket.description ?? "");
    setActionError("");
  };

  const handleSaveEdit = async (id) => {
    setActionError("");

    try {
      await dispatch(
        updateTicket({
          id,
          title: editTitle.trim(),
          description: editDescription.trim(),
        })
      ).unwrap();

      setEditingId(null);
      await dispatch(fetchTickets());
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update ticket."));
    }
  };

  const handleCloseTicket = async (id) => {
    setActionError("");

    try {
      await dispatch(closeTicket(id)).unwrap();
      await dispatch(fetchTickets());
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not close ticket."));
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionError("");

    try {
      await dispatch(updateTicketStatus({ id, status })).unwrap();
      await dispatch(fetchTickets());
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update status."));
    }
  };

  const handlePriorityChange = async (id, nextPriority) => {
    setActionError("");

    try {
      await dispatch(
        updateTicketPriority({ id, priority: nextPriority })
      ).unwrap();
      await dispatch(fetchTickets());
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update priority."));
    }
  };

  const handleAssignTicket = async (id) => {
    const cleanAssigneeId = assigneeId.trim();

    if (!cleanAssigneeId) {
      setActionError("Enter the user ID to assign this ticket.");
      return;
    }

    setActionError("");

    try {
      await dispatch(
        assignTicket({
          id,
          assignedTo: cleanAssigneeId,
        })
      ).unwrap();

      setAssigneeId("");
      await dispatch(fetchTickets());
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not assign ticket."));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-100">
       
<nav className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-4 shadow-sm">
  <h1 className="text-xl font-bold">Support Tickets</h1>

  <div className="flex flex-wrap items-center gap-3">
    <NotificationBell />

    {user?.role === "admin" && (
      <button
        type="button"
        onClick={() => navigate("/admin")}
        className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
      >
        Admin
      </button>
    )}

    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
    >
      Logout
    </button>
  </div>
</nav>

      <section className="mx-auto max-w-5xl space-y-8 p-6">
        <header>
          <h2 className="text-3xl font-bold">
            Welcome, {user?.name || user?.email || "User"}!
          </h2>
          <p className="mt-2 text-slate-600">
            Create a support request and track its progress.
          </p>
        </header>

        <form
          onSubmit={handleCreateTicket}
          className="space-y-4 rounded-xl bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-bold">Create a Ticket</h3>

          <div>
            <label
              htmlFor="ticket-title"
              className="mb-1 block text-sm font-medium"
            >
              Title
            </label>
            <input
              id="ticket-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={150}
              placeholder="Example: Unable to access my account"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="ticket-description"
              className="mb-1 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={4}
              placeholder="Explain the problem..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="ticket-priority"
              className="mb-1 block text-sm font-medium"
            >
              Priority
            </label>
            <select
              id="ticket-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating..." : "Submit Ticket"}
          </button>
        </form>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold">
              {user?.role === "admin" ? "Tickets" : "My Tickets"}
            </h3>

            <button
              type="button"
              onClick={() => dispatch(fetchTickets())}
              disabled={loading}
              className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {actionError && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {actionError}
            </p>
          )}

          {loading && items.length === 0 && (
            <p className="text-slate-500">Loading tickets...</p>
          )}

          {error && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && items.length === 0 && (
            <p className="text-slate-500">
              No tickets found. Create your first ticket above.
            </p>
          )}

          <div className="space-y-4">
            {items.map((ticket) => {
              const id = getTicketId(ticket);
              const isEditing = editingId === id;
              const isClosed =
                ticket.status === "closed" ||
                ticket.status === "resolved";

              return (
                <article
                  key={id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold">{ticket.title}</h4>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                        {ticket.description}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize">
                      {(ticket.status || "open").replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    <span className="text-slate-600">
                      Priority:{" "}
                      <strong className="capitalize">
                        {ticket.priority || "medium"}
                      </strong>
                    </span>

                    {ticket.createdAt && (
                      <span className="text-slate-500">
                        Created:{" "}
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(ticket)}
                      disabled={ticket.status === "closed"}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>

                    {!isClosed && (
                      <button
                        type="button"
                        onClick={() => handleCloseTicket(id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-4 space-y-3 rounded-lg bg-slate-50 p-4">
                      <label className="block text-sm font-medium">
                        Title
                        <input
                          value={editTitle}
                          onChange={(event) =>
                            setEditTitle(event.target.value)
                          }
                          required
                          maxLength={150}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                      </label>

                      <label className="block text-sm font-medium">
                        Description
                        <textarea
                          value={editDescription}
                          onChange={(event) =>
                            setEditDescription(event.target.value)
                          }
                          required
                          rows={3}
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(id)}
                          disabled={!editTitle.trim() || !editDescription.trim()}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save Changes
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {user?.role === "admin" && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <h5 className="font-semibold">Admin Controls</h5>

                      <label className="block text-sm">
                        Status
                        <select
                          value={ticket.status || "open"}
                          onChange={(event) =>
                            handleStatusChange(id, event.target.value)
                          }
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </label>

                      <label className="block text-sm">
                        Priority
                        <select
                          value={ticket.priority || "medium"}
                          onChange={(event) =>
                            handlePriorityChange(id, event.target.value)
                          }
                          className="mt-1 w-full rounded-lg border px-3 py-2"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </label>

                      <div>
                        <label
                          htmlFor={`assignee-${id}`}
                          className="mb-1 block text-sm"
                        >
                          Assign to user ID
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <input
                            id={`assignee-${id}`}
                            value={assigneeId}
                            onChange={(event) =>
                              setAssigneeId(event.target.value)
                            }
                            placeholder="Enter assignee user ID"
                            className="min-w-0 flex-1 rounded-lg border px-3 py-2"
                          />
                          <button
                            type="button"
                            onClick={() => handleAssignTicket(id)}
                            disabled={!assigneeId.trim()}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
