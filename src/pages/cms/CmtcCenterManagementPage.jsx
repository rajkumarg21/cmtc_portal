// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Typography,
//   Box,
//   TextField,
//   Button,
//   Grid,
//   CircularProgress,
//   Alert,
//   Snackbar,
//   Paper,
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Chip
// } from "@mui/material";
// import { useNavigate, useParams } from "react-router-dom";
// import commonService from "../../services/commanService";
// import {
//   getAllCenters,
//   getCenterById,
//   createCenter,
//   updateCenter,
//   activateCenter,
//   deactivateCenter,
//   deleteCenter,
// } from "../../services/cmtcCenterService";
// const CmtcCenterManagementPage = () => {
//   const { centerId } = useParams();
//   const navigate = useNavigate();

//   const isEditing = Boolean(centerId);

//   const [centers, setCenters] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [blocks, setBlocks] = useState([]);

//   const [formData, setFormData] = useState({  
//   centerId:"",
//   centerName: "",
//   code: "",
//   address: "",
//   pincode: "",
//   contactNumber: "",
//   centerType: "",
//   establishmentYear: "",
//   capacity: "",
//   trainingHalls: "",
//   rooms: "",
//   description: "",
//   districtId: "",
//   blockId: "",
//   isActive: true,
// });


//   const [loading, setLoading] = useState(true);
//   const [validationErrors, setValidationErrors] = useState({});
//   const [error, setError] = useState("");
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [centerToDelete, setCenterToDelete] = useState(null);

//   const showSnackbar = (msg, severity = "success") =>
//     setSnackbar({ open: true, message: msg, severity });

//   const handleCloseSnackbar = () =>
//     setSnackbar((prev) => ({ ...prev, open: false }));

//   const fetchCenters = async () => {
//     try {
//     const res = await getAllCenters();
//     setCenters(res.data); 
//   } catch (err) {
//     showSnackbar("Failed to fetch centers", "error");
//   }
//   };

//   const fetchCenterForEdit = async () => {
//     if (!isEditing) return;

//     try {
//       const reponse = await getCenterById(centerId);
//       const data = reponse.data;
//       setFormData({
//         centerId: data.centerId ||"",
//         centerName: data.centerName || "",
//         code: data.code || "",
//         address: data.address || "",
//          pincode: data.pincode || "",
//         contactNumber: data.contactNumber || "",
//         centerType: data.centerType || "",
//         establishmentYear: data.establishmentYear || "",
//        capacity: data.capacity || "",
//         trainingHalls: data.trainingHalls || "",
//          rooms: data.rooms || "",
//         description: data.description || "",
//         districtId: data.districtId || "",
//         blockId: data.blockId || "",
//         isActive: data.isActive,
//       });
//       if (data.districtId) {
//    await loadBlocks(data.districtId); // <-- Important for edit mode
// }
//     } catch (err) {
//       showSnackbar("Failed to load center details", "error");
//     }
//   };

//   useEffect(() => {
//     const load = async () => {
//       await fetchCenters();
//       await fetchCenterForEdit();
//       loadDistricts();
//       setLoading(false);
//     };
//     load();
//   }, [centerId]);

//   // load district
//   const loadDistricts = async () => {
//   try {
//     const response = await commonService.getDistricts();
//     setDistricts(response.data);
//   } catch (err) {
//     showSnackbar("Failed to load districts", "error");
//   }
// };

// // load block 
// const loadBlocks = async (districtId) => {
//   try {
//     const response = await commonService.getBlocksByDistrict(districtId);

//     // If block list is empty
//     if (!response.data || response.data.length === 0) {
//       setBlocks([]);
//       showSnackbar("No blocks available for the selected district.", "warning");
//       return;
//     }

//     setBlocks(response.data);

//   } catch (err) {
//     const message =
//       err.response?.status === 404
//         ? err.response.data
//         : "Failed to load blocks";
      
//     showSnackbar(message, "error");
//     setBlocks([]);
//   }
// };


//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({ ...prev, [name]: value }));

//     if (name === "districtId") {
//     loadBlocks(value);       // 🔥 fetch blocks dynamically
//     setFormData((prev) => ({ ...prev, blockId: "" }));  // reset block
//   }
//   };

//   const validateForm = () => {
//     const errors = {};

//     if (!formData.centerName.trim())
//       errors.centerName = "Center name is required";

//     if (!formData.code.trim())
//       errors.code = "Center code is required";

//     // if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail))
//     //   errors.contactEmail = "Invalid email";

//     // if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
//     //   errors.email = "Invalid email";

//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setLoading(true);

//     try {
//       if (isEditing) {
//         await updateCenter(centerId, formData);
//         showSnackbar("Center updated successfully");
//       } else {
//         await createCenter(formData);
//         showSnackbar("Center created successfully");
//       }

//       navigate("/cms/cmtc-centers");
//     } catch (err) {
//       showSnackbar("Failed to save center", "error");
//     } finally {
//       setLoading(false);
//       fetchCenters();
//     }
//   };

//   const handleToggleStatus = async (center) => {
//     try {
//       if (center.isActive) {
//         await deactivateCenter(center.centerId);
//         showSnackbar("Center deactivated");
//       } else {
//         await activateCenter(center.centerId);
//         showSnackbar("Center activated");
//       }
//       fetchCenters();
//     } catch (err) {
//       showSnackbar("Failed to update status", "error");
//     }
//   };

//   const handleDeleteClick = (center) => {
//     setCenterToDelete(center);
//     setShowDeleteConfirm(true);
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       await deleteCenter(centerToDelete.centerId);
//       showSnackbar("Center deleted");
//       setCenters(centers.filter((c) => c.centerId !== centerToDelete.centerId));
//     } catch (err) {
//       showSnackbar("Failed to delete center", "error");
//     } finally {
//       setShowDeleteConfirm(false);
//     }
//   };

//   if (loading)
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
//         <CircularProgress />
//       </Box>
//     );

//   return (
//     <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
//       <Typography variant="h3" align="center" sx={{ fontWeight: "bold", mb: 3 }}>
//         CMTC Center Management AAAAAA
//       </Typography>

//       {/* FORM SECTION */}
//       <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           {isEditing ? "Edit Center" : "Add New Center"}
//         </Typography>

//         <Box component="form" onSubmit={handleSubmit}>
//           <Grid container spacing={3}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Center Name"
//                 name="centerName"
//                 value={formData.centerName}
//                 onChange={handleChange}
//                 error={!!validationErrors.centerName}
//                 helperText={validationErrors.centerName}
//                 required
//               />
//             </Grid>

//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Center Code"
//                 name="code"
//                 value={formData.code}
//                 onChange={handleChange}
//                 required
//               />
//             </Grid>

//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Address"
//                 name="address"
//                 value={formData.address}
//                 onChange={handleChange}
//               />
//             </Grid>

//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Pincode"
//                 name="pincode"
//                 value={formData.pincode}
//                 onChange={handleChange}
                
//               />
//             </Grid>

//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Contact Number"
//                 name="contactNumber"
//                 value={formData.contactNumber}
//                 onChange={handleChange}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Center Type</InputLabel>
//                 <Select
//                   name="centerType"
//                   label="Center Type"
//                   value={formData.centerType}
//                   onChange={handleChange}
//                 >
//                   <MenuItem value="">Select Type</MenuItem>
//                   <MenuItem value="Training">Training</MenuItem>
//                   <MenuItem value="Residential">Residential</MenuItem>
//                   <MenuItem value="Non-Residential">Non Residential</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Establishment Year"
//                 name="establishmentYear"
//                 type="number"
//                 value={formData.establishmentYear}
//                 onChange={handleChange}
//               />
//             </Grid>

//             <Grid item xs={12} sm={4}>
//               <TextField
//                 fullWidth
//                 label="Total Capacity Trainees"
//                 name="capacity"
//                 type="number"
//                 value={formData.capacity}
//                 onChange={handleChange}
//               />
//             </Grid>

//             <Grid item xs={12} sm={4}>
//               <TextField
//                 fullWidth
//                 label="Training Halls"
//                 name="trainingHalls"
//                 type="number"
//                 value={formData.trainingHalls}
//                 onChange={handleChange}
//               />
//             </Grid>

//             <Grid item xs={12} sm={4}>
//               <TextField
//                 fullWidth
//                 label="Rooms"
//                 name="rooms"
//                 type="number"
//                 value={formData.rooms}
//                 onChange={handleChange}
//               />
//             </Grid>
//              <Grid item xs={12} sm={4}>
//               <TextField
//                 fullWidth
//                 label="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//               />
//             </Grid>

            
//             <Grid item xs={12} sm={6}>
//             <FormControl fullWidth required>
//                <InputLabel>District</InputLabel>
//                  <Select
//                    name="districtId"
//                    label="District"
//                    value={formData.districtId}
//                    onChange={handleChange}
//                     >
//                <MenuItem value="">Select District</MenuItem>
//                 {districts.map((dist) => (
//                         <MenuItem key={dist.districtId} value={dist.districtId}>
//                    {dist.districtNameEn}
//                   </MenuItem>
//                  ))}
//                </Select>
//                </FormControl>
//              </Grid>
//              <Grid item xs={12} sm={6}>
//                  <FormControl fullWidth required>
//                 <InputLabel>Block</InputLabel>
//                   <Select
//                   name="blockId"
//                   label="Block"
//                    value={formData.blockId}
//                  onChange={handleChange}
//                 disabled={!formData.districtId}
//                  >
//                   <MenuItem value="">Select Block</MenuItem>
//                    {blocks.map((block) => (
//                    <MenuItem key={block.blockId} value={block.blockId}>
//                      {block.blockNameEn}
//                  </MenuItem>
//                ))}
//               </Select>
//             </FormControl>
//             </Grid>
//             <Grid
//               item
//               xs={12}
//               sx={{ display: "flex", justifyContent: "center", mt: 2 }}
//             >
//               <Button type="submit" variant="contained">
//                 {isEditing ? "Update Center" : "Create Center"}
//               </Button>
//             </Grid>
//           </Grid>
//         </Box>
//       </Paper>

//       {/* LIST SECTION */}
//       <Paper elevation={3} sx={{ p: 4 }}>
//         <Typography variant="h4" align="center" gutterBottom>
//           All Centers
//         </Typography>

//         {centers.length === 0 ? (
//           <Typography align="center">No centers available.</Typography>
//         ) : (
//           <TableContainer>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>#</TableCell>
//                   <TableCell>Center Name</TableCell>
//                   <TableCell>Center Code</TableCell>
//                   {/* <TableCell>Manager</TableCell>
//                   <TableCell>Email</TableCell> */}
//                   <TableCell>Mobile</TableCell>
//                   <TableCell>Status</TableCell>
//                   <TableCell align="right">Actions</TableCell>
//                 </TableRow>
//               </TableHead>

//               <TableBody>
//                 {centers.map((center, index) => (
//                   <TableRow key={center.centerId}>
//                     <TableCell>{index + 1}</TableCell>
//                     <TableCell>{center.centerName}</TableCell>
//                     <TableCell>{center.code}</TableCell>
//                     <TableCell>{center.contactNumber}</TableCell>
//                     <TableCell>
//                       <Chip
//                         label={center.isActive ? "Active" : "Inactive"}
//                         color={center.isActive ? "success" : "error"}
//                         variant="outlined"
//                         size="small"
//                       />
//                     </TableCell>

//                     <TableCell align="right">
//                       <Button
//                         variant="outlined"
//                         onClick={() => navigate(`/cms/cmtc-centers/${center.centerId}`)}
//                         size="small"
//                       >
//                         Edit
//                       </Button>

//                       <Button
//                         variant="outlined"
//                         size="small"
//                         sx={{ mx: 1 }}
//                         color={center.isActive ? "error" : "success"}
//                         onClick={() => handleToggleStatus(center)}
//                       >
//                         {center.isActive ? "Deactivate" : "Activate"}
//                       </Button>

//                       <Button
//                         variant="outlined"
//                         size="small"
//                         color="error"
//                         onClick={() => handleDeleteClick(center)}
//                       >
//                         Delete
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}
//       </Paper>

//       {/* DELETE CONFIRMATION */}
//       <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
//         <DialogTitle>Delete Center?</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to delete "{centerToDelete?.centerName}"? This cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
//           <Button onClick={handleConfirmDelete} color="error">
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* SNACKBAR */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//       >
//         <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} variant="filled">
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// };

// export default CmtcCenterManagementPage;
