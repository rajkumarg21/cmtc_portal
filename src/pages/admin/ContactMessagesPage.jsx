import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";
import {
  getAllContactMessages,
  markMessageAsRead,
  deleteContactMessage,
  getContactMessageById,
} from "../../services/contactService";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import "../../customStyle.css";
const ContactMessagesPage = () => {
  const { t} = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  // UI state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | unread | read
  const [busyId, setBusyId] = useState(null); // row-level busy (view/mark/delete)
  const [refreshing, setRefreshing] = useState(false);

  const { hasRole } = useAuth();

  // ✅ Date formatter (dd/mm/yyyy hh:mm AM/PM)
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Fetch all messages
  const fetchMessages = async (mode = "initial") => {
    mode === "initial" ? setLoading(true) : setRefreshing(true);
    setError("");
    try {
      const data = await getAllContactMessages();
      const sortedData = [...data].sort(
        (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
      );
      setMessages(sortedData);
    } catch (err) {
      setError(
        "Failed to fetch contact messages: " + (err.response?.data || err.message)
      );
      console.error("Error fetching contact messages:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (hasRole(["PORTAL_ADMIN"])) {
      fetchMessages("initial");
    } else {
      setLoading(false);
      setError("You do not have permission to view this page.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRole]);

  const totalCount = messages.length;
  const unreadCount = useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages]
  );

  const filteredMessages = useMemo(() => {
    const q = query.trim().toLowerCase();

    return messages
      .filter((m) => {
        if (statusFilter === "unread") return !m.read;
        if (statusFilter === "read") return m.read;
        return true;
      })
      .filter((m) => {
        if (!q) return true;
        return (
          (m.name || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q) ||
          (m.subject || "").toLowerCase().includes(q)
        );
      });
  }, [messages, query, statusFilter]);

  const openMessageModal = async (messageId) => {
    setBusyId(messageId);
    setError("");
    try {
      const messageDetails = await getContactMessageById(messageId);
      setSelectedMessage(messageDetails);
      setIsModalOpen(true);

      if (!messageDetails.read) {
        await markMessageAsRead(messageId);
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
        );
      }
    } catch (err) {
      setError(
        "Failed to load message details: " + (err.response?.data || err.message)
      );
      console.error("Error viewing message:", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    setBusyId(messageId);
    setError("");
    try {
      await markMessageAsRead(messageId);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
      );
    } catch (err) {
      setError(
        "Failed to mark message as read: " + (err.response?.data || err.message)
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete?.id) return;
    setBusyId(messageToDelete.id);
    setError("");
    try {
      await deleteContactMessage(messageToDelete.id);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageToDelete.id));
    } catch (err) {
      setError("Failed to delete message: " + (err.response?.data || err.message));
      console.error("Error deleting message:", err);
    } finally {
      setBusyId(null);
      setShowDeleteConfirm(false);
      setMessageToDelete(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!hasRole(["PORTAL_ADMIN"])) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-semibold">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/40">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h6 className="page-heading">
             {t("admin.contactMessages")}
            </h6>
            <p className="mt-1 text-slate-600">
             {t("admin.contactPageTitle")}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-slate-600">{t("admin.total")}:</span>
                <span className="font-bold text-slate-900">{totalCount}</span>
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-amber-700">{t("admin.unread")}:</span>
                <span className="font-extrabold text-amber-800">
                  {unreadCount}
                </span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button
              variant="secondary"
              onClick={() => fetchMessages("refresh")}
              disabled={refreshing}
            >
              {refreshing ? t("admin.refreshing") : t("admin.refresh")}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-4 shadow-sm">
  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
    
    {/* Search */}
    <div>
      <label className="text-xs font-semibold text-slate-600">
       {t("admin.search")}
      </label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, subject..."
        className="mt-1 w-full h-[42px] rounded-xl border border-slate-200 bg-white px-4 text-slate-900 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
      />
    </div>

    {/* Filters */}
    <div className="flex gap-2 h-[42px]">
      <button
        onClick={() => setStatusFilter("all")}
        className={`h-full rounded-xl px-4 text-sm font-bold border transition ${
          statusFilter === "all"
            ? "border-indigo-200 bg-indigo-50 text-indigo-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
       {t("admin.all")}
      </button>

      <button
        onClick={() => setStatusFilter("unread")}
        className={`h-full rounded-xl px-4 text-sm font-bold border transition ${
          statusFilter === "unread"
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
       {t("admin.unread")}
      </button>

      <button
        onClick={() => setStatusFilter("read")}
        className={`h-full rounded-xl px-4 text-sm font-bold border transition ${
          statusFilter === "read"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
       {t("admin.read")}
      </button>
    </div>

  </div>
</div>


        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filteredMessages.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-indigo-50 grid place-items-center">
                <span className="text-indigo-700 font-black">✉️</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">
               {t("admin.noMessages")}
              </h3>
              <p className="mt-1 text-slate-600">
                {t("admin.noMessagesTitle")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Sender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Received
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMessages.map((msg, index) => {
                    const isBusy = busyId === msg.id;
                    return (
                      <tr
                        key={msg.id}
                        className={`transition ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                        } hover:bg-indigo-50/40`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white grid place-items-center font-black">
                              {(msg.name || "?").slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {msg.name}
                              </div>
                              <div className="text-slate-600">{msg.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {msg.subject || "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                          {formatDateTime(msg.receivedAt)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold border ${
                              msg.read
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                msg.read ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            {msg.read ? "Read" : "Unread"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => openMessageModal(msg.id)}
                              disabled={isBusy}
                            >
                              {isBusy ? "Opening..." : "View"}
                            </Button>

                            {!msg.read && (
                              <Button
                                variant="primary"
                                onClick={() => handleMarkAsRead(msg.id)}
                                disabled={isBusy}
                              >
                                {isBusy ? "..." : "Mark Read"}
                              </Button>
                            )}

                            <Button
                              variant="danger"
                              onClick={() => handleDeleteClick(msg)}
                              disabled={isBusy}
                            >
                              {isBusy ? "..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal for viewing full message */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Message Details"
        >
          {selectedMessage ? (
            <div className="space-y-4 text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-extrabold text-slate-900">
                      {selectedMessage.name}{" "}
                      <span className="font-semibold text-slate-600">
                        ({selectedMessage.email})
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold border ${
                        selectedMessage.read
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          selectedMessage.read ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                      />
                      {selectedMessage.read ? "Read" : "Unread"}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-slate-600 font-semibold">Subject: </span>
                    <span className="font-bold text-slate-900">
                      {selectedMessage.subject || "—"}
                    </span>
                  </div>

                  <div className="text-sm text-slate-600">
                    <span className="font-semibold">Received: </span>
                    {formatDateTime(selectedMessage.receivedAt)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-2 text-sm font-extrabold text-slate-900">
                  Message
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the message from "${messageToDelete?.name}" with subject "${messageToDelete?.subject}"? This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default ContactMessagesPage;
