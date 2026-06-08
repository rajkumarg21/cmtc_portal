import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';

import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { submitContactMessage } from "../../services/contactService";
import { useTranslation } from "react-i18next";

const themeColor = "#ff4b2b";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {t} = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await submitContactMessage(formData);
      setMessage("Your message has been sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Failed to send message: " + (err.response?.data || err.message));
      console.error("Contact form submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, py: 6, px: 2, backgroundColor: "#fafafa" ,display:"flex",alignContent:"center",justifyContent:"center"}}>
      <Grid container spacing={4} justifyContent="center">
        
        {/* Contact Info */}
        <Grid item xs={12} md={4} sx={{display:"flex",justifyContent:"center",alignContent:"center"}}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${themeColor}, #ff6a4d)`,
              color: "white",
            }}
          >
            <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t("contact.info_title")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              {t("contact.subtitle")}
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon sx={{ color: "white" }}>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t("contact.address")}
                  primaryTypographyProps={{ color: "white" }}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon sx={{ color: "white" }}>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="info@mpcmtc.gov.in"
                  primaryTypographyProps={{ color: "white" }}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon sx={{ color: "white" }}>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="0755-2551330"
                  primaryTypographyProps={{ color: "white" }}
                />
              </ListItem>
            </List>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              align="center"
              gutterBottom
              sx={{ color: themeColor }}
            >
              {t("contact.title")}
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 3 }}>
              {t("contact.subtitle")}
            </Typography>

            {message && (
              <Box
                sx={{
                  bgcolor: "#d4edda",
                  color: "#155724",
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                {message}
              </Box>
            )}
            {error && (
              <Box
                sx={{
                  bgcolor: "#f8d7da",
                  color: "#721c24",
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                {error}
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} size={6}>
                  <TextField
                    fullWidth
                    label={t("contact.name")}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} size={6}>
                  <TextField
                    fullWidth
                    label={t("contact.email")}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} size={12}>
                  <TextField
                    fullWidth
                    label={t("contact.subject")}
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} size={12}>
                  <TextField
                    fullWidth
                    label={t("contact.message")}
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: `linear-gradient(90deg, ${themeColor}, #ff6a4d)`,
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : t("contact.send_button")}
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactPage;
