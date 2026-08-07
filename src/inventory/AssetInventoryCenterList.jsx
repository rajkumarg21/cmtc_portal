
import React, { useEffect, useMemo, useState } from "react";
import {
  Container, Typography, Box, TextField, Grid, CircularProgress,
  Paper, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, TablePagination, IconButton, Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import { useNavigate } from "react-router-dom";
import { getAllDistricts } from "../services/publicService";
import { getAllCenters } from "../services/cmtcCenterService";

const SORT_OPTIONS = [
  { value: "NAME_ASC", label: "Center Name (A-Z)" },
  { value: "NAME_DESC", label: "Center Name (Z-A)" },
];

const AssetInventoryCenterList = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NAME_ASC");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [centerRes, districtRes] = await Promise.all([
        getAllCenters(),
        getAllDistricts(),
      ]);

      setCenters(centerRes?.data || centerRes || []);
      setDistricts(districtRes?.data || districtRes || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = useMemo(() => {
    let data = [...centers];

    if (search) {
      const keyword = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name?.toLowerCase().includes(keyword) ||
          c.code?.toLowerCase().includes(keyword)
      );
    }

    if (districtFilter !== "ALL") {
      data = data.filter(
        (c) => String(c.districtId) === String(districtFilter)
      );
    }

    if (sortBy === "NAME_ASC") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      data.sort((a, b) => b.name.localeCompare(a.name));
    }

    return data;
  }, [centers, search, districtFilter, sortBy]);

  const pagedCenters = filteredCenters.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          CMTC Center List
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search Center Name / Code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>District</InputLabel>
              <Select
                value={districtFilter}
                label="District"
                onChange={(e) => setDistrictFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterAltOutlinedIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="ALL">All Districts</MenuItem>
                {districts.map((d) => (
                  <MenuItem key={d.districtId} value={d.districtId}>
                    {d.districtNameEn || d.districtName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort</InputLabel>
              <Select
                value={sortBy}
                label="Sort"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SortOutlinedIcon />
                  </InputAdornment>
                }
              >
                {SORT_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{
                        "& th": {
                          borderBottom:"1px solid grey",
                          background:"#155a55",
                          color:"white"
                        },
                      }}>
                <TableCell>S.No</TableCell>
                <TableCell>Center Name</TableCell>
                <TableCell>Center Code</TableCell>
                <TableCell>District</TableCell>
                <TableCell>Block</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">View</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pagedCenters.map((center, index) => (
                <TableRow key={center.centerId}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{center.name}</TableCell>
                  <TableCell>{center.code}</TableCell>
                  <TableCell>{center.districtNameEn}</TableCell>
                  <TableCell>{center.blockNameEn || center.blockName}</TableCell>
                  <TableCell>{center.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Inventory">
                      <IconButton
                        onClick={() =>
                          navigate(`/admin/inventory-report/${center.centerId}`)
                        }
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredCenters.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Container>
  );
};

export default AssetInventoryCenterList;




