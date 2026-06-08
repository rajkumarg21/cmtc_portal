// // src/pages/cmtc/CmtcOfficerManagement.jsx

// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   Button,
//   Chip,
//   Container,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Snackbar,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from "@mui/material";
// import { useNavigate, useParams } from "react-router-dom";

// import { getAllCenters } from "../../services/cmtcCenterService";
// import {
//   activateOfficer,
//   addOfficer,
//   deactivateOfficer,
//   deleteOfficer,
//   getAllCenterOfficers,
//   getAllUsers,
//   getCenterOfficerById,
//   updateOfficer,
// } from "../../services/cmtcOfficer";
// import{OFFICER_DESIGNATIONS} from "../../utils/constants"

// const INITIAL_FORM = {
//   centerId: "",
//   officerUserId: "",
//   officerDesignation: null,
//   isActive: true,
// };

// const CmtcOfficerManagement = () => {
//   const navigate = useNavigate();
//   const { officerId } = useParams();
//   const isEditing = Boolean(officerId);

//   const [centers, setCenters] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [officers, setOfficers] = useState([]);
//   const [formData, setFormData] = useState(INITIAL_FORM);

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   const [deleteConfirm, setDeleteConfirm] = useState(false);
//   const [officerToDelete, setOfficerToDelete] = useState(null);

//   /* ----------------------------- helpers ----------------------------- */

//   const showSnackbar = (message, severity = "success") =>
//     setSnackbar({ open: true, message, severity });

//   const closeSnackbar = () =>
//     setSnackbar((prev) => ({ ...prev, open: false }));

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   /* ----------------------------- data load ---------------------------- */

//   useEffect(() => {
//     fetchCenters();
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     fetchOfficers();
//     if (isEditing && users.length) {
//       fetchOfficerForEdit();
//     }
//   }, [officerId, users]);

//   const fetchCenters = async () => {
//     const res = await getAllCenters();
//     setCenters(res || []);
//   };

//   const fetchUsers = async () => {
//     try {
//       const res = await getAllUsers();
//       setUsers(Array.isArray(res?.data) ? res.data : []);
//     } catch {
//       setUsers([]);
//     }
//   };

//   const fetchOfficers = async () => {
//     const data = await getAllCenterOfficers();
//     setOfficers(data || []);
//   };

//   const fetchOfficerForEdit = async () => {
//     if (!officerId) return;
//     try {
//       const officer = await getCenterOfficerById(officerId);

//       setFormData({
//         centerId: Number(officer.centerId),
//         officerUserId: Number(officer.officerUserId),
//         officerDesignation: officer.officerDesignation,
//         isActive: officer.isActive ?? true,
//       });
//     } catch {
//       showSnackbar("Failed to load officer details", "error");
//     }
//   };

//   /* ----------------------------- submit ------------------------------- */

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (isEditing) {
//         await updateOfficer(officerId, formData);
//         showSnackbar("Officer updated successfully");
//       } else {
//         await addOfficer(formData);
//         showSnackbar("Officer added successfully");
//       }
//       navigate("/cms/cmtc-officer");
//     } catch {
//       showSnackbar("Failed to save officer", "error");
//     }
//     setFormData(INITIAL_FORM);
//     fetchOfficers();
//   };

//   /* ----------------------------- actions ------------------------------ */

//   const toggleStatus = async (officer) => {
//     try {
//       officer.isActive
//         ? await deactivateOfficer(officer.id)
//         : await activateOfficer(officer.id);
//       showSnackbar("Status updated");
//       fetchOfficers();
//     } catch {
//       showSnackbar("Failed to update status", "error");
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await deleteOfficer(officerToDelete.id);
//       showSnackbar("Officer deleted");
//       fetchOfficers();
//     } catch {
//       showSnackbar("Failed to delete officer", "error");
//     }
//     setDeleteConfirm(false);
//   };

//   /* ----------------------------- UI ---------------------------------- */

//   return (
//     <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//       <Typography variant="h3" align="center" fontWeight="bold" mb={3}>
//         CMTC Officer Management
//       </Typography>

//       {/* FORM */}
//       <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           {isEditing ? "Edit Officer" : "Add New Officer"}
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           <Grid container spacing={3}>
//             <Grid item xs={12} sm={6} size={3}>
//               <FormControl fullWidth required >
//                 <InputLabel id="center-label">CMTC Center</InputLabel>
//                 <Select
//                   labelId="center-label"
//                   label="CMTC Center"
//                   name="centerId"
//                   value={formData.centerId || ""}
//                   onChange={handleChange}
//                   sx={{
//                     width:"100%",
//                   }}
//                 >
//                   <MenuItem value="">Select Center</MenuItem>
//                   {centers.map((c) => (
//                     <MenuItem key={c.centerId} value={c.centerId}>
//                       {c.centerName || c.name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm={6} size={3}>
//               <FormControl fullWidth required>
//                 <InputLabel id="center-label">Officer</InputLabel>
//                 <Select
//                   labelId="center-label"
//                   label="CMTC Center"
//                   name="officerUserId"
//                   value={formData.officerUserId || ""}
//                   onChange={handleChange}
//                   sx={{
//                     width:"100%",
//                   }}
//                 >
//                   <MenuItem value="">Select Officer</MenuItem>
//                   {users.map((u) => (
//                     <MenuItem key={u.id} value={u.id}>
//                       {u.fullName}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm={6} size={3}>
//               <FormControl fullWidth required>
//                 <InputLabel id="center-label">Designation</InputLabel>
//                 <Select
//                   labelId="center-label"
//                   label="CMTC Center"
//                   name="officerDesignation"
//                   value={formData.officerDesignation ?? ""}
//                   onChange={handleChange}
//                   sx={{
//                     width:"100%",
//                   }}
//                 >
//                   <MenuItem value="">Select Designation</MenuItem>
//                   {Object.entries(OFFICER_DESIGNATIONS).map(([value, label]) => (
//                     <MenuItem key={value} value={value}>
//                     {label}
//                    </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} textAlign="center" size={3}>
//               <Button type="submit" variant="contained" 
//                sx={{
//                     width:"100%",
//                     py:2,
//                     fontWeight:600,
//                   }}>
//                 {isEditing ? "Update Officer" : "Add Officer"}
//               </Button>
//             </Grid>
//           </Grid>
//         </form>
//       </Paper>

//       {/* LIST */}
//       <Paper elevation={3} sx={{ p: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           All Officers
//         </Typography>

//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>#</TableCell>
//                 <TableCell>Center</TableCell>
//                 <TableCell>Name</TableCell>
//                 <TableCell>Designation</TableCell>
//                 <TableCell>Mobile</TableCell>
//                 <TableCell>Email</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell align="right">Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {officers.map((o, i) => (
//                 <TableRow key={o.id}>
//                   <TableCell>{i + 1}</TableCell>
//                   <TableCell>{o.centerName}</TableCell>
//                   <TableCell>{o.officerName}</TableCell>
//                   <TableCell>{o.officerDesignation}</TableCell>
//                   <TableCell>{o.officerMobile}</TableCell>
//                   <TableCell>{o.officerEmail}</TableCell>
//                   <TableCell>
//                     <Chip
//                       label={o.isActive ? "Active" : "Inactive"}
//                       color={o.isActive ? "success" : "error"}
//                       size="small"
//                       variant="outlined"
//                     />
//                   </TableCell>
//                   <TableCell align="right">
//                     <Button
//                      variant="outlined"
//                       size="small"
//                       onClick={() =>
//                         navigate(`/cms/cmtc-officer/${o.id}`)
//                       }
//                     >
//                       Edit
//                     </Button>
//                     <Button
//                      variant="outlined"
//                       size="small"
//                       sx={{ mx: 1 }}
//                       color={o.isActive ? "error" : "success"}
//                       onClick={() => toggleStatus(o)}
//                     >
//                       {o.isActive ? "Deactivate" : "Activate"}
//                     </Button>
//                     <Button
//                      variant="outlined"
//                       size="small"
//                       color="error"
//                       onClick={() => {
//                         setOfficerToDelete(o);
//                         setDeleteConfirm(true);
//                       }}
//                     >
//                       Delete
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       {/* DELETE CONFIRM */}
//       <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
//         <DialogTitle>Delete Officer?</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete "
//             {officerToDelete?.officerName}"?
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDeleteConfirm(false)}>Cancel</Button>
//           <Button color="error" onClick={handleDelete}>
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* SNACKBAR */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={closeSnackbar}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//       >
//         <Alert
//           severity={snackbar.severity}
//           onClose={closeSnackbar}
//           variant="filled"
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// };

// export default CmtcOfficerManagement;
