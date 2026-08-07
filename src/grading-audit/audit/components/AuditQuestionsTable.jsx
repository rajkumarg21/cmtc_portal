import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Typography
} from "@mui/material";
import { useTranslation } from "react-i18next";

const AuditQuestionsTable = ({ questions, onChange, readOnly }) => {
  const { i18n, t } = useTranslation();

  const getText = (en, hi) => {
    if (i18n.language === "hi") {
      return hi || en || "-";
    }
    return en || hi || "-";
  };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t("auditform.serialNo") || "#"}</TableCell>
          <TableCell>{t("auditform.auditCriteria") || "Question"}</TableCell>
          <TableCell>{t("auditform.issueObserved") || "Issue"}</TableCell>
          <TableCell>{t("auditform.correctionDone") || "Marks"}</TableCell>
          <TableCell>{t("auditform.qualityRemark") || "Remark"}</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {questions.map((q, index) => (
          <TableRow key={q.questionId}>
            <TableCell>{index + 1}</TableCell>

            <TableCell>
              <Typography fontSize={13}>
                {getText(q.questionText, q.questionTextHi)}
              </Typography>
            </TableCell>

            <TableCell>
              <TextField
                size="small"
                value={q.issueObserved ?? ""}
                onChange={(e) =>
                  onChange(q.questionId, "issueObserved", e.target.value)
                }
                disabled={readOnly} // ✅ disables input if read-only
              />
            </TableCell>

            <TableCell>
              <TextField
                size="small"
                value={q.correctionDone ?? ""}
                onChange={(e) =>
                  onChange(q.questionId, "correctionDone", e.target.value)
                }
                disabled={readOnly} // ✅ disables input if read-only
              />
            </TableCell>

            <TableCell>
              <TextField
                size="small"
                value={q.qualityRemark ?? ""}
                onChange={(e) =>
                  onChange(q.questionId, "qualityRemark", e.target.value)
                }
                disabled={readOnly} // ✅ disables input if read-only
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AuditQuestionsTable;