import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { getPublishedBooks } from "../../services/bookService";
import { truncateText } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/apiService";
import PageHeader from "../../components/public/Common/PageHeader";
import { getUserTrialPlan,checkSubscriptions } from '../../services/subscriptionService';
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const BooksPage = () => {
  const { t, i18n } = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasRole } = useAuth();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getPublishedBooks();
        setBooks(data);
      } catch (err) {
        setError("Failed to fetch books.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);


const handleReadBook = async (book) => {
  navigate("/reader", { state: { pdfUrl: `${API_BASE}/books${book.pdfUrl}` } });
  return;
};

  const handleBookDetails = async (book) => {
    setSelectedBook(book);

    if (!isAuthenticated) {
      setSubscriptionDetails(null);
      setIsModalOpen(true);
      return;
    }

    try {
      const res = await checkSubscriptions();
      setSubscriptionDetails(res);
    } catch (error) {
      console.error(error);
      setSubscriptionDetails({ error: "Could not load subscription details." });
    }

    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography align="center" color="error" py={6}>
        {error}
      </Typography>
    );
  }

  if (books.length === 0) {
    return (
      <Typography align="center" color="text.secondary" py={6}>
        No books found.
      </Typography>
    );
  }

  return (
    <Box >

      <PageHeader title={t('publications')} />
      <Box sx={{padding:4}} >
      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: 2,
                textAlign: "center",
                p: 2,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: 6,
                },
                maxWidth: "400px",
                minWidth: "400px"
              }}
            >
              <CardMedia
                component="img"
                image={
                  book.coverImageUrl
                    ? `${API_BASE}/books${book.coverImageUrl}`
                    : "https://placehold.co/300x420/E0E7FF/3B82F6?text=Book+Cover"
                }
                alt={book.titleEnglish}
                sx={{
                  width: "100%",
                  height: 320,
                  objectFit: "cover",
                  mb: 2,
                  borderRadius: 2,
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/300x420/E0E7FF/3B82F6?text=Book+Cover";
                }}
              />
              <CardContent sx={{ p: 0 }} size={{xs:12, md:4, lg: 3}}>

                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {book.titleEnglish || book.titleHindi}
                  </Typography>
                  {book.authorName && (
                    <Chip
                      label={`By: ${book.authorName}`}
                      size="small"
                      sx={{ mb: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {truncateText(book.description || "", 40)}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: "center" }}>
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  {book.pdfUrl && (
                    <Button size="small" variant="outlined" onClick={() => handleReadBook(book)}>
                      Read
                    </Button>
                  )}
                  <Button size="small" variant="contained" onClick={() => handleBookDetails(book)}>
                    Details
                  </Button>
                </Box>
              </CardActions>
            </Card>


          </Grid>
        ))}
      </Grid>
</Box>
      {/* Book Details Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBook && (
          <>
            <DialogTitle sx={{ fontWeight: "bold" }}>
              {selectedBook.titleEnglish || selectedBook.titleHindi}
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={5}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={
                      selectedBook.coverImageUrl
                        ? `${API_BASE}/books${selectedBook.coverImageUrl}`
                        : "https://placehold.co/400x300/E0E7FF/3B82F6?text=Book+Cover"
                    }
                    sx={{ borderRadius: 2, boxShadow: 3 }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/400x300/E0E7FF/3B82F6?text=Book+Cover";
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={7}>
                  {selectedBook.authorName && (
                    <Chip
                      label={`By: ${selectedBook.authorName}`}
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                  )}
                  <Typography variant="body1" paragraph>
                    {selectedBook.description}
                  </Typography>
                  {subscriptionDetails ? (
                    subscriptionDetails.error ? (
                      <Typography color="error">
                        {subscriptionDetails.error}
                      </Typography>
                    ) : subscriptionDetails.subscribed ? (
                      <Chip
                        label={`✅ Subscribed: ${subscriptionDetails.details?.planName}`}
                        color="success"
                      />
                    ) : (
                      <Chip label="❌ Not Subscribed" color="error" />
                    )
                  ) : (
                    <Typography color="warning.main">
                      ⚠ Please log in to view subscription status.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {subscriptionDetails?.subscribed && selectedBook.pdfUrl && (
                <Button size="small" variant="outlined" onClick={() => handleReadBook(selectedBook)}>
                      Read Book
                    </Button>
              )}
              {subscriptionDetails && !subscriptionDetails.subscribed && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => navigate("/SubscriptionPlans")}
                >
                  Subscribe Now
                </Button>
              )}
              <Button onClick={() => setIsModalOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default BooksPage;
