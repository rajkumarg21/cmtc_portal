// NEW FILE: src/pages/FeedbackPage.jsx
import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import { submitFeedback } from "../../services/feedbackService";

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const ratings = [
    { value: "", label: "Select a rating" },
    { value: "1", label: "1 - Poor" },
    { value: "2", label: "2 - Fair" },
    { value: "3", label: "3 - Good" },
    { value: "4", label: "4 - Very Good" },
    { value: "5", label: "5 - Excellent" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await submitFeedback(formData);
      setSuccessMsg("Thank you for your feedback!");
      setFormData({ name: "", email: "", rating: "", message: "" });
    } catch (err) {
      setErrorMsg(
        "Failed to submit feedback: " +
          (err.response?.data || err.message)
      );
      console.error("Feedback submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Paper
        elevation={4}
        sx={{ p: 4, borderRadius: 3, backgroundColor: "white",position:"relative" }}
      >
            <Box
                 sx={{
                   position: "absolute",
                   top: -25,
                   left:"20%",
                   transform: "translateX(-50%)",
                   background: "linear-gradient(90deg, #f3960aff, #f63676ff)",
                   color: "white",
                   px: 3,
                   py: 1,
                   borderRadius: "20px",
                   fontWeight: "bold",
                   boxShadow: 2,
                 }}
               >
                Provide Feedback
               </Box>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          We value your opinion! Please share your thoughts and suggestions.
        </Typography>

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Your Name (Optional)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Your Email (Optional)"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            select
            label="Rating (1-5, 5 being excellent)"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            {ratings.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Comments"
            name="message"
            value={formData.message}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            multiline
            rows={5}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 3, py: 1.2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Feedback"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default FeedbackPage;
