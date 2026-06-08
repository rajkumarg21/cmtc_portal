// UserManagementPage.jsx
  import { useEffect, useState } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    TextField,
    Typography,
  } from "@mui/material";

  import {
    AccountTree as HierarchyIcon,
    AdminPanelSettings as AdminIcon,
    Clear as ClearIcon,
    PersonAdd as PersonAddIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
  } from "@mui/icons-material";

  import {
    createUser,
    deleteUser,
    disableUser,
    enableUser,
    getAllUsers,
    getUserById,
    updateUser,
  } from "../../services/userService";

  import { useTranslation } from "react-i18next";
  import { useAuth } from "../../context/AuthContext";
  import {
    CENTER_ROLES,
    PUBLIC_SIGNUP_ROLES,
    ROLE_LABELS,
    USER_CREATION_HIERARCHY,
    USER_ROLES,
  } from "../../utils/constants";
  import { getResetUserFormData } from "../../utils/user/resetUserForm";
  import UserTable from "../../components/user-management/UserManagementTable";
  import UserForm from "../../components/user-management/UserForm";
  import { getGeoConfig } from "../../utils/user/geoConfig";
  import { applyGeoConfigToForm } from "../../utils/user/geoFormUtils";
  import { GeographicalFields } from "../../components/user-management/GeographicalFields";
  import { useUserTable } from "../../hooks/user-management/useUserTable";
  import { useUserRoleUniqueness } from "../../hooks/user-management/useUserRoleUniqueness";
  import { useUserPermissions } from "../../hooks/user-management/useUserPermissions";
  import { useUserManagementForm } from "../../hooks/user-management/useUserManagementForm";

  const inputSx = {
    "& .MuiInputBase-root": {
      borderRadius: 2,
    },
  };
  const UserManagementPage = () => {
    const { id } = useParams();
    const { t, i18n} = useTranslation();
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const { user: loggedInUser, hasRole } = useAuth();

    // -----------------------------
    // Core state
    // -----------------------------
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // -----------------------------
    // Dropdown master data
    // -----------------------------
    const [availableRoles, setAvailableRoles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    // -----------------------------
    // Table UX
    // -----------------------------
    const [showAllSystemUsers, setShowAllSystemUsers] = useState(false);
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });


    const showSnackbar = (message, severity = "error") => {
      setSnackbar({ open: true, message, severity });
    };

  // 🔥 NEW: roles from API
  const [allRoles, setAllRoles] = useState([]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const {
    loggedInRole,
    canModifyUser,
    canCreateUser,
    canViewUser,
  } = useUserPermissions({
    loggedInUser,
    hasRole,
    USER_ROLES,
  });
  const getRoleIcon = (role) => {
    if (role === USER_ROLES.PORTAL_ADMIN) return <AdminIcon fontSize="small" />;
    return <HierarchyIcon fontSize="small" />;
  };
  const getAllowedRoles = () => {
    if (!loggedInRole) return [];

    const creatableRoles = USER_CREATION_HIERARCHY[loggedInRole] || [];

    const getAllSubRoles = (roles) => {
      let allRoles = [...roles];
      roles.forEach((r) => {
        if (USER_CREATION_HIERARCHY[r]) {
          allRoles = [
            ...allRoles,
            ...getAllSubRoles(USER_CREATION_HIERARCHY[r]),
          ];
        }
      });
      return allRoles;
    };

    const allCreatableRoles = getAllSubRoles(creatableRoles);

      return [...new Set(allCreatableRoles)].filter(
        (r) => !PUBLIC_SIGNUP_ROLES.includes(r),
      );
    };

    const setupAvailableRoles = () => {
      const roles = getAllowedRoles();
      setAvailableRoles(roles);

      if (!isEditing && roles.length > 0 && !formData.role) {
        setFormData((prev) => ({ ...prev, role: roles[0] }));
      }
    };
    const filterUsersByHierarchy = (allUsers) => {
      if (!loggedInRole) return [];

      const nonPublicUsers = allUsers || [];

      if (loggedInRole === USER_ROLES.PORTAL_ADMIN) return nonPublicUsers;

      if (loggedInRole === USER_ROLES.ZONAL_HEAD) {
        return nonPublicUsers.filter((u) => u.role !== USER_ROLES.PORTAL_ADMIN);
      }

      return nonPublicUsers;
    };
  const {
    formData,
    validateForm,
    setFormData,
    validationErrors,
    setValidationErrors,
    handleChange,
    handleRoleChange,

    districts,
    blocks,
    cmtcCenters,

    districtNameById,
    blockNameById,
    centerNameById,

    loadingDistricts,
    loadingBlocks,
    loadingCenters,

    fetchCentersByBlock,
    setBlocksFromDistrict,
    resetGeo,

    fetchDistrictsWithBlocks,
    handleCmtcCenterChange,
  } = useUserManagementForm({
    i18n,
  showSnackbar,
  loggedInRole,
  loggedInUser,
  USER_ROLES,
  CENTER_ROLES,
  });

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        const rolesFromApi = [...new Set((data || []).map((u) => u.role))];
        setAllRoles(rolesFromApi);
        const sorted = (data || []).sort((a, b) =>
          (a.username || "").localeCompare(b.username || ""),
        );
        setUsers(sorted);
      } catch (err) {
        showSnackbar(
          "Failed to fetch users: " + (err.response?.data || err.message),
          "error",
        );
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (formData.blockId) {
        fetchCentersByBlock(formData.blockId);
      }
    }, [formData.blockId]);

    const ensureGeoOptionsForEditing = async (userData) => {

      // District Officer: blocks required (district fixed)
      if (loggedInRole === USER_ROLES.DISTRICT_OFFICER) {
        if (loggedInUser?.districtId)
        //   await fetchBlocksByDistrict(loggedInUser.districtId);
        if (userData?.blockId) await fetchCentersByBlock(userData.blockId);
        return;
      }

      // Block Officer: centers required
      if (loggedInRole === USER_ROLES.BLOCK_OFFICER) {
        if (loggedInUser?.blockId)
          await fetchCentersByBlock(loggedInUser.blockId);
        else if (userData?.blockId) await fetchCentersByBlock(userData.blockId);
        return;
      }
    };

    useEffect(() => {
      if (isEditing) {
        setShowForm(true);
      }
    }, [isEditing]);

    // -----------------------------
    // Geo dropdown handlers
    // -----------------------------
    const handleDistrictChange = (event) => {
      const districtId = event.target.value;

      const selectedDistrict = districts.find(
        (d) => String(d.districtId) === String(districtId)
      );

      setFormData((prev) => ({
        ...prev,
        districtId: selectedDistrict?.districtId
          ? String(selectedDistrict.districtId)
          : "",
        districtName: selectedDistrict?.districtNameEn || "",
        blockId: "",
        blockName: "",
        cmtcCenterId: "",
        cmtcCenterName: "",
      }));

      // 🔥 IMPORTANT: use hook function
      setBlocksFromDistrict(districtId);
    };

    const handleBlockChange = (event, value) => {
      setFormData((prev) => ({
        ...prev,
        blockId: value?.blockId ? String(value.blockId) : "",
        blockName: value?.blockNameEn || "",
        cmtcCenterId: "",
        cmtcCenterName: "",
      }));

      if (value?.blockId) {
        fetchCentersByBlock(value.blockId);
      }
    };

    const isOriginalDesignationRequired = ![
      USER_ROLES.MISSION_STAFF,
      USER_ROLES.AUDIT_ACCOUNTANT,
      USER_ROLES.AUDITOR,
    ].includes(formData.role);


    // -----------------------------
    // Submit
    // -----------------------------
    const handleSubmit = async (e) => {
      e.preventDefault();

      // Safety: CMTC_MANAGER creating staff must always have center id
      if (
        loggedInRole === USER_ROLES.CMTC_MANAGER &&
        formData.role === USER_ROLES.CMTC_STAFF &&
        !formData.cmtcCenterId
      ) {
        showSnackbar(
          "CMTC Center not assigned. Please logout and login again.",
          "error",
        );
        return;
      }

      if (!validateForm()) return;

      setLoading(true);
      try {
        const payload = {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          originalDesignation: formData.originalDesignation,
          role: formData.role,
          password: formData.password,
          enabled: formData.enabled,
          mobileNo: formData.mobileNo,

          districtId: formData.districtId || null,
          districtName: formData.districtName || null,
          blockId: formData.blockId || null,
          blockName: formData.blockName || null,
          cmtcCenterId: formData.cmtcCenterId || null,
          cmtcCenterName: formData.cmtcCenterName || null,

          assignedDistrictId: formData.assignedDistrictId || null,
          assignedDistrictName: formData.assignedDistrictName || null,
          assignedBlockId: formData.assignedBlockId || null,
          assignedBlockName: formData.assignedBlockName || null,
          assignedCmtcCenterId: formData.assignedCmtcCenterId || null,
          assignedCmtcCenterName: formData.assignedCmtcCenterName || null,
        };

        const uniqError = checkRoleUniquenessRules();
        if (uniqError) {
          showSnackbar(uniqError, "error");
          setLoading(false);
          return;
        }

        if (isEditing) {
          if (payload.password === "") delete payload.password;
          await updateUser(id, payload);
          showSnackbar("✅ User updated successfully!", "success");
        } else {
          await createUser(payload);
          showSnackbar("✅ User created successfully!", "success");
          resetForm();
        }

        setShowForm(false);

        await fetchUsers();
        navigate("/admin/users");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Something went wrong. Please try again later.";
        console.error("❌ User create/update failed:", err);
        showSnackbar(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    };

    const {
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
      pagedRows,
      tableRows,
      handleRequestSort,
      getUserDistrictName,
      getUserBlockName,
    } = useUserTable({
      users,
      loggedInRole,
      USER_ROLES,
      ROLE_LABELS,
      showAllSystemUsers,
      filterUsersByHierarchy,
      i18n,
      districtNameById,
      blockNameById
    });
    // -----------------------------
    // Reset
    // -----------------------------
    const resetForm = () => {
      const base = getResetUserFormData(availableRoles);

      const config = getGeoConfig(
        loggedInRole,
        base.role,
        USER_ROLES,
        CENTER_ROLES
      );

      const final = applyGeoConfigToForm(config, loggedInUser, base);

      setFormData(final);

      setValidationErrors({});

      if (
        loggedInRole === USER_ROLES.ZONAL_HEAD ||
        loggedInRole === USER_ROLES.PORTAL_ADMIN
      ) {
        resetGeo();
      }
    };

    // -----------------------------
    // Enable/Disable/Delete
    // -----------------------------
    const handleToggleEnabled = async (user) => {
      setLoading(true);
      try {
        if (user.enabled) {
          await disableUser(user.id);
          showSnackbar(
            `🚫 User "${user.username}" disabled successfully.`,
            "info",
          );
        } else {
          await enableUser(user.id);
          showSnackbar(
            `✅ User "${user.username}" enabled successfully.`,
            "success",
          );
        }
        await fetchUsers();
      } catch (err) {
        showSnackbar(
          "Failed to toggle user status: " + (err.response?.data || err.message),
          "error",
        );
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteClick = (user) => {
      setUserToDelete(user);
      setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
      setLoading(true);
      try {
        await deleteUser(userToDelete.id);
        showSnackbar(
          `🗑️ User "${userToDelete.username}" deleted successfully.`,
          "success",
        );
        await fetchUsers();
      } catch (err) {
        showSnackbar(
          "Failed to delete user: " + (err.response?.data || err.message),
          "error",
        );
      } finally {
        setLoading(false);
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      }
    };

    const { checkRoleUniquenessRules } = useUserRoleUniqueness({
      users,
      isEditing,
      id,
      formData,
    });

    const renderGeographicalDropdown = () => (
      <GeographicalFields
        formData={formData}
        validationErrors={validationErrors}
        loggedInRole={loggedInRole}
        USER_ROLES={USER_ROLES}
        CENTER_ROLES={CENTER_ROLES}
        districts={districts}
        blocks={blocks}
        cmtcCenters={cmtcCenters}
        loadingDistricts={loadingDistricts}
        loadingBlocks={loadingBlocks}
        loadingCenters={loadingCenters}
        handleDistrictChange={handleDistrictChange}
        handleBlockChange={handleBlockChange}
        handleCmtcCenterChange={handleCmtcCenterChange}
        inputSx={inputSx}
        t={t}
        loggedInUser={loggedInUser}
        getGeoConfig={getGeoConfig}
      />
    );

    // -----------------------------
    // Initial load
    // -----------------------------
    useEffect(() => {
      if (!loggedInRole) {
        setLoading(false);
        showSnackbar("You do not have permission to access this page.", "error");
        return;
      }

      const fetchData = async () => {
        // 1) users
        await fetchUsers();

        // 2) dropdowns + master maps
        await fetchDistrictsWithBlocks();

        
        // 3) edit mode populate
        if (isEditing) {
          try {
            const userData = await getUserById(id);

            await ensureGeoOptionsForEditing(userData);

            setFormData({
              username: userData.username || "",
              email: userData.email || "",
              fullName: userData.fullName || "",
              role: userData.role || "",
              password: undefined,
              enabled: Boolean(userData.enabled),
              mobileNo: userData.mobileNo || "",
              originalDesignation: userData.originalDesignation || "",
              districtId: userData.districtId ? String(userData.districtId) : "",
              districtName: userData.districtName || "",
              blockId: userData.blockId ? String(userData.blockId) : "",
              blockName: userData.blockName || "",
              cmtcCenterId: userData.cmtcCenterId
                ? String(userData.cmtcCenterId)
                : "",
              cmtcCenterName: userData.cmtcCenterName || "",

              assignedDistrictId: userData.assignedDistrictId
                ? String(userData.assignedDistrictId)
                : "",
              assignedDistrictName: userData.assignedDistrictName || "",
              assignedBlockId: userData.assignedBlockId
                ? String(userData.assignedBlockId)
                : "",
              assignedBlockName: userData.assignedBlockName || "",
              assignedCmtcCenterId: userData.assignedCmtcCenterId
                ? String(userData.assignedCmtcCenterId)
                : "",
              assignedCmtcCenterName: userData.assignedCmtcCenterName || "",
            });
          } catch (err) {
            showSnackbar(
              "Failed to load user for editing: " +
                (err.response?.data || err.message),
              "error",
            );
          }
        }
      };

      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isEditing, loggedInRole, i18n.language]);

    useEffect(() => {
      setupAvailableRoles();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedInRole]);



    // -----------------------------
    // Loading UI
    // -----------------------------
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      );
    }

    const totalCount = tableRows.length;

    // -----------------------------
    // UI
    // -----------------------------
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Typography
          variant="h6"
          component="h6"
          sx={{
            fontWeight: 600,
            letterSpacing: "0.5px",
            mb: 1,
            fontSize:"16px"
          }}
        >
          {t("admin.userManagement")}
        </Typography>

        {/* Header Card */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            border: "1px solid grey",
            bgcolor: "background.paper",
          }}
        >
          <CardContent>
            <Typography variant="body2" color="text.secondary" mt={0.5} sx={{ fontSize:"14px"}}>
              {t("admin.userMngTitle")}:{" "}
              <p style={{fontSize:"13px",fontWeight:600}}>
                {availableRoles.length > 0
                  ? availableRoles.map((r) => ROLE_LABELS[r] || r).join(", ")
                  : "None"}
              </p>
            </Typography>
            {loggedInUser?.districtName && (
              <Typography variant="body2" color="textSecondary">
                {" "}
                Geographical Scope: {loggedInUser.districtName}{" "}
                {loggedInUser?.blockName && ` → ${loggedInUser.blockName}`}{" "}
                {loggedInUser?.cmtcCenterName &&
                  ` → ${loggedInUser.cmtcCenterName}`}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* ADD / EDIT FORM (Restored fully) */}
        {showForm && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              borderRadius: 3,
              border: "1px solid grey",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography sx={{ fontWeight: 600 }}>
                {isEditing ? t("admin.editUser") : t("admin.addNewUser")}
              </Typography>

              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setShowForm(false);
                  navigate("/admin/users"); // reset edit mode
                }}
              >
                { t("admin.cancel")}
              </Button>
            </Box>

            <UserForm
              formData={formData}
              validationErrors={validationErrors}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleRoleChange={handleRoleChange}
              renderGeographicalDropdown={renderGeographicalDropdown}
              availableRoles={availableRoles}
              ROLE_LABELS={ROLE_LABELS}
              getRoleIcon={getRoleIcon}
              isEditing={isEditing}
              t={t}
              USER_ROLES={USER_ROLES}
              isOriginalDesignationRequired={isOriginalDesignationRequired} 
            />
          </Paper>
        )}

        {!showForm && (
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{ mb: 2 }}
            onClick={() => {
              resetForm();
              setShowForm(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
          { t("admin.addUser")}
          </Button>
        </Box>
      )}

        {/* USERS TABLE */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid grey",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            gap={2}
            flexWrap="wrap"
          >
            <Box>
              <Typography variant="h4" component="h2" sx={{ fontSize:"16px",fontWeight:600}}>
                {t("admin.umUsersScope")}({totalCount})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize:"14px"}}>
                {t("admin.umUsersScopeTitle")}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <TextField
                sx={inputSx}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("admin.umSearchText")}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
                  endAdornment: searchTerm ? (
                    <Button
                      onClick={() => setSearchTerm("")}
                      size="small"
                      variant="text"
                      startIcon={<ClearIcon fontSize="small" />}
                      sx={{ minWidth: "auto" }}
                    >
                      Clear
                    </Button>
                  ) : null,
                }}
              />

            
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel> {t("admin.umRole")}</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                {allRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {ROLE_LABELS[role] || role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {(loggedInRole === USER_ROLES.PORTAL_ADMIN ||
                loggedInRole === USER_ROLES.ZONAL_HEAD) && (
                <Button
                  variant={showAllSystemUsers ? "contained" : "outlined"}
                  startIcon={<VisibilityIcon />}
                  onClick={() => setShowAllSystemUsers((v) => !v)}
                >
                  {" "}
                  {showAllSystemUsers
                    ? t("admin.showingUsers")
                    : t("admin.showUsers")}{" "}
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb:  2 }} />

          {totalCount === 0 ? (
            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              py={4}
            >
              No users found.
            </Typography>
          ) : (

            <UserTable
              pagedRows={pagedRows}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              order={order}
              orderBy={orderBy}
              handleRequestSort={handleRequestSort}
              setPage={setPage}
              setRowsPerPage={setRowsPerPage}
              getUserDistrictName={getUserDistrictName}
              getUserBlockName={getUserBlockName}
              getRoleIcon={getRoleIcon}
              ROLE_LABELS={ROLE_LABELS}
              USER_ROLES={USER_ROLES}
              canModifyUser={canModifyUser}
              handleToggleEnabled={handleToggleEnabled}
              handleDeleteClick={handleDeleteClick}
              navigate={navigate}
              loggedInRole={loggedInRole}
              t={t}
            />
          )}
        </Paper>

        {/* Delete Confirm */}
        <Dialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete user "{userToDelete?.username}"?
              {userToDelete?.enabled && " This user is currently active."}
              <br />
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            variant="standard"
            onClose={handleCloseSnackbar}
            sx={{ width: "100%", fontSize: "0.95rem", fontWeight: 500 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  };

  export default UserManagementPage;