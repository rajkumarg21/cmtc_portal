import { useMemo, useState, useCallback } from "react";

/**
 * Safe string helper
 */
const safeStr = (v) => (v === null || v === undefined ? "" : String(v));

/**
 * Sorting comparator
 */
const descendingComparator = (a, b, orderBy) => {
  const av = safeStr(a?.[orderBy]).toLowerCase();
  const bv = safeStr(b?.[orderBy]).toLowerCase();

  if (bv < av) return -1;
  if (bv > av) return 1;
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b);
};

const stableSort = (array, comparator) => {
  const stabilized = (array || []).map((el, index) => [el, index]);

  stabilized.sort((a, b) => {
    const cmp = comparator(a[0], b[0]);
    if (cmp !== 0) return cmp;
    return a[1] - b[1];
  });

  return stabilized.map((el) => el[0]);
};

/**
 * MAIN HOOK
 */
export const useUserTable = ({
  users = [],
  loggedInRole,
  USER_ROLES,
  ROLE_LABELS,
  showAllSystemUsers,
  filterUsersByHierarchy,
  districtNameById = {},
  blockNameById = {},
  i18n,
}) => {
  // =========================
  // STATE
  // =========================
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("username");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const getUserDistrictName = (u) => {
      if (!u) return "-";

      const isHindi = i18n.language === "hi";

      // STRICT language आधारित value
      if (isHindi) {
        if (u.districtNameHi) return u.districtNameHi;
        if (u.assignedDistrictNameHi) return u.assignedDistrictNameHi;
      } else {
        if (u.districtNameEn) return u.districtNameEn;
        if (u.assignedDistrictNameEn) return u.assignedDistrictNameEn;
      }

      if (u.districtName) return u.districtName;

      const did = u.districtId ?? u.assignedDistrictId;

      if (did != null && districtNameById[String(did)]) {
        return districtNameById[String(did)];
      }

      return "-";
    };
      
    const getUserBlockName = (u) => {
      if (!u) return "-";

      if (u.blockId && blockNameById[String(u.blockId)]) {
        return blockNameById[String(u.blockId)];
      }

      return "-";
    };

  // =========================
  // BASE SCOPE (ROLE-BASED)
  // =========================
  const baseScopedUsers = useMemo(() => {
    if (
      (loggedInRole === USER_ROLES.PORTAL_ADMIN ||
        loggedInRole === USER_ROLES.ZONAL_HEAD) &&
      showAllSystemUsers
    ) {
      return users || [];
    }

    return filterUsersByHierarchy ? filterUsersByHierarchy(users) : users;
  }, [users, loggedInRole, showAllSystemUsers, filterUsersByHierarchy]);

  // =========================
  // ROLE FILTER
  // =========================
  const roleFilteredUsers = useMemo(() => {
    if (!roleFilter) return baseScopedUsers;

    return (baseScopedUsers || []).filter(
      (u) => u.role === roleFilter
    );
  }, [baseScopedUsers, roleFilter]);

  // =========================
  // SEARCH FILTER
  // =========================
  const searchedUsers = useMemo(() => {
    const q = safeStr(searchTerm).trim().toLowerCase();
    if (!q) return roleFilteredUsers;

    return (roleFilteredUsers || []).filter((u) => {
      const roleLabel =
        ROLE_LABELS?.[u.role] || safeStr(u.role).replaceAll("_", " ");

      const district = getUserDistrictName ? getUserDistrictName(u) : "";
      const block = getUserBlockName ? getUserBlockName(u) : "";

      const haystack = [
        u.username,
        u.fullName,
        u.email,
        u.mobileNo,
        roleLabel,
        district,
        block,
        u.cmtcCenterName,
        u.assignedCmtcCenterName,
      ]
        .map((x) => safeStr(x).toLowerCase())
        .join(" | ");

      return haystack.includes(q);
    });
  }, [
    roleFilteredUsers,
    searchTerm,
    ROLE_LABELS,
    getUserDistrictName,
    getUserBlockName,
  ]);

  // =========================
  // SORTING
  // =========================
  const tableRows = useMemo(() => {
    const enriched = (searchedUsers || []).map((u) => ({
      ...u,
      _districtSort: getUserDistrictName ? getUserDistrictName(u) : "",
      _blockSort: getUserBlockName ? getUserBlockName(u) : "",
      _statusSort: u.enabled ? "active" : "inactive",
    }));

    const effectiveOrderBy =
      orderBy === "district"
        ? "_districtSort"
        : orderBy === "block"
        ? "_blockSort"
        : orderBy === "status"
        ? "_statusSort"
        : orderBy;

    return stableSort(enriched, getComparator(order, effectiveOrderBy));
  }, [searchedUsers, order, orderBy, getUserDistrictName, getUserBlockName]);

  // =========================
  // PAGINATION
  // =========================
  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return tableRows.slice(start, end);
  }, [tableRows, page, rowsPerPage]);

  // reset page on filter change
  useMemo(() => {
    setPage(0);
  }, [searchTerm, roleFilter, rowsPerPage, showAllSystemUsers]);

  // =========================
  // HANDLERS
  // =========================
  const handleRequestSort = useCallback((property) => {
    setOrder((prevOrder) =>
      orderBy === property && prevOrder === "asc" ? "desc" : "asc"
    );
    setOrderBy(property);
  }, [orderBy]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setRoleFilter("");
    setPage(0);
  }, []);


  // =========================
  // RETURN API
  // =========================
  return {
    // state
    searchTerm,
    setSearchTerm,

    roleFilter,
    setRoleFilter,

    order,
    orderBy,

    page,
    setPage,

    rowsPerPage,
    setRowsPerPage,

    // computed
    baseScopedUsers,
    roleFilteredUsers,
    searchedUsers,
    tableRows,
    pagedRows,

    // actions
    handleRequestSort,
    clearFilters,

    // utils (optional export if needed)
    stableSort,
    getComparator,

    getUserDistrictName,
    getUserBlockName,
  };
};