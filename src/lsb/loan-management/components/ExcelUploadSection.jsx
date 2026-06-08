// import { Box, Button, Typography, LinearProgress } from "@mui/material";
// import UploadFileIcon from "@mui/icons-material/UploadFile";

// const ExcelUpload = ({
//   onFileChange,
//   loading,
//   error,
//   file,
// }) => {
//   return (
//     <Box>
//       <Button
//         component="label"
//         variant="outlined"
//         startIcon={<UploadFileIcon />}
//         disabled={loading}
//       >
//         Upload Excel
//         <input
//           type="file"
//           hidden
//           accept=".xlsx,.xls,.csv"
//           onChange={onFileChange}
//         />
//       </Button>

//       {loading && <LinearProgress sx={{ mt: 1 }} />}

//       {file && (
//         <Typography variant="body2" color="success.main" mt={1}>
//           {file.name}
//         </Typography>
//       )}

//       {error && (
//         <Typography color="error" variant="body2">
//           {error}
//         </Typography>
//       )}
//     </Box>
//   );
// };

// export default ExcelUpload;