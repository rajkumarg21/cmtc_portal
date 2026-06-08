import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Divider,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getAllAuthorsPublic } from "../../services/authorService";
import PageHeader from "../../components/public/Common/PageHeader";

const defaultAuthors = [
  {
    id: "1",
    nameEnglish: "Ram Kumar",
    nameHindi: "राम कुमार",
    biographyEnglish: "An experienced author in local governance and public policies.",
    biographyHindi: "स्थानीय शासन और सार्वजनिक नीतियों में अनुभवी लेखक।",
    imageUrl: "https://placehold.co/200x200/E0E7FF/3B82F6?text=Ram",
  },
  {
    id: "2",
    nameEnglish: "Sita Sharma",
    nameHindi: "सीता शर्मा",
    biographyEnglish: "Writes extensively on rural development and Panchayati Raj.",
    biographyHindi: "ग्रामीण विकास और पंचायत राज पर व्यापक रूप से लिखती हैं।",
    imageUrl: "https://placehold.co/200x200/E0E7FF/3B82F6?text=Sita",
  },
  {
    id: "3",
    nameEnglish: "Amit Singh",
    nameHindi: "अमित सिंह",
    biographyEnglish: "Specializes in civic education and administrative reforms.",
    biographyHindi: "नागरिक शिक्षा और प्रशासनिक सुधारों में विशेषज्ञ।",
    imageUrl: "https://placehold.co/200x200/E0E7FF/3B82F6?text=Amit",
  },
];

const AuthorsPage = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const data = await getAllAuthorsPublic();
        if (data && data.length > 0) {
          setAuthors(data);
        } else {
          setAuthors(defaultAuthors); // fallback to default data
        }
      } catch (err) {
        console.error("Error fetching authors:", err);
        setError("Failed to fetch authors. Showing default authors.");
        setAuthors(defaultAuthors); // fallback to default data
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Book Authors" />

      {error && (
        <Typography align="center" color="warning.main" py={2}>
          {error}
        </Typography>
      )}

      <Box
        sx={{
          padding: 4,
          display: "flex",
          justifyContent: "center",
          background: "linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%)",
          borderRadius: 3,
        }}
      >
        <Grid container spacing={4}>
          {authors.map((author) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={author.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 3,
                  textAlign: "center",
                  p: 2,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 12,
                  },
                  background: "#ffffff",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={
                      author.imageUrl ||
                      "https://placehold.co/200x200/E0E7FF/3B82F6?text=Author"
                    }
                    alt={author.nameEnglish}
                    sx={{
                      width: 140,
                      height: 140,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `4px solid ${theme.palette.primary.main}`,
                      mb: 2,
                      transition: "all 0.3s ease",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 0 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      background: "linear-gradient(90deg, #4ade80, #60a5fa)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {author.nameEnglish || author.nameHindi}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minHeight: 60 }}
                  >
                    {author.biographyEnglish || author.biographyHindi
                      ? (author.biographyEnglish || author.biographyHindi).substring(0, 80) +
                        "..."
                      : "No bio available."}
                  </Typography>
                </CardContent>

                <Divider sx={{ my: 2 }} />

                <Button
                  component={Link}
                  to={`/authors/${author.id}`}
                  variant="contained"
                  size="small"
                  sx={{
                    borderRadius: 3,
                    background: "linear-gradient(90deg, #4ade80, #60a5fa)",
                    color: "#fff",
                    fontWeight: "bold",
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(90deg, #60a5fa, #4ade80)",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  View Books →
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AuthorsPage;
