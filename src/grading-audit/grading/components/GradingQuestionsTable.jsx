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

const GradingQuestionsTable = ({ questions, onChange, readOnly }) => {
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
          <TableCell>{t("gradingform.serialNo") || "#"}</TableCell>
          <TableCell>{t("gradingform.questions") || "Question"}</TableCell>
          <TableCell>{t("gradingform.point") || "Max Marks"}</TableCell>
          <TableCell>{t("gradingform.marks") || "Marks"}</TableCell>
          <TableCell>{t("gradingform.remark") || "Remark"}</TableCell>
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

            <TableCell>{q.maxMarks ?? "-"}</TableCell>

            <TableCell>
              <TextField
                type="number"
                size="small"
                value={q.obtainedMarks ?? ""}
                onChange={(e) =>
                  onChange(q.questionId, "obtainedMarks", e.target.value)
                }
                disabled={readOnly} // ✅ disables input if read-only
                inputProps={{
                  min: 0,
                  max: q.maxMarks,
                  step: 1
                }}
                onKeyDown={(e) => {
                  // Prevent non-numeric input like e, +, -
                  if (["e", "E", "+", "-"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </TableCell>

            <TableCell>
              <TextField
                size="small"
                value={q.remark ?? ""}
                onChange={(e) =>
                  onChange(q.questionId, "remark", e.target.value)
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

export default GradingQuestionsTable;