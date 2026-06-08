// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   getCentersByBlock,
//   getDistrictsWithBlocks,
// } from "../../services/cmtcCenterService";

// export const useUserManagement = ({ i18n, showSnackbar }) => {
//   // =========================
//   // STATE
//   // =========================
//   const [districts, setDistricts] = useState([]);
//   const [districtsWithBlocks, setDistrictsWithBlocks] = useState([]);

//   const [blocks, setBlocks] = useState([]);   // ✅ FIX (this was needed)
//   const [cmtcCenters, setCmtcCenters] = useState([]);

//   const [loadingDistricts, setLoadingDistricts] = useState(false);
//   const [loadingBlocks, setLoadingBlocks] = useState(false);
//   const [loadingCenters, setLoadingCenters] = useState(false);

//   // =========================
//   // FETCH DISTRICTS
//   // =========================
//   const fetchDistrictsWithBlocks = useCallback(async () => {
//     try {
//       setLoadingDistricts(true);
//       setLoadingBlocks(true);

//       const response = await getDistrictsWithBlocks();
//       const data = response.data || [];

//       setDistricts(data);
//       setDistrictsWithBlocks(data);
//     } catch (e) {
//       console.error("District fetch failed:", e);
//       showSnackbar?.("Failed to load districts", "error");
//     } finally {
//       setLoadingDistricts(false);
//       setLoadingBlocks(false);
//     }
//   }, [showSnackbar]);

//   // =========================
//   // FETCH CENTERS
//   // =========================
//   const fetchCentersByBlock = useCallback(
//     async (blockId) => {
//       if (!blockId) {
//         setCmtcCenters([]);
//         return [];
//       }

//       try {
//         setLoadingCenters(true);

//         const res = await getCentersByBlock(blockId);
//         const list = res.data || [];

//         setCmtcCenters(list);
//         return list;
//       } catch (e) {
//         console.error("Center fetch failed:", e);
//         showSnackbar?.("Failed to load centers", "error");
//         setCmtcCenters([]);
//         return [];
//       } finally {
//         setLoadingCenters(false);
//       }
//     },
//     [showSnackbar]
//   );

//   // =========================
//   // DERIVED MAPS
//   // =========================
//   const districtNameById = useMemo(() => {
//     const map = {};

//     districtsWithBlocks.forEach((d) => {
//       map[String(d.districtId)] =
//         i18n.language === "hi"
//           ? d.districtNameHi
//           : d.districtNameEn;
//     });

//     return map;
//   }, [districtsWithBlocks, i18n.language]);

//   const blockNameById = useMemo(() => {
//     const map = {};

//     districtsWithBlocks.forEach((d) => {
//       (d.blocks || []).forEach((b) => {
//         map[String(b.blockId)] =
//           i18n.language === "hi"
//             ? b.blockNameHi
//             : b.blockNameEn;
//       });
//     });

//     return map;
//   }, [districtsWithBlocks, i18n.language]);

//   const centerNameById = useMemo(() => {
//     const map = {};

//     cmtcCenters.forEach((c) => {
//       const id = c.centerId ?? c.id;
//       const name = c.name ?? c.centerName;

//       if (id != null) map[String(id)] = name;
//     });

//     return map;
//   }, [cmtcCenters]);

//   // =========================
//   // DISTRICT -> BLOCK SYNC
//   // =========================
//   const setBlocksFromDistrict = useCallback(
//     (districtId) => {
//       const selected = districtsWithBlocks.find(
//         (d) => String(d.districtId) === String(districtId)
//       );

//       setBlocks(selected?.blocks || []);
//     },
//     [districtsWithBlocks]
//   );

//   // =========================
//   // RESET
//   // =========================
//   const resetGeo = useCallback(() => {
//     setBlocks([]);
//     setCmtcCenters([]);
//   }, []);

//   // =========================
//   // INIT LOAD
//   // =========================
//   useEffect(() => {
//     fetchDistrictsWithBlocks();
//   }, [fetchDistrictsWithBlocks]);

//   return {
//     // data
//     districts,
//     blocks,            // ✅ FIX (was missing in real usage)
//     cmtcCenters,

//     // maps
//     districtNameById,
//     blockNameById,
//     centerNameById,

//     // loading
//     loadingBlocks,
//     loadingDistricts,
//     loadingCenters,

//     // actions
//     fetchDistrictsWithBlocks,
//     fetchCentersByBlock,
//     setBlocksFromDistrict,
//     resetGeo,
//   };
// };