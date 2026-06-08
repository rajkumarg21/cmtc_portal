import React from "react";
import { Box, Typography, Paper, Alert, CircularProgress } from "@mui/material";

import ProgressCard from "../../shared/components/ProgressCard";
import CenterTable from "../../shared/components/CenterTable";
import GradingFormDialog from "../components/GradingFormDialog";

import useDialogState from "../../shared/hooks/useDialogState";
import useAssessmentCenters from "../../shared/hooks/useAssessmentCenters";
import AssessmentHeaderCard from "../../shared/components/AssessmentHeaderCard";
import { useAuth } from "../../../context/AuthContext";
import useTableFormPermissions from "../../shared/hooks/useTableFormPermissions";

const InternalGrading = ({ cycleId, selectedCycle }) => {

    // ✅ API state from hook
    const { data, loading, error, refetch } = useAssessmentCenters(cycleId);

    // ✅ Dialog state from hook
    const {
        open,
        selectedItem,
        readOnly,
        openDialog,
        isSubmitted,
        closeDialog
    } = useDialogState();

    const { user, userRole } = useAuth();
    const { getGradingPermissions } = useTableFormPermissions();
    
    if (!cycleId) return null;

    return (
        <Box mt={2}>
            <AssessmentHeaderCard
            title="Internal Grading"
            selectedCycle={selectedCycle}
            districtLabel="District"
            districtName={data?.districtNameEn}
            />

            {loading && (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && data && (
                <>
                    <ProgressCard
                        title="Internal Grading Progress"
                        progressData={data}
                    />

                    <CenterTable
                        centers={data.centers || []}
                        onOpenForm={openDialog} 
                        getPermissions={getGradingPermissions}

                    />
                </>
            )}

            <GradingFormDialog
                open={open}
                onClose={closeDialog}
                cycleId={cycleId}
                center={selectedItem}
                isSubmitted={isSubmitted}
                readOnly={readOnly}
                onSuccess={refetch} // ✅ clean refetch
            />
        </Box>
    );
};

export default InternalGrading;