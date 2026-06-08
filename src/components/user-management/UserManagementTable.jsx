import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";

import {
  AdminPanelSettings as AdminIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material";

const UserTable = ({
  pagedRows,
  page,
  rowsPerPage,
  totalCount,
  order,
  orderBy,
  handleRequestSort,
  setPage,
  setRowsPerPage,
  getUserDistrictName,
  getUserBlockName,
  getRoleIcon,
  ROLE_LABELS,
  USER_ROLES,
  canModifyUser,
  handleToggleEnabled,
  handleDeleteClick,
  navigate,
  loggedInRole,
  t,
}) => {
  return (
    <>
      <TableContainer
        sx={{
          borderRadius: 1,
          border: "1px solid grey",
        }}
      >
        
        <Table sx={{ minWidth: 900 }} aria-label="user table">
          <TableHead>
            
            <TableRow
              sx={{
                "& th": {
                  borderBottom: "1px solid grey",
                  background: "#155a55",
                  color: "white",
                  fontWeight: 600,
                },
              }}
            >
              
              <TableCell sx={{ fontSize: "14px", fontWeight: 600 }}>
                S.No
              </TableCell>
              <TableCell
                sortDirection={orderBy === "username" ? order : false}
                sx={{ fontSize: "14px", fontWeight: 600 }}
              >
                
                <TableSortLabel
                  active={orderBy === "username"}
                  direction={orderBy === "username" ? order : "asc"}
                  onClick={() => handleRequestSort("username")}
                  sx={{
                    color: "white !important",
                    "& .MuiTableSortLabel-icon": {
                      color: "white !important",
                    },
                    "&.Mui-active": {
                      color: "white !important",
                    },
                    "&.Mui-active .MuiTableSortLabel-icon": {
                      color: "white !important",
                    },
                  }}
                >
                  
                  {t("admin.umUsername")}
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === "fullName" ? order : false}
                sx={{ fontSize: "14px", fontWeight: 600 }}
              >
                
                <TableSortLabel
                  active={orderBy === "fullName"}
                  direction={orderBy === "fullName" ? order : "asc"}
                  onClick={() => handleRequestSort("fullName")}
                >
                  
                  {t("admin.umFullName")}
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === "role" ? order : false}
                sx={{ fontSize: "14px", fontWeight: 600 }}
              >
                
                <TableSortLabel
                  active={orderBy === "role"}
                  direction={orderBy === "role" ? order : "asc"}
                  onClick={() => handleRequestSort("role")}
                >
                  
                  {t("admin.umRole")}
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === "district" ? order : false}
                sx={{ fontSize: "14px", fontWeight: 600 }}
              >
                
                <TableSortLabel
                  active={orderBy === "district"}
                  direction={orderBy === "district" ? order : "asc"}
                  onClick={() => handleRequestSort("district")}
                >
                  
                  {t("admin.Bdistrict")}
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === "block" ? order : false}
                sx={{ fontSize: "14px", fontWeight: 600 }}
              >
                
                <TableSortLabel
                  active={orderBy === "block"}
                  direction={orderBy === "block" ? order : "asc"}
                  onClick={() => handleRequestSort("block")}
                >
                  
                  {t("admin.Bblock")}
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={orderBy === "status" ? order : false}
                sx={{ fontSize: "14px", fontWeight: 600 }}
              >
                
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleRequestSort("status")}
                >
                  
                  {t("admin.deptStatus")}
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: "14px", fontWeight: 600 }}
              >
                
                {t("admin.deptActions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            
            {pagedRows.map((u, index) => {
              const canModify = canModifyUser(u);
              return (
                <TableRow
                  key={u.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    opacity: u.enabled ? 1 : 0.7,
                  }}
                >
                  
                  <TableCell sx={{ fontSize: "14px" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    
                    <Box display="flex" alignItems="center">
                      
                      {u.username}
                      {u.role === USER_ROLES.PORTAL_ADMIN && (
                        <AdminIcon
                          fontSize="small"
                          sx={{ ml: 1, color: "primary.main" }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>{u.fullName}</TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    
                    <Chip
                      icon={getRoleIcon(u.role)}
                      label={
                        ROLE_LABELS[u.role] || u.role.replace("_", " ")
                      }
                      size="small"
                      color={
                        u.role === USER_ROLES.PORTAL_ADMIN
                          ? "primary"
                          : "default"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    
                    <Typography variant="body2">
                      {getUserDistrictName(u)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    
                    <Typography variant="body2">
                      {getUserBlockName(u)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px" }}>
                    
                    <Chip
                      icon={u.enabled ? <LockOpenIcon /> : <LockIcon />}
                      label={u.enabled ? "Enabled" : "Disabled"}
                      color={u.enabled ? "success" : "error"}
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: "14px" }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: "14px" }}>
                    
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        disabled={
                          !canModify ||
                          (loggedInRole === USER_ROLES.PORTAL_ADMIN &&
                            u.role === USER_ROLES.GOV_DEPARTMENT)
                        }
                        sx={{ fontSize: "14px" }}
                      >
                        
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={u.enabled ? <LockIcon /> : <LockOpenIcon />}
                        color={u.enabled ? "error" : "success"}
                        onClick={() => handleToggleEnabled(u)}
                        disabled={!canModify}
                        sx={{ fontSize: "14px" }}
                      >
                        
                        {u.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(u)}
                        sx={{ fontSize: "14px" }}
                        disabled={
                          !canModify || u.role === USER_ROLES.PORTAL_ADMIN
                        }
                      >
                        
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          const value = e.target.value;

          if (value === "all") {
            setRowsPerPage(totalCount);
            setPage(0);
          } else {
            const v = parseInt(value, 10);
            setRowsPerPage(Number.isNaN(v) ? 10 : v);
            setPage(0);
          }
        }}
        rowsPerPageOptions={[5, 10, 25, 50, { label: "All", value: "all" }]}
      />
    </>
  );
};

export default UserTable;
