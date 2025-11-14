import React, { useState, useEffect } from "react";
import { getPublishedTenders } from "../../services/tenderService";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Link as MuiLink,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PageHeader from "../../components/public/Common/PageHeader";
import { useTranslation } from "react-i18next";

const themeColor = "#ff4b2b";

const TenderPage = () => {
  const [tenders, setTenders] = useState([]);
  const [fileSizes, setFileSizes] = useState({});
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const data = await getPublishedTenders();
        const today = new Date();
      const filtered = (data || []).filter((t) => {
        if (!t.archiveDate) return true; // if no archive date, keep it visible
        const archive = new Date(t.archiveDate);
        return archive >= today.setHours(0, 0, 0, 0);
      });

      setTenders(filtered);
      } catch (err) {
        console.error("Error fetching tenders:", err);
        setTenders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, []);

  // 🧮 Helper to fetch and cache file sizes
  const getFileSize = async (url, id) => {
    if (!url) return;
    try {
      const res = await fetch(url, { method: "HEAD" });
      const size = res.headers.get("content-length");
      if (!size) return;
      const mb = size / (1024 * 1024);
      const readableSize = mb > 1 ? `${mb.toFixed(1)} MB` : `${(mb * 1024).toFixed(0)} KB`;
      setFileSizes((prev) => ({ ...prev, [id]: readableSize }));
    } catch {
      /* ignore failures */
    }
  };

  useEffect(() => {
    // fetch file sizes once per tender
    tenders.forEach((t) => {
      const link =
        t.attachmentUrl &&
        (t.attachmentUrl.startsWith("http")
          ? t.attachmentUrl
          : `${import.meta.env.VITE_BASE_URL}${t.attachmentUrl}`);
      if (link && !fileSizes[t.id]) getFileSize(link, t.id);
    });
  }, [tenders]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress sx={{ color: themeColor }} />
      </Box>
    );

  return (
    <Box>
      <PageHeader title={t("tender")} />
      <Box sx={{ p: 4 }}>
        <Paper sx={{ borderRadius: 3, boxShadow: 4, p: 3 }}>
          {tenders.length === 0 ? (
            <Typography align="center" color="text.secondary">
              No tenders available.
            </Typography>
          ) : (
            <List>
              {tenders.map((tender) => {
                // 🌐 Show Hindi or English title based on selected language
                const title = isHindi
                  ? tender.titleHindi?.trim() || tender.titleEnglish || "शीर्षक नहीं"
                  : tender.titleEnglish?.trim() || tender.titleHindi || "Untitled";

                const displayText = `${title}, ${new Date(
                  tender.orderDate
                ).toLocaleDateString("en-GB")}`;

                const link =
                  tender.attachmentUrl &&
                  (tender.attachmentUrl.startsWith("http")
                    ? tender.attachmentUrl
                    : `${import.meta.env.VITE_BASE_URL}${tender.attachmentUrl}`);

                return (
                  <ListItem
                    key={tender.id}
                    sx={{
                      borderBottom: "1px solid #eee",
                      "&:hover": { backgroundColor: "#f9f9f9" },
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {link ? (
                      <>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <PictureAsPdfIcon sx={{ color: "#d32f2f" }} />
                        </ListItemIcon>
                        <MuiLink
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: themeColor,
                            fontWeight: 600,
                            fontSize: "1rem",
                            flexGrow: 1,
                          }}
                        >
                          {displayText}
                        </MuiLink>
                        {fileSizes[tender.id] && (
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", ml: 1 }}
                          >
                            ({fileSizes[tender.id]})
                          </Typography>
                        )}
                      </>
                    ) : (
                      <ListItemText
                        primary={displayText}
                        secondary="No attachment available"
                        sx={{ color: "text.secondary" }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default TenderPage;
