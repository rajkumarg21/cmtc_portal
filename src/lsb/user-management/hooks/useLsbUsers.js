import { useEffect, useState } from "react";
import api from "../../../services/apiService";
import { toast } from "react-toastify";

const STATUS = {
  ALL: "ALL",
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
};

const useLsbUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(STATUS.ALL);

  // ================= FETCH USERS =================
  const fetchUsers = async (status) => {
    try {
      setLoading(true);

      const res = await api.get("/bank-user/nodal-checker/all", {
        params: status !== STATUS.ALL ? { status } : {},
      });

      setUsers(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(statusFilter);
  }, [statusFilter]);

  // ================= APPROVE =================
  const approveUser = async (id) => {
    try {
      await api.put(`/bank-user/nodal-checker/approve/${id}`);

      toast.success("User approved");

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: 1 } : u
        )
      );
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  // ================= REJECT =================
  const rejectUser = async (id) => {
    try {
      await api.put(`/bank-user/nodal-checker/reject/${id}`);

      toast.success("User rejected");

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: 2 } : u
        )
      );
    } catch (err) {
      toast.error("Rejection failed");
    }
  };

  return {
    users,
    loading,
    statusFilter,
    setStatusFilter,
    approveUser,
    rejectUser,
    STATUS,
  };
};

export default useLsbUsers;