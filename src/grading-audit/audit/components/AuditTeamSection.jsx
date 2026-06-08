import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import { USER_ROLES } from "../../../utils/constants";

const AuditTeamSection = ({
  teamMembers = [],
  assignedLead,
  onAssign,
  loading = false,
  userRole,
  readOnly = false, // ✅ NEW
  onGenerateTeam,
}) => {

  const isTeamEmpty = !teamMembers || teamMembers.length === 0;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Audit Team
      </Typography>

      {/* 🚫 No Team Case */}
      {isTeamEmpty && (
        <Box textAlign="center" py={3}>
          <Typography color="text.secondary" mb={2}>
            No audit team found for this assessment.
          </Typography>

          {!readOnly && userRole === USER_ROLES.DISTRICT_OFFICER && (
            <Button
              variant="contained"
              onClick={onGenerateTeam}
              disabled={loading}
            >
              Generate Team
            </Button>
          )}
        </Box>
      )}

      {!isTeamEmpty && (<>
        {/* 🔔 Info */}
        {
          !assignedLead && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Only <b>Mission Staff</b> can be assigned as Audit Lead.
            </Alert>
          )
        }

        {/* 🔒 Read Only Info */}
        {
          readOnly && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You have read-only access. You cannot modify the audit team.
            </Alert>
          )
        }

        {/* ✅ Current Lead */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Assigned Lead :
          </Typography>

          {assignedLead ? (
            <Chip
              label={`${assignedLead.fullName} (MISSION_STAFF)`}
              color="success"
              variant="outlined"
            />
          ) : (
            <Typography color="text.secondary">
              No lead assigned
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* ✅ Team Members */}
        <Grid container spacing={2}>
          {teamMembers.map((member) => {
            const isMissionStaff = member.role === "MISSION_STAFF";
            const isLead = assignedLead?.id === member.id;

            return (
              <Grid item xs={12} key={member.id}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={1.5}
                  border="1px solid #eee"
                  borderRadius={2}
                >
                  {/* 👤 Info */}
                  <Box>
                    <Typography fontWeight="medium">
                      {member.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.mobileNo}
                    </Typography>

                    {/* ✅ Lead badge */}
                    {isLead && (
                      <Chip label="Lead" color="success" size="small" sx={{ mt: 1 }} />
                    )}
                  </Box>

                  {/* 🎯 Action */}
                  {!readOnly && !assignedLead && isMissionStaff && userRole === USER_ROLES.DISTRICT_OFFICER && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onAssign(member.id)}
                      disabled={loading}
                    >
                      Assign Lead
                    </Button>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </>)}
    </Paper >
  );
};

export default AuditTeamSection;