// import React, { useState, useEffect, useCallback } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
// import {
//   Dialog,
//   DialogContent,
//   Button,
//   Grid,
//   IconButton,
//   CircularProgress,
//   Typography,
//   Box
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// import 'react-pdf/dist/Page/AnnotationLayer.css';
// import 'react-pdf/dist/Page/TextLayer.css';
// import usePublishedPdfs from '../../hooks/usePublishedPdfs';

// pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// /* ------------------- Small Download Button ------------------- */
// // const SmallDownloadButton = ({ file }) =>
// //   file ? (
// //     <div className="flex justify-end mb-2">
// //       <a href={file} download target="_blank" rel="noopener noreferrer">
// //         <IconButton
// //           size="small"
// //           sx={{
// //             backgroundColor: '#1976d2',
// //             color: '#fff',
// //             '&:hover': { backgroundColor: '#115293' },
// //           }}
// //         >
// //           <DownloadIcon fontSize="small" />
// //         </IconButton>
// //       </a>
// //     </div>
// //   ) : null;

// const SmallDownloadButton = ({ file }) =>
//   file ? (
//     <div className="flex justify-end mb-2">
//       <Button
//         variant="contained"
//         color="primary"
//         size="small"
//         component="a"
//         href={file}
//         download
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         Download
//       </Button>
//     </div>
//   ) : null;


// /* ------------------- Week Selector Buttons ------------------- */
// const WeekSelector = ({ weeks, onSelect }) => (
//   <div className="mt-4 flex gap-2 flex-wrap">
//     {weeks.map((week) => (
//       <Button key={week.id} onClick={() => onSelect(week)} variant="contained">
//         {week.label}
//       </Button>
//     ))}
//   </div>
// );

// /* ------------------- Preview Grid ------------------- */
// const PagePreviewGrid = ({ file, numPages, setNumPages, onPageClick }) => {
//   return (
//     <>
//       {file && (
//         <Document
//           key={file}
//           file={file}
//           onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//           loading={
//             <div className="flex justify-center mt-10">
//               <CircularProgress />
//             </div>
//           }
//         >
//           {numPages > 0 && (
//             <Grid container spacing={1} className="mb-4">
//               {Array.from({ length: numPages }, (_, i) => (
//                 <Grid item key={i} xs={4} sm={2} md={1.5}>
//                   <div
//                     className="cursor-pointer border rounded overflow-hidden hover:shadow-md"
//                     onClick={() => onPageClick(i + 1)}
//                   >
//                     <Page
//                       pageNumber={i + 1}
//                       width={100}
//                       renderTextLayer={false}
//                       renderAnnotationLayer={false}
//                     />
//                   </div>
//                 </Grid>
//               ))}
//             </Grid>
//           )}
//         </Document>
//       )}
//     </>
//   );
// };

// /* ------------------- Fullscreen Dialog ------------------- */
// const FullscreenPdfViewer = ({
//   open,
//   file,
//   page,
//   numPages,
//   onClose,
//   onNext,
//   onPrevious,
// }) => {
//   const handleKeyDown = useCallback(
//     (e) => {
//       if (!open) return;
//       if (e.key === 'ArrowLeft' && page > 1) onPrevious();
//       if (e.key === 'ArrowRight' && page < numPages) onNext();
//       if (e.key === 'Escape') onClose();
//     },
//     [open, page, numPages, onNext, onPrevious, onClose]
//   );

//   useEffect(() => {
//     if (open) window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [open, handleKeyDown]);

//   return (
//     <Dialog fullScreen open={open} onClose={onClose}>
//       <DialogContent sx={{ p: 0, position: 'relative', backgroundColor: '#000' }}>
//         <IconButton
//           onClick={onClose}
//           sx={{
//             position: 'absolute',
//             top: 16,
//             right: 16,
//             zIndex: 10,
//             backgroundColor: 'rgba(255,255,255,0.6)',
//             '&:hover': { backgroundColor: 'rgba(255,255,255,0.8)' },
//           }}
//         >
//           <CloseIcon />
//         </IconButton>

//         <IconButton
//           onClick={onPrevious}
//           disabled={page === 1}
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             left: 10,
//             transform: 'translateY(-50%)',
//             color: '#fff',
//             backgroundColor: 'rgba(0,0,0,0.5)',
//             '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
//             zIndex: 10,
//           }}
//         >
//           <ChevronLeftIcon />
//         </IconButton>

//         <IconButton
//           onClick={onNext}
//           disabled={page === numPages}
//           sx={{
//             position: 'absolute',
//             top: '50%',
//             right: 10,
//             transform: 'translateY(-50%)',
//             color: '#fff',
//             backgroundColor: 'rgba(0,0,0,0.5)',
//             '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
//             zIndex: 10,
//           }}
//         >
//           <ChevronRightIcon />
//         </IconButton>

//         {file && page && (
//           <div className="flex justify-center items-center min-h-screen bg-black">
//             <Document file={file}>
//               <Page
//                 pageNumber={page}
//                 scale={2.5}
//                 renderTextLayer={false}
//                 renderAnnotationLayer={false}
//               />
//             </Document>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// /* ------------------- Main Component ------------------- */
// const AbhilekhPage = () => {
//   const { pdfList, loading } = usePublishedPdfs();
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [numPages, setNumPages] = useState(0);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedPage, setSelectedPage] = useState(null);
//   const [publicationYear, setPublicationYear] = useState(null);
//   const [editionNumber, seteditionNumber] = useState(null);

//   useEffect(() => {
//     if (pdfList && pdfList.length > 0) {
//       // Assuming pdfList[0] is the latest PDF (if sorted latest first)
//       handleSelectWeek(pdfList[0]);
//     }
//   }, [pdfList]);


//   const handlePageClick = (page) => {
//     setSelectedPage(page);
//     setOpenDialog(true);
//   };

//   const handleClose = () => {
//     setOpenDialog(false);
//     setSelectedPage(null);
//   };

//   const handlePrevious = () => {
//     if (selectedPage > 1) setSelectedPage((prev) => prev - 1);
//   };

//   const handleNext = () => {
//     if (selectedPage < numPages) setSelectedPage((prev) => prev + 1);
//   };

//   const handleSelectWeek = (week) => {
//     setPublicationYear(week.publicationYear);
//     seteditionNumber(week.editionNumber);
//     setSelectedFile(week.file);
//   }

//   return (
//     <div className="relative p-4 pb-16">
//       {loading ? (
//         <div className="flex justify-center mt-10">
//           <CircularProgress />
//         </div>
//       ) : (
//         <>

//           {(editionNumber || publicationYear || selectedFile) && (
//             <Box
//               sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 mb: 3,
//                 p: 1.5,
//                 borderBottom: '1px solid #ccc',
//                 // Optional: Light background for separation
//                 // bgcolor: 'background.paper',
//               }}
//             >
//               {/* Left Side: Edition Info */}
//               <Box>
//                 <Typography variant="body1" component="span" fontWeight="bold" sx={{ mr: 3 }}>
//                   Edition No: {editionNumber ? editionNumber : 'N/A'}
//                 </Typography>
//                 <Typography variant="body1" component="span" fontWeight="bold">
//                   Year: {publicationYear ? publicationYear : 'N/A'}
//                 </Typography>
//               </Box>

//               {/* Right Side: Download Button */}
//               {selectedFile && (
//                 <SmallDownloadButton file={selectedFile} />
//               )}
//             </Box>
//           )}
//           <PagePreviewGrid
//             file={selectedFile}
//             numPages={numPages}
//             setNumPages={setNumPages}
//             onPageClick={handlePageClick}
//           />
//           <WeekSelector weeks={pdfList} onSelect={handleSelectWeek} />
//           <FullscreenPdfViewer
//             open={openDialog}
//             file={selectedFile}
//             page={selectedPage}
//             numPages={numPages}
//             onClose={handleClose}
//             onPrevious={handlePrevious}
//             onNext={handleNext}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default AbhilekhPage;
