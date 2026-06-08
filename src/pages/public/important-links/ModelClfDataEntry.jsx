import React from "react";
import { Box, Typography, Container, Card, CardContent, Divider } from "@mui/material";

export default function ModelClfDataEntryPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      
      {/* ======= Header Section ======= */}
      <Box
        sx={{
          background: "linear-gradient(45deg, #00695c, #00897b)",
          p: 3,
          borderRadius: 2,
          color: "#fff",
          textAlign: "center",
          boxShadow: 3
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          MODEL CLF DATA ENTRY
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
          Complete Guidelines, Steps & Instructions for Data Entry
        </Typography>
      </Box>

      {/* ======= Introduction ======= */}
      <Card sx={{ mt: 4, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} color="primary">
            🔰 Overview
          </Typography>
          <Typography sx={{ mt: 1, lineHeight: 1.7 }}>
            MODEL CLF Data Entry ensures accurate and timely submission of 
            Community Level Federation details for reporting, evaluation, 
            monitoring and governance purposes. All operators are required 
            to follow the steps carefully and upload correct records.
          </Typography>
        </CardContent>
      </Card>

      {/* ======= Key Points ======= */}
      <Card sx={{ mt: 4, boxShadow: 2, backgroundColor: "#f7f7f7" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ color: "#d84315" }}>
            ⭐ Key Highlights
          </Typography>

          <ul style={{ marginTop: 10, lineHeight: 1.8 }}>
            <li>All CLF related data must be fully verified before submission.</li>
            <li>SHG, VO, Federation structured details must be correct.</li>
            <li>Financial, Livelihood & Training details must match official records.</li>
            <li>Report generation will be based on data submitted in this module.</li>
            <li>Once submitted, changes are restricted unless approved.</li>
          </ul>
        </CardContent>
      </Card>

      {/* ======= Steps ======= */}
      <Card sx={{ mt: 4, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} color="primary">
            📘 Step-by-Step Process
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography fontWeight={600}>1️⃣ Login to Portal</Typography>
            <Typography sx={{ ml: 3, mb: 2 }}>
              Enter valid credentials provided by the district/block authorities.
            </Typography>

            <Typography fontWeight={600}>2️⃣ Choose “MODEL CLF DATA ENTRY”</Typography>
            <Typography sx={{ ml: 3, mb: 2 }}>
              Navigate to the CLF module from the main menu.
            </Typography>

            <Typography fontWeight={600}>3️⃣ Fill SHG & VO Information</Typography>
            <Typography sx={{ ml: 3, mb: 2 }}>
              Enter member count, savings status, bank linkage, and activities.
            </Typography>

            <Typography fontWeight={600}>4️⃣ Upload Documents (If Required)</Typography>
            <Typography sx={{ ml: 3, mb: 2 }}>
              Upload meeting photos, resolution copies, or reports if applicable.
            </Typography>

            <Typography fontWeight={600}>5️⃣ Review & Submit</Typography>
            <Typography sx={{ ml: 3 }}>
              Ensure accuracy before final submission.  
              Incorrect data may delay approval.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* ======= Contact Help ======= */}
      <Card sx={{ mt: 4, boxShadow: 2, borderLeft: "5px solid #00695c" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} color="secondary">
            📞 Need Help?
          </Typography>
          <Typography sx={{ mt: 1 }}>
            If you face issues during data entry, please contact:
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography>
              📧 <strong>Email:</strong> support@mpsrlm.gov.in
            </Typography>
            <Typography>
              ☎ <strong>Helpline:</strong> +91-98765-43210
            </Typography>
          </Box>
        </CardContent>
      </Card>

    </Container>
  );
}
