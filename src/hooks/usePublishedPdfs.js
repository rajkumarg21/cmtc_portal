// import { useState, useEffect } from 'react';
// import { getAllPublishedRojgarAndNirman } from '../services/rojgarNirmanService';

// const usePublishedPdfs = () => {
//   const [pdfList, setPdfList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setError(null);
//         setLoading(true);

//         const response = await getAllPublishedRojgarAndNirman();

//         if (response?.status === 200) {
//           let data = [];
//           if (Array.isArray(response.data)) {
//             data = response.data;
//           } else if (response.data?.data && Array.isArray(response.data.data)) {
//             data = response.data.data;
//           } else {
//             throw new Error('Unexpected API response format');
//           }

//           const sorted = data
//             .map((item) => ({
//               ...item,
//               file: item.pdfUrl
//                 ? `${VITE_BASE_URL}${item.pdfUrl}`
//                 : null,
//               label: item.title || `Edition ${item.editionNo}`,
//               publicationYear: parseInt(item.publicationYear, 10),
//               editionNo: parseInt(item.editionNo, 10),
//             }))
//             .sort((a, b) => {
//               if (a.publicationYear !== b.publicationYear) {
//                 return b.publicationYear - a.publicationYear;
//               }
//               return b.editionNo - a.editionNo;
//             });

//           setPdfList(sorted);
//         } else {
//           setError(
//             response?.data?.message ||
//             `Failed to load PDFs (Status: ${response?.status || 'Unknown'})`
//           );
//           setPdfList([]);
//         }
//       } catch (err) {
//         console.error('Failed to load PDFs:', err);
//         setError(err.message || 'Failed to load PDFs');
//         setPdfList([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [VITE_BASE_URL]);

//   return { pdfList, loading, error };
// };

// export default usePublishedPdfs;
