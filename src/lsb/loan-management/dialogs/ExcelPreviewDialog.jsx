import React, { useMemo, useState } from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  TextField,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";

const ExcelPreviewDialog = ({
  open,
  onClose,
  rows,
  columns,
  totals,
  loading,
}) => {
  const [searchText, setSearchText] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  /**
   * 🔍 Filter rows based on search
   */
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;

    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [rows, searchText]);

  const gridColumns = useMemo(() => {
    return (columns || []).map((col) => ({
      field: col,
      headerName: col,
      flex: 1,
      minWidth: 150,
    }));
  }, [columns]);

  console.log("columns : ", columns)
  console.log("rows : ", rows);


  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      {/* HEADER */}
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant="h6">
            Excel Preview
          </Typography>

          <Typography sx={{ mr: 3 }}>
            Records: {filteredRows?.length}
          </Typography>

          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* SEARCH + SUMMARY */}
      <Box p={2} display="flex" justifyContent="space-between" gap={2}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 300 }}
        />

        <Box display="flex" gap={3} alignItems="center">
          <Typography variant="body2">
            Total SHG: <b>{totals?.totalShg || 0}</b>
          </Typography>

          <Typography variant="body2">
            Total Amount: <b>₹ {totals?.totalAmount || 0}</b>
          </Typography>
        </Box>
      </Box>

      {/* TABLE */}
      <Box sx={{ height: "calc(100vh - 120px)", width: "100%", px: 2 }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredRows}
            columns={gridColumns}
            getRowId={(row) => row.id}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[50, 100, 200, 500]}
            disableRowSelectionOnClick
          />
        )}
      </Box>
    </Dialog>
  );
};

export default ExcelPreviewDialog;