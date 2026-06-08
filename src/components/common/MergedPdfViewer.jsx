// import React, { useState, useEffect, useCallback } from "react";
// import {
//     Box,
//     Typography,
//     IconButton,
//     CircularProgress,
//     Button,
//     Snackbar,
//     Alert,
//     Grid,
//     Dialog,
//     DialogContent,
// } from "@mui/material";
// import DownloadIcon from "@mui/icons-material/Download";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import CloseIcon from "@mui/icons-material/Close";
// import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import { Document, Page, pdfjs } from "react-pdf";
// import NotAvailable from "../ui/NotAvailable";
// import Tooltip from "@mui/material/Tooltip";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// const MergedPdfViewer = ({ pageNo, year, fetchPdf, title, column, showNotAvailable }) => {
//     const [pdfBlob, setPdfBlob] = useState(null);
//     const [pageInfo, setPageInfo] = useState([]);
//     const [pdfLoading, setPdfLoading] = useState(true);
//     const [toastOpen, setToastOpen] = useState(false);
//     const [toastMessage, setToastMessage] = useState("");
//     const [previewIndex, setPreviewIndex] = useState(null);
//     const [openDialog, setOpenDialog] = useState(false);

//     const handleToastClose = () => setToastOpen(false);
//     const showToast = (msg) => {
//         setToastMessage(msg);
//         setToastOpen(true);
//     };

//     useEffect(() => {
//         if (!fetchPdf) return;

//         const loadPdf = async () => {
//             setPdfLoading(true);
//             try {
//                 const res = await fetchPdf(column, year);
//                 const { pdfBlob, jsonData } = res.data;

//                 if (!pdfBlob) throw new Error("No PDF received");

//                 setPdfBlob(pdfBlob);
//                 setPageInfo(jsonData);
//             } catch (err) {
//                 const message = err instanceof Error ? err.message : String(err);
//                 setPdfBlob(null);
//                 showToast(message);
//             } finally {
//                 setPdfLoading(false);
//             }
//         };

//         loadPdf();
//     }, [fetchPdf, pageNo, year]);

//     const handlePreviewClick = (index) => {
//         setPreviewIndex(index);
//         setOpenDialog(true);
//     };
//     const getFileName = (title, year) => {
//         // Replace all spaces in the title with hyphens and append the year and file extension.
//         return `${title.replace(/ /g, '-')}_${year}.pdf`;
//     };

//     const handleDownloadMerged = () => {
//         if (!pdfBlob) return;
//         const url = URL.createObjectURL(pdfBlob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = getFileName(title, year);
//         a.click();
//     };

//     const handleViewMerged = () => {
//         if (!pdfBlob) return;
//         const url = URL.createObjectURL(pdfBlob);
//         // The opened tab's URL will have the filename as a suggestion.
//         window.open(url, "_blank");
//     };
//     const handleKeyDown = useCallback(
//         (e) => {
//             if (!openDialog) return;
//             if (e.key === "ArrowLeft" && previewIndex > 1) setPreviewIndex(previewIndex - 1);
//             if (e.key === "ArrowRight" && previewIndex < pageInfo.length) setPreviewIndex(previewIndex + 1);
//             if (e.key === "Escape") {
//                 setOpenDialog(false);
//                 setPreviewIndex(null);
//             }
//         },
//         [openDialog, previewIndex, pageInfo.length]
//     );

//     useEffect(() => {
//         if (openDialog) window.addEventListener("keydown", handleKeyDown);
//         return () => window.removeEventListener("keydown", handleKeyDown);
//     }, [openDialog, handleKeyDown]);

//     if (!pdfLoading && showNotAvailable && !pdfBlob) {
//         return (<NotAvailable />);
//     }

//     return (
//         <Box>
//             {/* Action buttons */}
//             <Box display="flex" gap={2} mb={2}>
//                 <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadMerged} disabled={pdfLoading}>
//                     Download All
//                 </Button>
//                 <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={handleViewMerged} disabled={pdfLoading}>
//                     View All
//                 </Button>
//             </Box>

//             {/* PDF Grid */}
//             <Grid container spacing={2}>
//                 {pdfLoading ? (
//                     <Box display="flex" justifyContent="center" alignItems="center" height="100vh" width="100%">
//                         <CircularProgress />
//                     </Box>
//                 ) : (
//                     pageInfo.map((pdf, index) => (
//                         <Grid item key={index} xs={6} sm={4} md={3} lg={2}>
//                             <Tooltip
//                                 title={
//                                     pdf.dateFrom && pdf.dateTo ? `${pdf.dateFrom} - ${pdf.dateTo}` : ""
//                                 }
//                                 placement="top"
//                                 arrow
//                             >

//                                 <Box position="relative" border={1} borderRadius={2} p={1} textAlign="center">
//                                     <Box onClick={() => handlePreviewClick(index + 1)} sx={{ cursor: "pointer" }}>
//                                         <Document file={pdfBlob} loading={<CircularProgress size={24} />}>
//                                             <Page
//                                                 pageNumber={index + 1}
//                                                 width={100}
//                                                 renderTextLayer={true}
//                                                 renderAnnotationLayer={false}
//                                             />
//                                         </Document>
//                                     </Box>

//                                     <Typography variant="caption" mt={1} display="block">
//                                         {pdf.label}
//                                     </Typography>

//                                 </Box>
//                                 </Tooltip>
//                         </Grid>
//                     ))
//                 )}
//             </Grid>

//             {/* Preview Dialog */}
//             {previewIndex !== null && pageInfo[previewIndex - 1] && (
//                 <Dialog fullScreen open={openDialog} onClose={() => setOpenDialog(false)}>
//                     <DialogContent sx={{ p: 0, position: "relative", backgroundColor: "#000" }}>
//                         <IconButton
//                             onClick={() => {
//                                 setOpenDialog(false);
//                                 setPreviewIndex(null);
//                             }}
//                             sx={{
//                                 position: "absolute",
//                                 top: 16,
//                                 right: 16,
//                                 zIndex: 10,
//                                 backgroundColor: "rgba(255,255,255,0.6)",
//                                 "&:hover": { backgroundColor: "rgba(255,255,255,0.8)" },
//                             }}
//                         >
//                             <CloseIcon />
//                         </IconButton>

//                         {previewIndex > 1 && (
//                             <IconButton
//                                 onClick={() => setPreviewIndex(previewIndex - 1)}
//                                 sx={{
//                                     position: "absolute",
//                                     top: "50%",
//                                     left: 10,
//                                     transform: "translateY(-50%)",
//                                     color: "#fff",
//                                     backgroundColor: "rgba(0,0,0,0.5)",
//                                     "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
//                                     zIndex: 10,
//                                 }}
//                             >
//                                 <ChevronLeftIcon />
//                             </IconButton>
//                         )}

//                         {previewIndex < pageInfo.length && (
//                             <IconButton
//                                 onClick={() => setPreviewIndex(previewIndex + 1)}
//                                 sx={{
//                                     position: "absolute",
//                                     top: "50%",
//                                     right: 10,
//                                     transform: "translateY(-50%)",
//                                     color: "#fff",
//                                     backgroundColor: "rgba(0,0,0,0.5)",
//                                     "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
//                                     zIndex: 10,
//                                 }}
//                             >
//                                 <ChevronRightIcon />
//                             </IconButton>
//                         )}

//                         <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#000">
//                             <Document file={pdfBlob}>
//                                 <Page pageNumber={previewIndex} scale={2.5} />
//                             </Document>
//                         </Box>
//                     </DialogContent>
//                 </Dialog>
//             )}

//             <Snackbar open={toastOpen} autoHideDuration={3000} onClose={handleToastClose}>
//                 <Alert severity="error" onClose={handleToastClose}>
//                     {toastMessage}
//                 </Alert>
//             </Snackbar>
//         </Box>
//     );
// };

// export default MergedPdfViewer;