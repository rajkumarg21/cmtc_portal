import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack
} from "@mui/material";

import CenterDetailsDialog from "./CenterDetailsDialog";
import { useTranslation } from "react-i18next";
import { getCenterDetails } from "../../../services/cmtcCenterService";
// import { getCenterById } from "services/api"; // optional

const CenterTable = ({ centers = [], onOpenForm, readOnly: parentReadOnly = false, getPermissions}) => {

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const { t, i18n } = useTranslation();


  // 🔹 Handle View Details
  const handleView = async (center) => {

    // ✅ OPTION 1: If full data already present
    setSelectedCenter(center);
    setOpenDialog(true);

    // ✅ OPTION 2: If need API call (recommended)

    try {
      const res = await getCenterDetails(center.centerId || center.id);
      setSelectedCenter(res.data);
      setOpenDialog(true);
    } catch (e) {
      console.error(e);
    }

  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Center Name</TableCell>
            <TableCell>Block</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {centers.map((center) => {
            const { readOnly, isSubmitted } = getPermissions(center,parentReadOnly);
            const isReadOnly = parentReadOnly || readOnly;
            return (
              <TableRow key={center.centerId}>
                <TableCell>{center.centerName}</TableCell>

                <TableCell>
                  {center.blockNameEn || center.blockNameHi}
                </TableCell>

                <TableCell>{center.assessmentStatus}</TableCell>

                <TableCell>
                  <Stack direction="row" spacing={1}>

                    {/* Fill */}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        onOpenForm?.(center, {
                          readOnly: isReadOnly,
                          isSubmitted : isSubmitted
                        })
                      }
                    >
                      {isReadOnly ? "View Form" : "Fill Form"}
                    </Button>

                    {/* View Details */}
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleView(center)}
                    >
                      View Details
                    </Button>

                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* ✅ Dialog directly here */}
      <CenterDetailsDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        center={selectedCenter}
        t={t}
        i18n={i18n}
      />
    </>
  );
};

export default CenterTable;