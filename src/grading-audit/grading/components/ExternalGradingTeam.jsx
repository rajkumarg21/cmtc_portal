import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";

import {
    getEligibleUsers,
    saveExternalTeam,
    getAssignedTeam,
} from "../services/externalGradingService";
import { useAuth } from "../../../context/AuthContext";
import { USER_ROLES } from "../../../utils/constants";

const otherRoles = [
    "BLOCK_OFFICER",
    "CMTC_MANAGEMENT_PRESIDENT",
    "CMTC_ACCOUNTANT",
    "CMTC_PROCUREMENT_PRESIDENT",
];

const ExternalGradingTeam = ({ cycleId, team = [], readOnly = false }) => {
    const { userRole } = useAuth();
    const [eligibleUsers, setEligibleUsers] = useState({});
    const [teamMembers, setTeamMembers] = useState({});
    const [loading, setLoading] = useState(true);
    const [teamLoading, setTeamLoading] = useState(false);
    const [error, setError] = useState("");
    const [teamExists, setTeamExists] = useState(false);

    const isReadOnly =
        readOnly || userRole !== "DISTRICT_OFFICER";

    // ✅ helper
    const mapTeam = (teamList) => {
        const map = {};
        teamList.forEach((m) => {
            map[m.role] = { id: m.id, fullName: m.fullName };
        });
        return map;
    };

    // ✅ Editable mode fetch
    const fetchTeamData = async () => {
        if (!cycleId) return;

        try {
            setLoading(true);
            setError("");

            const assignedTeam = await getAssignedTeam(cycleId);

            let assignedMap = {};

            if (assignedTeam?.members?.length) {
                assignedMap = mapTeam(assignedTeam.members);
                setTeamMembers(assignedMap);
                setTeamExists(true);
            } else {
                setTeamExists(false);
            }

            const users = await getEligibleUsers();
            setEligibleUsers(users);

            // prefill district officer
            if (!assignedTeam?.members?.length) {
                if (users["DISTRICT_OFFICER"]?.length) {
                    const officer = users["DISTRICT_OFFICER"][0];
                    assignedMap["DISTRICT_OFFICER"] = {
                        id: officer.id,
                        fullName: officer.fullName,
                    };
                }
                setTeamMembers(assignedMap);
            }

        } catch (err) {
            console.error(err);
            setError("Failed to load team data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 🔒 READ ONLY MODE → NO API CALL
        if (isReadOnly) {
            if (team?.length) {
                setTeamMembers(mapTeam(team));
                setTeamExists(true);
            } else {
                setTeamExists(false);
            }
            setLoading(false);
            return;
        }

        // 🔵 EDIT MODE
        fetchTeamData();

    }, [cycleId]);

    const handleSelectMember = (role, userId) => {
        const user = eligibleUsers[role]?.find((u) => u.id === userId);
        if (!user) return;

        setTeamMembers((prev) => ({
            ...prev,
            [role]: { id: user.id, fullName: user.fullName },
        }));
    };

    const handleSaveTeam = async () => {
        const memberIds = Object.values(teamMembers)
            .filter(Boolean)
            .map((m) => m.id);

        if (memberIds.length === 0) {
            setError("Please select at least one team member.");
            return;
        }

        try {
            setTeamLoading(true);
            setError("");

            const assignedTeam = await saveExternalTeam({ cycleId, memberIds });

            setTeamMembers(mapTeam(assignedTeam.members));
            setTeamExists(true);

        } catch (err) {
            console.error(err);
            setError("Failed to save team.");
        } finally {
            setTeamLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (isReadOnly && !teamExists) {
        return (
            <Typography display="flex" justifyContent="left">
                <Alert severity="info">
                    No team assigned yet for this cycle.
                </Alert>
            </Typography>

        );
    }

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
                External Grading Team
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {(isReadOnly || teamExists) ? (
                <TeamPreview teamMembers={teamMembers} />
            ) : (
                <TeamForm
                    otherRoles={otherRoles}
                    teamMembers={teamMembers}
                    eligibleUsers={eligibleUsers}
                    onSelectMember={handleSelectMember}
                    onSave={handleSaveTeam}
                    teamLoading={teamLoading}
                />
            )}
        </Paper>
    );
};

const TeamForm = ({
    otherRoles,
    teamMembers,
    eligibleUsers,
    onSelectMember,
    onSave,
    teamLoading,
}) => {
    return (
        <>
            {/* Hidden District Officer */}
            {teamMembers["DISTRICT_OFFICER"] && (
                <input
                    type="hidden"
                    value={teamMembers["DISTRICT_OFFICER"].id}
                />
            )}

            {otherRoles.map((role) => (
                <Box key={role} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" mb={1}>
                        {role.replaceAll("_", " ")}
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>
                            Select {role.replaceAll("_", " ")}
                        </InputLabel>
                        <Select
                            value={teamMembers[role]?.id || ""}
                            onChange={(e) =>
                                onSelectMember(role, e.target.value)
                            }
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>

                            {eligibleUsers[role]?.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.fullName} - {user.mobileNo}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            ))}

            <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={onSave}
                disabled={teamLoading}
            >
                {teamLoading ? "Saving..." : "Save Team"}
            </Button>
        </>
    );
};

const TeamPreview = ({ teamMembers }) => {
    return (
        <Box sx={{ pl: 2 }}>
            {Object.entries(teamMembers)
                .filter(([_, member]) => member)
                .map(([role, member]) => (
                    <Typography key={role}>
                        {role.replaceAll("_", " ")}: {member.fullName}
                    </Typography>
                ))}
        </Box>
    );
};

export default ExternalGradingTeam;