// src/components/admin/DepartmentManagementPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, TextField, Button, Grid, CircularProgress,
  Snackbar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox,
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip,
  ToggleButton, ToggleButtonGroup, Alert
} from '@mui/material';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  enableDepartment,
  disableDepartment,
  deleteDepartment
} from '../../services/departmentService';
import {
  getAllSubDepartments,
  getSubDepartmentsByDepartmentId,
  getSubDepartmentById,
  createSubDepartment,
  updateSubDepartment,
  enableSubDepartment,
  disableSubDepartment,
  deleteSubDepartment
} from '../../services/subDepartmentService';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../utils/constants';
import { useTranslation } from "react-i18next";
/*
  Minimal comments only on "why". Code follows best practices: split handlers, validation,
  clear state for main vs sub flows.
*/

const DepartmentManagementPage = () => {
  const { hasRole } = useAuth();
   const { t} = useTranslation();
  // Mode: 'main' or 'sub'
  const [mode, setMode] = useState('main');

  // Data lists
  const [mainDepartments, setMainDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);

  // Sub filter
  const [selectedMainId, setSelectedMainId] = useState('');

  // Forms
  const [formMain, setFormMain] = useState({ id: null, name: '', enabled: true });
  const [formSub, setFormSub] = useState({ id: null, name: '', mainId: '', enabled: true });

  // UI state
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, itemType: null });

  const [isEditingMain, setIsEditingMain] = useState(false);
  const [isEditingSub, setIsEditingSub] = useState(false);

  // Access control
  useEffect(() => {
    if (!hasRole([USER_ROLES.PORTAL_ADMIN])) {
      setLoading(false);
      setSnackbar({ open: true, message: 'You do not have permission to access this page.', severity: 'error' });
    } else {
      fetchInitial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRole]);

  // Initial fetch
  const fetchInitial = async () => {
    setLoading(true);
    try {
      const mains = await getAllDepartments();
      setMainDepartments(mains.sort((a, b) => a.name.localeCompare(b.name)));

      // Initially fetch all subdepartments for convenience
      const subs = await getAllSubDepartments();
      setSubDepartments(subs.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      showSnackbar('Failed to fetch data: ' + (err.response?.data || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // When selectedMainId changes in sub mode, fetch filtered subs
  useEffect(() => {
    if (mode === 'sub') {
      fetchSubsForMain(selectedMainId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMainId, mode]);

  const fetchSubsForMain = async (mainId) => {
    setLoading(true);
    try {
      if (!mainId) {
        const all = await getAllSubDepartments();
        setSubDepartments(all.sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        const filtered = await getSubDepartmentsByDepartmentId(mainId);
        setSubDepartments(filtered.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (err) {
      showSnackbar('Failed to fetch sub-departments: ' + (err.response?.data || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // Mode switch
  const handleModeChange = (_, value) => {
    if (!value) return;
    setMode(value);
    // reset forms & errors
    setValidationErrors({});
    resetForms();
  };

  const resetForms = () => {
    setFormMain({ id: null, name: '', enabled: true });
    setFormSub({ id: null, name: '', mainId: selectedMainId || '', enabled: true });
    setIsEditingMain(false);
    setIsEditingSub(false);
  };

  // Validation
  const validateName = (value) => {
    if (!value || !value.trim()) return 'Name is required';
    if (!/^[a-zA-Z0-9 ]{3,}$/.test(value.trim())) return 'Name must be at least 3 alphanumeric characters';
    return null;
  };

  // Main handlers
  const handleMainChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormMain(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmitMain = async (e) => {
    e.preventDefault();
    const nameError = validateName(formMain.name);
    if (nameError) {
      setValidationErrors({ name: nameError });
      return;
    }
    setLoading(true);
    try {
      const payload = { name: formMain.name.trim(), enabled: !!formMain.enabled };
      if (isEditingMain && formMain.id) {
        await updateDepartment(formMain.id, payload);
        showSnackbar('✅ Main Department updated successfully', 'success');
      } else {
        await createDepartment(payload);
        showSnackbar('✅ Main Department created successfully', 'success');
      }
      await fetchInitial();
      resetForms();
    } catch (err) {
      showSnackbar('❌ ' + (err.response?.data?.message || err.response?.data || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMain = async (dept) => {
    setValidationErrors({});
    setIsEditingMain(true);
    setFormMain({ id: dept.id, name: dept.name || '', enabled: !!dept.enabled });
    setMode('main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleMainEnabled = async (dept) => {
    setLoading(true);
    try {
      if (dept.enabled) {
        await disableDepartment(dept.id);
        showSnackbar(`🚫 "${dept.name}" disabled.`, 'info');
      } else {
        await enableDepartment(dept.id);
        showSnackbar(`✅ "${dept.name}" enabled.`, 'success');
      }
      await fetchInitial();
    } catch (err) {
      showSnackbar('Failed to toggle: ' + (err.response?.data || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sub handlers
  const handleSubChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormSub(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubMainSelect = (e) => {
    const value = e.target.value;
    setSelectedMainId(value);
    setFormSub(prev => ({ ...prev, mainId: value }));
  };

  const handleSubmitSub = async (e) => {
    e.preventDefault();
    const nameError = validateName(formSub.name);
    if (nameError) {
      setValidationErrors({ name: nameError });
      return;
    }
    if (!formSub.mainId) {
      setValidationErrors({ mainId: 'Please select a main department' });
      return;
    }
    setLoading(true);
    try {
      const payload = { name: formSub.name.trim(), enabled: !!formSub.enabled };
      if (isEditingSub && formSub.id) {
        await updateSubDepartment(formSub.mainId, formSub.id, payload);
        showSnackbar('✅ Sub Department updated successfully', 'success');
      } else {
        await createSubDepartment(formSub.mainId, payload);
        showSnackbar('✅ Sub Department created successfully', 'success');
      }
      await fetchSubsForMain(formSub.mainId);
      // also refresh mains to keep everything synced
      const mains = await getAllDepartments();
      setMainDepartments(mains.sort((a, b) => a.name.localeCompare(b.name)));
      resetForms();
    } catch (err) {
      showSnackbar('❌ ' + (err.response?.data?.message || err.response?.data || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSub = async (sub) => {
    setValidationErrors({});
    setIsEditingSub(true);
    setMode('sub');
    setSelectedMainId(sub.mainDepartment?.id || sub.mainId || '');
    setFormSub({
      id: sub.id,
      name: sub.name || '',
      mainId: sub.mainDepartment?.id || sub.mainId || '',
      enabled: !!sub.enabled
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSubEnabled = async (sub) => {
    setLoading(true);
    try {
      if (sub.enabled) {
        await disableSubDepartment(sub.mainDepartment?.id || sub.mainId, sub.id);
        showSnackbar(`🚫 Sub "${sub.name}" disabled.`, 'info');
      } else {
        await enableSubDepartment(sub.mainDepartment?.id || sub.mainId, sub.id);
        showSnackbar(`✅ Sub "${sub.name}" enabled.`, 'success');
      }
      await fetchSubsForMain(selectedMainId);
    } catch (err) {
      showSnackbar('Failed to toggle: ' + (err.response?.data || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete flow (main or sub)
  const confirmDelete = (item, type) => {
    setDeleteDialog({ open: true, item, itemType: type });
  };

  const handleConfirmDelete = async () => {
    const { item, itemType } = deleteDialog;
    if (!item || !itemType) {
      setDeleteDialog({ open: false, item: null, itemType: null });
      return;
    }
    setLoading(true);
    try {
      if (itemType === 'main') {
        await deleteDepartment(item.id);
        showSnackbar(`🗑️ Main "${item.name}" deleted.`, 'success');
        await fetchInitial();
      } else {
        const mainId = item.mainDepartment?.id || item.mainId;
        await deleteSubDepartment(mainId, item.id);
        showSnackbar(`🗑️ Sub "${item.name}" deleted.`, 'success');
        await fetchSubsForMain(selectedMainId);
      }
    } catch (err) {
      showSnackbar('Failed to delete: ' + (err.response?.data || err.message), 'error');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, item: null, itemType: null });
    }
  };

  // Render loading
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography
              variant="h6"
              component="h6"
              sx={{
                fontWeight: 600,
                letterSpacing: "0.5px",
                mb: 1,
              }}
            > {t("admin.departmentManagement")}
      </Typography>

      <Box display="flex"  mb={3}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="mode"
        >
          <ToggleButton value="main" aria-label="main mode">{t("admin.mainDepartment")}</ToggleButton>
          <ToggleButton value="sub" aria-label="sub mode">{t("admin.subDepartment")}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* FORM */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
       <Typography
               variant="h6"
               component="h6"
               sx={{
                 fontWeight: 600,
                 letterSpacing: "0.5px",
                 mb: 1,
               }}
             >
          {mode === 'main' ? (isEditingMain ? t("admin.editMainDepartment") : t("admin.addMainDepartment")) : (isEditingSub ? t("admin.editSubDepartment") : t("admin.addSubDepartment"))}
        </Typography>

        <Box component="form" onSubmit={mode === 'main' ? handleSubmitMain : handleSubmitSub} noValidate>
          <Grid container spacing={2} alignItems="center">
            {mode === 'sub' && (
              <Grid item xs={12} sm={4} size={6}>
                <FormControl fullWidth required error={!!validationErrors.mainId}>
                  <InputLabel id="main-select-label"> {t("admin.mainDepartment")}</InputLabel>
                  <Select
                    labelId="main-select-label"
                    id="main-select"
                    value={mode === 'sub' ? (formSub.mainId || selectedMainId || '') : ''}
                    name="mainId"
                    label={t("admin.mainDepartment")}
                    onChange={(e) => { handleSubMainSelect(e); handleSubChange(e); }}
                  >
                    <MenuItem value="">
                      <em>All / Select</em>
                    </MenuItem>
                    {mainDepartments.map(md => (
                      <MenuItem key={md.id} value={md.id}>{md.name}</MenuItem>
                    ))}
                  </Select>
                  {validationErrors.mainId && <Typography color="error" variant="caption">{validationErrors.mainId}</Typography>}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={mode === 'sub' ? 6 : 8} size={mode === 'sub' ? 6 : 8}>
              <TextField
                fullWidth
                label={t("admin.deptName")}
                name="name"
                value={mode === 'main' ? formMain.name : formSub.name}
                onChange={mode === 'main' ? handleMainChange : handleSubChange}
                required
                error={!!validationErrors.name}
                helperText={validationErrors.name}
              />
            </Grid>

            <Grid item xs={12} sm={2} size={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={mode === 'main' ? !!formMain.enabled : !!formSub.enabled}
                    onChange={mode === 'main' ? handleMainChange : handleSubChange}
                    name={t("admin.enabled")}
                    id="enabled"
                  />
                }
                label="Enabled"
              />
            </Grid>

            <Grid item xs={12} size={12} display="flex"  mt={1}>
              <Button type="submit" variant="contained" disabled={loading}>
                {mode === 'main' ? (isEditingMain ? 'Update Main' : 'Create Main') : (isEditingSub ? 'Update Sub' : 'Create Sub')}
              </Button>
              <Button
                variant="outlined"
                sx={{ ml: 2 }}
                onClick={() => { resetForms(); setValidationErrors({}); }}
              >
               {t("admin.deptReset")}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* LIST */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {mode === 'main' ? t("admin.allMainDepartments") : (selectedMainId ? `Sub Departments of "${mainDepartments.find(m => m.id === selectedMainId)?.name || ''}"` : t("admin.allSubDepartments"))}
        </Typography>

        {mode === 'sub' && (
          <Box mb={2} display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="filter-main-label">Filter by Main</InputLabel>
              <Select
                labelId="filter-main-label"
                value={selectedMainId}
                label="Filter by Main"
                onChange={(e) => setSelectedMainId(e.target.value)}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {mainDepartments.map(md => <MenuItem key={md.id} value={md.id}>{md.name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={() => { setSelectedMainId(''); fetchSubsForMain(''); }}>Refresh Sub List</Button>
          </Box>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("admin.deptName")}</TableCell>
                {mode === 'sub' && <TableCell>Main Department</TableCell>}
                <TableCell>{t("admin.deptStatus")}</TableCell>
                <TableCell align="right">{t("admin.deptActions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(mode === 'main' ? mainDepartments : subDepartments).map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  {mode === 'sub' && <TableCell>{item.mainDepartment?.name || mainDepartments.find(md => md.id === item.mainId)?.name || '-'}</TableCell>}
                  <TableCell>
                    <Chip label={item.enabled ? 'Enabled' : 'Disabled'} color={item.enabled ? 'success' : 'error'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => mode === 'main' ? handleEditMain(item) : handleEditSub(item)}>Edit</Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color={item.enabled ? 'error' : 'success'}
                        onClick={() => mode === 'main' ? handleToggleMainEnabled(item) : handleToggleSubEnabled(item)}
                      >
                        {item.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => confirmDelete(item, mode === 'main' ? 'main' : 'sub')}>
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {(mode === 'main' ? mainDepartments : subDepartments).length === 0 && (
                <TableRow>
                  <TableCell colSpan={mode === 'sub' ? 4 : 3} align="center">No {mode === 'main' ? 'main' : 'sub'} departments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete confirm */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null, itemType: null })}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteDialog.itemType === 'main' ? 'main department' : 'sub department'} "<strong>{deleteDialog.item?.name}</strong>"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null, itemType: null })}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DepartmentManagementPage;
