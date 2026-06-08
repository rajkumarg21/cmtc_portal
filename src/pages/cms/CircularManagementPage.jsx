// src/pages/cms/CircularManagementPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

import {
  getCircularCategories,
  createCircular,
  getCircularById,
  updateCircular,
  getAllCirculars,
  deleteCircular,
  approveCircular,
  rejectCircular,
} from "../../services/circularService";
import { useAuth } from "../../context/AuthContext";



const LIMITS = {
  titleHindi: 80,
  titleEnglish: 80,
  description: 2000,
};

const REQUIRED_MSG = "This field is required.";

const toISODate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const formatGB = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB");
};

const statusMeta = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "PUBLISHED") return { label: "Published", cls: "bg-green-100 text-green-800 border-green-200" };
  if (s === "PENDING_APPROVAL") return { label: "Pending approval", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" };
  if (s === "REJECTED") return { label: "Rejected", cls: "bg-red-100 text-red-800 border-red-200" };
  if (s === "DRAFT") return { label: "Draft", cls: "bg-gray-100 text-gray-800 border-gray-200" };
  return { label: status || "Unknown", cls: "bg-gray-100 text-gray-800 border-gray-200" };
};
const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-200";

const CircularManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const isEditing = Boolean(id);

  // Access control
  const canAccess = hasRole(["EDITOR", "PUBLISHER", "PORTAL_ADMIN"]);
  const canApprove = hasRole(["PUBLISHER", "PORTAL_ADMIN"]);
  const canDelete = hasRole(["PORTAL_ADMIN"]);

  // Page state
  const [categories, setCategories] = useState([]);
  const [circulars, setCirculars] = useState([]);

  const [formData, setFormData] = useState({
    categoryId: "",
    titleHindi: "",
    titleEnglish: "",
    description: "",
    attachmentFileName: "",
    attachmentUrl: "",
    orderDate: toISODate(new Date()),
    archiveDate: "",
    isAlert: "NO",
    status: "PENDING_APPROVAL",
  });

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Loading states
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const validate = useCallback((data) => {
    const next = {};

    if (!data.categoryId) next.categoryId = "Please select a category.";
    if (!data.titleHindi?.trim()) next.titleHindi = REQUIRED_MSG;
    if (!data.titleEnglish?.trim()) next.titleEnglish = REQUIRED_MSG;

    if (data.titleHindi?.length > LIMITS.titleHindi) next.titleHindi = `Max ${LIMITS.titleHindi} characters.`;
    if (data.titleEnglish?.length > LIMITS.titleEnglish) next.titleEnglish = `Max ${LIMITS.titleEnglish} characters.`;

    if (data.description?.length > LIMITS.description) next.description = `Max ${LIMITS.description} characters.`;

    // Dates
    // orderDate is required in most govt circular workflows; keep validation but allow backend rules if different
    if (!data.orderDate) next.orderDate = "Order date is required.";

    // categoryId should be numeric
    const catId = Number(data.categoryId);
    if (data.categoryId && (Number.isNaN(catId) || catId <= 0)) next.categoryId = "Please select a valid category.";

    return next;
  }, []);

  const isFormValid = useMemo(() => Object.keys(validate(formData)).length === 0, [formData, validate]);

  const refreshCirculars = useCallback(async () => {
    try {
      const allCirculars = await getAllCirculars();
      setCirculars(Array.isArray(allCirculars) ? allCirculars : []);
    } catch (err) {
      toast.error("Failed to load circulars list.");
      setError("Failed to load circulars: " + (err.response?.data?.message || err.message));
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setPageLoading(true);
    setError("");
    try {
      const fetchedCategories = await getCircularCategories();
      setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);

      if (isEditing) {
        const circularData = await getCircularById(id);

        setFormData({
          categoryId: circularData?.categoryId ? String(circularData.categoryId) : "",
          titleHindi: circularData?.titleHindi || "",
          titleEnglish: circularData?.titleEnglish || "",
          description: circularData?.description || "",
          attachmentFileName: circularData?.attachmentFileName || "",
          attachmentUrl: circularData?.attachmentUrl || "",
          orderDate: circularData?.orderDate ? toISODate(circularData.orderDate) : "",
          archiveDate: circularData?.archiveDate ? toISODate(circularData.archiveDate) : "",
          isAlert: circularData?.isAlert || "NO",
          status: circularData?.status || "PENDING_APPROVAL",
        });

        setAttachmentFile(null);
        setErrors({});
      } else {
        // New form defaults (do not override edit)
        setFormData((prev) => ({
          ...prev,
          orderDate: prev.orderDate || toISODate(new Date()),
          status: "PENDING_APPROVAL",
        }));
      }

      await refreshCirculars();
    } catch (err) {
      setError("Failed to load initial data: " + (err.response?.data?.message || err.message));
      toast.error("Failed to load initial data!");
    } finally {
      setPageLoading(false);
    }
  }, [id, isEditing, refreshCirculars]);

  useEffect(() => {
    if (!canAccess) {
      setPageLoading(false);
      return;
    }
    loadInitial();
  }, [canAccess, loadInitial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAttachmentFile(file);
  };

  const resetToNew = () => {
    navigate("/cms/circulars");
    setFormData({
      categoryId: "",
      titleHindi: "",
      titleEnglish: "",
      description: "",
      attachmentFileName: "",
      attachmentUrl: "",
      orderDate: toISODate(new Date()),
      archiveDate: "",
      isAlert: "NO",
      status: "PENDING_APPROVAL",
    });
    setAttachmentFile(null);
    setErrors({});
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const nextErrors = validate(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        orderDate: formData.orderDate || null,
        archiveDate: formData.archiveDate || null,
      };

      if (isEditing) {
        await updateCircular(id, payload, attachmentFile);
        toast.success("Circular updated and sent for approval.");
      } else {
        await createCircular(payload, attachmentFile);
        toast.success("Circular created and sent for approval.");
        resetToNew();
      }

      await refreshCirculars();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed.";
      setError("Operation failed: " + msg);
      toast.error("Operation failed: " + msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [circularToDelete, setCircularToDelete] = useState(null);

  const handleDeleteClick = (circular) => {
    setCircularToDelete(circular);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!circularToDelete?.id) return;
    setActionLoading(true);
    setError("");
    try {
      await deleteCircular(circularToDelete.id);
      toast.success("Circular deleted.");
      await refreshCirculars();

      if (isEditing && String(circularToDelete.id) === String(id)) {
        resetToNew();
      }
    } catch (err) {
      setError("Failed to delete circular: " + (err.response?.data?.message || err.message));
      toast.error("Failed to delete circular!");
    } finally {
      setActionLoading(false);
      setShowDeleteConfirm(false);
      setCircularToDelete(null);
    }
  };

  // Approve/Reject
  const handleApprove = async (circularId) => {
    setActionLoading(true);
    setError("");
    try {
      await approveCircular(circularId);
      toast.success("Circular approved and published.");
      await refreshCirculars();

      if (isEditing && String(circularId) === String(id)) {
        setFormData((prev) => ({ ...prev, status: "PUBLISHED" }));
      }
    } catch (err) {
      setError("Failed to approve circular: " + (err.response?.data?.message || err.message));
      toast.error("Failed to approve circular!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (circularId) => {
    setActionLoading(true);
    setError("");
    try {
      await rejectCircular(circularId);
      toast.info("Circular rejected.");
      await refreshCirculars();

      if (isEditing && String(circularId) === String(id)) {
        setFormData((prev) => ({ ...prev, status: "REJECTED" }));
      }
    } catch (err) {
      setError("Failed to reject circular: " + (err.response?.data?.message || err.message));
      toast.error("Failed to reject circular!");
    } finally {
      setActionLoading(false);
    }
  };

  if (pageLoading) return <LoadingSpinner />;

  if (!canAccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-700">Access denied</h2>
          <p className="text-sm text-gray-600 mt-1">
            You don’t have permission to view Circular Management.
          </p>
        </div>
      </div>
    );
  }

  const currentAttachmentHref =
    isEditing && formData.attachmentUrl
      ? `${import.meta.env.VITE_BASE_URL}${formData.attachmentUrl}`
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: "#4A000E" }}>
            Circular Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, edit, and publish circulars with consistent formatting and approvals.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={refreshCirculars} disabled={actionLoading}>
            Refresh
          </Button>
          <Button onClick={resetToNew} disabled={actionLoading}>
            New circular
          </Button>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 mb-8">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#4A000E" }}>
              {isEditing ? "Edit circular" : "Create a new circular"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Fields marked with <span className="font-semibold">*</span> are required.
            </p>
          </div>

          {isEditing && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-700">
              ID: {id}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} class="row g-3" >
          {/* Category */}
          <div className="col-md-6">
            <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-800 mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={`${INPUT_CLASS} ${errors.categoryId ? "border-red-300" : ""}`}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId}</p>}
          </div>

          {/* Is Alert */}
          <div className="col-md-6">
            <label htmlFor="isAlert" className="block text-sm font-semibold text-gray-800 mb-2">
              Alert banner
            </label>
            <select
              id="isAlert"
              name="isAlert"
              value={formData.isAlert}
              onChange={handleChange}
              className={INPUT_CLASS}
            >
              <option value="NO">No</option>
              <option value="YES">Yes</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">If “Yes”, this may appear as an alert on the portal.</p>
          </div>

          {/* Title Hindi */}
          <div className="col-md-6">
            <InputField
              label={`Title (Hindi) *`}
              id="titleHindi"
              name="titleHindi"
              className="shadow-none"
              value={formData.titleHindi}
              onChange={(e) => {
                if (e.target.value.length <= LIMITS.titleHindi) handleChange(e);
              }}
              required
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-red-600">{errors.titleHindi || ""}</p>
              <p className="text-xs text-gray-500">
                {formData.titleHindi.length}/{LIMITS.titleHindi}
              </p>
            </div>
          </div>

          {/* Title English */}
          <div className="col-md-6">
            <InputField
              label={`Title (English) *`}
              id="titleEnglish"
              name="titleEnglish"
              className="shadow-none"
              value={formData.titleEnglish}
              onChange={(e) => {
                if (e.target.value.length <= LIMITS.titleEnglish) handleChange(e);
              }}
              required
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-red-600">{errors.titleEnglish || ""}</p>
              <p className="text-xs text-gray-500">
                {formData.titleEnglish.length}/{LIMITS.titleEnglish}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="col-md-12">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              row="5"
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= LIMITS.description) handleChange(e);
              }}
              rows={4}
              className={`${INPUT_CLASS} ${errors.description ? "border-red-300" : ""}`}
              placeholder="Write a brief description (optional)."
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-red-600">{errors.description || ""}</p>
              <p className="text-xs text-gray-500">
                {formData.description.length}/{LIMITS.description}
              </p>
            </div>
          </div>

          {/* Attachment */}
          <div className="col-md-12">
            <label htmlFor="attachment" className="block text-sm font-semibold text-gray-800 mb-2">
              Attachment (PDF)
            </label>
            <input
              type="file"
              id="attachment"
              name="attachment"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />

            {isEditing && formData.attachmentFileName && !attachmentFile && (
              <p className="text-xs text-gray-600 mt-2">
                Current file: <span className="font-semibold">{formData.attachmentFileName}</span>{" "}
                {currentAttachmentHref && (
                  <>
                    (
                    <a
                      href={currentAttachmentHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                    )
                  </>
                )}
              </p>
            )}

            {attachmentFile && (
              <p className="text-xs text-gray-600 mt-2">
                Selected: <span className="font-semibold">{attachmentFile.name}</span>
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="col-md-4">
            <InputField
              label="Order date *"
              id="orderDate"
              name="orderDate"
              className="shadow-none"
              type="date"
              value={formData.orderDate}
              onChange={handleChange}
              required
            />
            {errors.orderDate && <p className="text-xs text-red-600 mt-1">{errors.orderDate}</p>}
          </div>

          <div className="col-md-4">
            <InputField
              label="Archive date"
              id="archiveDate"
              name="archiveDate"
              className="shadow-none"
              type="date"
              value={formData.archiveDate}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500 mt-1">Optional. Leave empty if not applicable.</p>
          </div>

          {/* Status */}
          <div className="col-md-4">
            <label htmlFor="status" className="block text-sm font-semibold text-gray-800 mb-2">
              Status
            </label>
            <input
              type="text"
              id="status"
              name="status"
              value={formData.status}
              disabled
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              New or updated circulars are typically submitted as <span className="font-semibold">PENDING_APPROVAL</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="col-md-12">
            {isEditing && (
              <Button variant="secondary" type="button" onClick={() => navigate("/cms/circulars")} disabled={actionLoading}>
                Exit edit
              </Button>
            )}

            <Button type="submit" disabled={actionLoading || !isFormValid} class="btn btn-primary float-end">
              {actionLoading ? "Saving..." : isEditing ? "Save changes" : "Create circular"}
            </Button>
          </div>
        </form>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: "#4A000E" }}>
              All circulars
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and manage submitted circulars. Latest items may appear depending on backend ordering.
            </p>
          </div>

          <div className="inline-flex items-center px-3 py-1.5 rounded-full border bg-gray-50 text-sm font-semibold text-gray-700">
            {circulars.length} total
          </div>
        </div>

        {circulars.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-700 font-semibold">No circulars found.</p>
            <p className="text-sm text-gray-500 mt-1">Create a new circular using the form above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-bold tracking-wide text-gray-600 uppercase">
                    Title (EN)
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold tracking-wide text-gray-600 uppercase">
                    Category
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold tracking-wide text-gray-600 uppercase">
                    Order date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold tracking-wide text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold tracking-wide text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {circulars.map((circular) => {
                  const meta = statusMeta(circular.status);
                  const showApprovalActions = canApprove && circular.status === "PENDING_APPROVAL";

                  return (
                    <tr key={circular.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-800">
                        <div className="font-semibold">{circular.titleEnglish || "—"}</div>
                        <div className="text-xs text-gray-500">{circular.titleHindi || ""}</div>
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-700">
                        {circular.categoryName || "—"}
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatGB(circular.orderDate)}
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-700">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/cms/circulars/${circular.id}`)}
                            disabled={actionLoading}
                          >
                            Edit
                          </Button>

                          {canDelete && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(circular)}
                              disabled={actionLoading}
                            >
                              Delete
                            </Button>
                          )}

                          {showApprovalActions && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprove(circular.id)}
                                disabled={actionLoading}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleReject(circular.id)}
                                disabled={actionLoading}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {actionLoading && (
              <div className="flex items-center justify-center py-4">
                <span className="text-sm text-gray-500">Processing…</span>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm deletion"
        message={`Are you sure you want to delete circular "${circularToDelete?.titleEnglish || ""}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default CircularManagementPage;
