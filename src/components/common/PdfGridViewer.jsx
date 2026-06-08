// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Grid,
//   Box,
//   Typography,
//   IconButton,
//   Dialog,
//   DialogContent,
//   CircularProgress,
//   Button,
//   Snackbar,
//   Alert,
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import DownloadIcon from '@mui/icons-material/Download';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import { PDFDocument } from 'pdf-lib';

// const PdfGridViewer = ({ pageNo, year, fetchPages, title }) => {
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [previewIndex, setPreviewIndex] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);

//   // Snackbar state
//   const [toastOpen, setToastOpen] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');

//   const showToast = (message) => {
//     setToastMessage(message);
//     setToastOpen(true);
//   };

//   const handleToastClose = () => setToastOpen(false);

//   // Fetch API results
//   useEffect(() => {
//     if (!pageNo || !year || !fetchPages) return;
//     const loadResults = async () => {
//       setLoading(true);
//       try {
//         const res = await fetchPages(pageNo, year);
//         setResults(res?.data?.results || []);
//       } catch (err) {
//         console.error(err);
//         showToast('Failed to fetch PDFs');
//         setResults([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadResults();
//   }, [pageNo, year, fetchPages]);

//   // Keyboard navigation
//   const handleKeyDown = useCallback(
//     (e) => {
//       if (!openDialog) return;
//       if (e.key === 'ArrowLeft' && previewIndex > 0) setPreviewIndex((prev) => prev - 1);
//       if (e.key === 'ArrowRight' && previewIndex < results.length - 1) setPreviewIndex((prev) => prev + 1);
//       if (e.key === 'Escape') {
//         setOpenDialog(false);
//         setPreviewIndex(null);
//       }
//     },
//     [openDialog, previewIndex, results.length]
//   );

//   useEffect(() => {
//     if (openDialog) window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [openDialog, handleKeyDown]);

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!results.length) {
//     return <Typography>No PDFs available for this selection.</Typography>;
//   }

//   const mergeImagesToPdf = async (images) => {
//     const mergedPdf = await PDFDocument.create();
//     for (let item of images) {
//       if (!item.base64Image) continue;
//       const cleanedBase64 = item.base64Image.replace(/\s/g, '');
//       const imageBytes = Uint8Array.from(atob(cleanedBase64), (c) => c.charCodeAt(0));
//       const pngImage = await mergedPdf.embedPng(imageBytes);
//       const page = mergedPdf.addPage([pngImage.width, pngImage.height]);
//       page.drawImage(pngImage, { x: 0, y: 0, width: pngImage.width, height: pngImage.height });
//     }
//     return await mergedPdf.save();
//   };

//   return (
//     <>
//       <Grid container spacing={4}>
//         <Grid item xs={12}>
//           <Typography variant="h5" gutterBottom>
//             {title}
//           </Typography>

//           {/* Download / View All Buttons */}
//           <Box display="flex" gap={2} mb={2}>
//             {/* Download All */}
//             <Button
//               variant="contained"
//               startIcon={<DownloadIcon />}
//               onClick={async () => {
//                 try {
//                   const mergedBytes = await mergeImagesToPdf(results);
//                   const blob = new Blob([mergedBytes], { type: 'application/pdf' });
//                   const link = document.createElement('a');
//                   link.href = URL.createObjectURL(blob);
//                   link.download = 'Merged.pdf';
//                   link.click();
//                 } catch (err) {
//                   console.error('Error merging PNGs:', err);
//                   showToast('Failed to merge images into PDF');
//                 }
//               }}
//             >
//               Download All
//             </Button>

//             {/* View All */}
//             <Button
//               variant="outlined"
//               startIcon={<VisibilityIcon />}
//               onClick={async () => {
//                 try {
//                   const mergedBytes = await mergeImagesToPdf(results);
//                   const blob = new Blob([mergedBytes], { type: 'application/pdf' });
//                   const url = URL.createObjectURL(blob);
//                   window.open(url, '_blank');
//                 } catch (err) {
//                   console.error('Error viewing PNGs:', err);
//                   showToast('Failed to create PDF preview');
//                 }
//               }}
//             >
//               View All
//             </Button>
//           </Box>

//           {/* Grid Previews */}
//           <Box display="flex" flexWrap="wrap" gap={2}>
//             {results.map((item, index) =>
//               item.base64Image ? (
//                 <Box
//                   key={index}
//                   position="relative"
//                   border={1}
//                   borderRadius={2}
//                   p={1}
//                   width={120}
//                   textAlign="center"
//                 >
//                   <Box
//                     onClick={() => {
//                       setPreviewIndex(index);
//                       setOpenDialog(true);
//                     }}
//                     sx={{ cursor: 'pointer' }}
//                   >
//                     <img
//                       src={`data:image/png;base64,${item.base64Image}`}
//                       alt={item.fileName}
//                       width={100}
//                       style={{ borderRadius: 4 }}
//                     />
//                   </Box>

//                   {/* Download single PNG as PDF */}
//                   <IconButton
//                     size="small"
//                     onClick={async () => {
//                       try {
//                         const mergedPdf = await PDFDocument.create();
//                         const cleanedBase64 = item.base64Image.replace(/\s/g, '');
//                         const imageBytes = Uint8Array.from(atob(cleanedBase64), (c) => c.charCodeAt(0));
//                         const pngImage = await mergedPdf.embedPng(imageBytes);
//                         const page = mergedPdf.addPage([pngImage.width, pngImage.height]);
//                         page.drawImage(pngImage, { x: 0, y: 0, width: pngImage.width, height: pngImage.height });

//                         const pdfBytes = await mergedPdf.save();
//                         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//                         const link = document.createElement('a');
//                         link.href = URL.createObjectURL(blob);
//                         link.download = `${item.fileName || `Page-${index + 1}`}.pdf`;
//                         link.click();
//                       } catch (err) {
//                         console.error('Error downloading single PNG:', err);
//                         showToast('Failed to download image as PDF');
//                       }
//                     }}
//                     sx={{
//                       position: 'absolute',
//                       top: 4,
//                       right: 4,
//                       backgroundColor: '#1976d2',
//                       color: '#fff',
//                       '&:hover': { backgroundColor: '#115293' },
//                     }}
//                   >
//                     <DownloadIcon fontSize="small" />
//                   </IconButton>

//                   <Typography variant="caption" mt={1} display="block">
//                     {item.fileName || `Page ${index + 1}`}
//                   </Typography>
//                 </Box>
//               ) : null
//             )}
//           </Box>
//         </Grid>

//         {/* Fullscreen Preview */}
//         {previewIndex !== null && results[previewIndex]?.base64Image && (
//           <Dialog fullScreen open={openDialog} onClose={() => setOpenDialog(false)}>
//             <DialogContent sx={{ p: 0, position: 'relative', backgroundColor: '#000' }}>
//               <IconButton
//                 onClick={() => {
//                   setOpenDialog(false);
//                   setPreviewIndex(null);
//                 }}
//                 sx={{
//                   position: 'absolute',
//                   top: 16,
//                   right: 16,
//                   zIndex: 10,
//                   backgroundColor: 'rgba(255,255,255,0.6)',
//                   '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' },
//                 }}
//               >
//                 <CloseIcon />
//               </IconButton>

//               {previewIndex > 0 && (
//                 <IconButton
//                   onClick={() => setPreviewIndex((prev) => prev - 1)}
//                   sx={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: 10,
//                     transform: 'translateY(-50%)',
//                     color: '#fff',
//                     backgroundColor: 'rgba(0,0,0,0.5)',
//                     '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
//                     zIndex: 10,
//                   }}
//                 >
//                   <ChevronLeftIcon />
//                 </IconButton>
//               )}

//               {previewIndex < results.length - 1 && (
//                 <IconButton
//                   onClick={() => setPreviewIndex((prev) => prev + 1)}
//                   sx={{
//                     position: 'absolute',
//                     top: '50%',
//                     right: 10,
//                     transform: 'translateY(-50%)',
//                     color: '#fff',
//                     backgroundColor: 'rgba(0,0,0,0.5)',
//                     '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
//                     zIndex: 10,
//                   }}
//                 >
//                   <ChevronRightIcon />
//                 </IconButton>
//               )}

//               <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
//                 <img
//                   src={`data:image/png;base64,${results[previewIndex].base64Image}`}
//                   alt={results[previewIndex].fileName}
//                   style={{ maxWidth: '90%', maxHeight: '90%' }}
//                 />
//               </Box>
//             </DialogContent>
//           </Dialog>
//         )}
//       </Grid>

//       {/* Snackbar Toast */}
//       <Snackbar open={toastOpen} autoHideDuration={4000} onClose={handleToastClose}>
//         <Alert severity="error" sx={{ width: '100%' }} onClose={handleToastClose}>
//           {toastMessage}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default PdfGridViewer;
