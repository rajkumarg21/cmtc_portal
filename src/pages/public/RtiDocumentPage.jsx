import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Link } from "@mui/material";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BASE_URL; 

const RtiDocumentPage = () => {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/rti-document/public/fetch-approved-visible/all`)
      .then((res) => setDocs(res.data))
      .catch((err) => console.error("Error fetching docs:", err));
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        RTI Documents
      </Typography>

      {docs.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No approved RTI documents available.
        </Typography>
      ) : (
        docs.map((doc) => (
          <Card key={doc.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {doc.documentName}
              </Typography>
              <Link href={`${API_BASE}${doc.documentUrl}`} target="_blank" rel="noopener">
                View Document
              </Link>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default RtiDocumentPage;
