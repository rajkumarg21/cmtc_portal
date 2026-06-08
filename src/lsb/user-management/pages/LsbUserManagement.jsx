import React from "react";
import { Box, Tabs, Tab } from "@mui/material";

import useLsbUsers from "../hooks/useLsbUsers";
import UsersTable from "../components/UsersTable";
import LsbPageHeader from "../../components/LsbPageHeader";

const LsbUserManagement = () => {
  const {
    users,
    loading,
    statusFilter,
    setStatusFilter,
    approveUser,
    rejectUser,
    STATUS,
  } = useLsbUsers();

  const handleTabChange = (e, value) => {
    setStatusFilter(value);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <LsbPageHeader
        title="LSB User Management"
        subtitle="Manage user registrations and approvals"
      />

      {/* FILTER TABS */}
      <Tabs
        value={statusFilter}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="All" value={STATUS.ALL} />
        <Tab label="Pending" value={STATUS.PENDING} />
        <Tab label="Approved" value={STATUS.APPROVED} />
        <Tab label="Rejected" value={STATUS.REJECTED} />
      </Tabs>

      {/* TABLE */}
      <UsersTable
        users={users}
        loading={loading}
        onApprove={approveUser}
        onReject={rejectUser}
      />
    </Box>
  );
};

export default LsbUserManagement;