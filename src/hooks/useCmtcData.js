// hooks/useCmtcCenters.js
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { getCentersByBlock } from "../services/cmtcCenterService";

export default function useCmtcCenters({ canChangeCenter }) {
  const [centers, setCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  const [centerNameById, setCenterNameById] = useState({});

  const fetchCenters = useCallback(async (blockId) => {
    if (!blockId || !canChangeCenter) return;

    setLoadingCenters(true);
    try {
      const res = await getCentersByBlock(blockId);
      const list = Array.isArray(res?.data) ? res.data : [];

      const normalized = list.map(c => ({
        id: c.centerId ?? c.id ?? c.cmtcCentersId,
        name: c.name || c.centerName || "",
      }));

      setCenters(normalized);

      setCenterNameById(prev => {
        const next = { ...prev };
        normalized.forEach(c => next[c.id] = c.name);
        return next;
      });

      return normalized;
    } catch {
      toast.error("Failed to load CMTC centers");
      setCenters([]);
    } finally {
      setLoadingCenters(false);
    }
  }, [canChangeCenter]);

  const resetCenters = () => {
    setCenters([]);
    setCenterNameById({});
  };

  return {
    centers,
    loadingCenters,
    centerNameById,
    fetchCenters,
    resetCenters,
  };
}
