// hooks/useLocationHierarchy.js
import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getAllDistricts,
  getBlocksByDistrict,
} from "../services/cmtcCenterService";

export default function useLocationHierarchy({ isHindi }) {
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  const [districtNameById, setDistrictNameById] = useState({});
  const [blockNameById, setBlockNameById] = useState({});

  const fetchDistricts = useCallback(async () => {
    setLoadingDistricts(true);
    try {
      const res = await getAllDistricts();
      const list = Array.isArray(res?.data) ? res.data : [];

      const normalized = list.map(d => ({
        id: d.districtId,
        name: isHindi
          ? d.districtNameHi || d.districtNameEn || ""
          : d.districtNameEn || d.districtNameHi || "",
      }));

      setDistricts(normalized);

      const map = {};
      normalized.forEach(d => {
        map[d.id] = d.name;
      });
      setDistrictNameById(map);

      return normalized;
    } catch {
      toast.error("Failed to load districts");
      setDistricts([]);
      return [];
    } finally {
      setLoadingDistricts(false);
    }
  }, [isHindi]);

  // -------------------------------
  // Fetch blocks by district
  // -------------------------------
  const fetchBlocks = useCallback(async (districtId) => {
    if (!districtId) return [];

    setLoadingBlocks(true);
    try {
      const res = await getBlocksByDistrict(districtId);
      const list = Array.isArray(res?.data) ? res.data : [];

      const normalized = list.map(b => ({
        id: b.blockId ?? b.id,
        name: isHindi
          ? b.blockNameHi || b.blockNameEn || ""
          : b.blockNameEn || b.blockNameHi || "",
      }));

      setBlocks(normalized);

      setBlockNameById(prev => {
        const next = { ...prev };
        normalized.forEach(b => {
          next[b.id] = b.name;
        });
        return next;
      });

      return normalized;
    } catch {
      toast.error("Failed to load blocks");
      setBlocks([]);
      return [];
    } finally {
      setLoadingBlocks(false);
    }
  }, [isHindi]);

  // -------------------------------
  // Handlers
  // -------------------------------
  const onDistrictChange = async (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedBlock("");
    setBlocks([]);

    if (districtId) {
      await fetchBlocks(districtId);
    }
  };

  return {
    // data
    districts,
    blocks,

    // selected values
    selectedDistrict,
    selectedBlock,

    // setters
    setSelectedDistrict: onDistrictChange,
    setSelectedBlock,

    // lookup maps
    districtNameById,
    blockNameById,

    // loading states
    loadingDistricts,
    loadingBlocks,

    // fetchers (explicit control)
    fetchDistricts,
    fetchBlocks,
  };
}
