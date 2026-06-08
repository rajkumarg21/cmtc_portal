import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Grid, Snackbar,
  Alert, Box, Table, TableHead, TableBody, TableRow, TableCell, Chip
} from '@mui/material';
import {
  getImportantLinks,
  createImportantLink,
  updateImportantLink,
  deleteImportantLink,
  enableImportantLink,
  disableImportantLink,
} from '../../services/importantLinkService';

const ImportantLinkManagementPage = () => {
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState({ id: null, title: '', url: '', enabled: true });
  const [isEditing, setIsEditing] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    const data = await getImportantLinks();
    setLinks(data);
  };

  const showSnackbar = (message, severity) =>
    setSnackbar({ open: true, message, severity });

  const handleCloseSnackbar = () =>
    setSnackbar(prev => ({ ...prev, open: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      url: form.url,
      enabled: form.enabled,
    };

    try {
      if (isEditing) {
        await updateImportantLink(form.id, payload);
        showSnackbar('Updated successfully', 'success');
      } else {
        await createImportantLink(payload);
        showSnackbar('Created successfully', 'success');
      }

      setForm({ id: null, title: '', url: '', enabled: true });
      setIsEditing(false);
      loadLinks();

    } catch (err) {
      showSnackbar('Failed: ' + (err.response?.data || err.message), 'error');
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setIsEditing(true);
  };

  const handleToggle = async (item) => {
    if (item.enabled) {
      await disableImportantLink(item.id);
      showSnackbar(`Disabled "${item.title}"`, 'info');
    } else {
      await enableImportantLink(item.id);
      showSnackbar(`Enabled "${item.title}"`, 'success');
    }
    loadLinks();
  };

  const handleDelete = async (item) => {
    await deleteImportantLink(item.id);
    showSnackbar(`Deleted "${item.title}"`, 'success');
    loadLinks();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Important Links Management
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" align="center">
          {isEditing ? 'Edit Link' : 'Add New Link'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" name="title"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="URL" name="url"
                value={form.url}
                onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                required
              />
            </Grid>

            <Grid item xs={12} textAlign="center">
              <Button type="submit" variant="contained">
                {isEditing ? 'Update' : 'Create'}
              </Button>
              <Button sx={{ ml: 2 }} variant="outlined"
                onClick={() => { setForm({ id: null, title: '', url: '', enabled: true }); setIsEditing(false); }}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* TABLE */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" align="center" gutterBottom>
          All Important Links
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {links.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.url}</TableCell>
                <TableCell>
                  <Chip
                    label={item.enabled ? 'Enabled' : 'Disabled'}
                    color={item.enabled ? 'success' : 'error'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button variant="outlined" sx={{ mr: 1 }} onClick={() => handleEdit(item)}>Edit</Button>
                  <Button variant="outlined" sx={{ mr: 1 }}
                    color={item.enabled ? 'error' : 'success'}
                    onClick={() => handleToggle(item)}>
                    {item.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button variant="outlined" color="error"
                    onClick={() => handleDelete(item)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ImportantLinkManagementPage;
