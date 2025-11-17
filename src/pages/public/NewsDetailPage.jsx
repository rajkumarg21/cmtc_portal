import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
  CircularProgress,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import {
  getPublishedNewsArticleById,
  getLatestPublishedNews,
} from "../../services/newsService";
import PageHeader from "../../components/public/Comman/PageHeader";
import { useTranslation } from "react-i18next";

const placeholderArticle = {
  titleHindi: "कोई शीर्षक उपलब्ध नहीं",
  titleEnglish: "No title available",
  summaryHindi: "कोई सारांश उपलब्ध नहीं।",
  summaryEnglish: "No summary available.",
  publishedAt: new Date().toISOString(),
  author: "Unknown",
  newsDate: null,
  imageUrl: null,
  contentHindi: "<p>कोई सामग्री उपलब्ध नहीं।</p>",
  contentEnglish: "<p>No content available.</p>",
};

const OTHER_NEWS_COUNT = 5; // number of sidebar items

const NewsDetailPage = () => {
    const location = useLocation();
  const preloadedArticle = location.state?.article;
  const navigate = useNavigate(); // if you want programmatic navigation later
  const { id } = useParams();
  const [article, setArticle] = useState(placeholderArticle);
  const [loading, setLoading] = useState(true);
  const [otherNews, setOtherNews] = useState([]);
  const [otherLoading, setOtherLoading] = useState(true);
  const { i18n } = useTranslation();
  
useEffect(() => {
  let mounted = true;
  const fetchArticle = async () => {
    setLoading(true);
    try {
      // If router passed article via state and it matches this id, use it to avoid network call
      if (preloadedArticle && String(preloadedArticle.id) === String(id)) {
        if (!mounted) return;
        setArticle({ ...placeholderArticle, ...preloadedArticle });
        setLoading(false);
        return;
      }

      // otherwise fetch from server
      const data = await getPublishedNewsArticleById(id);
      if (!mounted) return;
      if (data) {
        setArticle({ ...placeholderArticle, ...data });
      } else {
        setArticle(placeholderArticle);
      }
    } catch (err) {
      console.error("Error fetching news article:", err);
      if (mounted) setArticle(placeholderArticle);
    } finally {
      if (mounted) setLoading(false);
    }
  };
  fetchArticle();
  return () => {
    mounted = false;
  };
}, [id, preloadedArticle]);


  // fetch latest other news (exclude current id)
  useEffect(() => {
    let mounted = true;
    const fetchOther = async () => {
      setOtherLoading(true);
      try {
        const candidateCount = Math.max(
          OTHER_NEWS_COUNT + 2,
          OTHER_NEWS_COUNT
        );
        const items = await getLatestPublishedNews(candidateCount);
        if (!mounted) return;
        if (Array.isArray(items)) {
          const filtered = items.filter(
            (n) => String(n.id) !== String(id)
          );
          setOtherNews(filtered.slice(0, OTHER_NEWS_COUNT));
        } else {
          setOtherNews([]);
        }
      } catch (err) {
        console.error("Error fetching latest news:", err);
        if (mounted) setOtherNews([]);
      } finally {
        if (mounted) setOtherLoading(false);
      }
    };
    fetchOther();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  const isHindi = i18n.language === "hi";
  const displayTitle = isHindi
    ? article.titleHindi || article.titleEnglish
    : article.titleEnglish || article.titleHindi;
  const displaySummary = isHindi
    ? article.summaryHindi || article.summaryEnglish
    : article.summaryEnglish || article.summaryHindi;
  const displayContent = isHindi
    ? article.contentHindi || article.contentEnglish
    : article.contentEnglish || article.contentHindi;

  return (
    <Box>
      <PageHeader title="News Detail" />
      <Box sx={{ padding: 4 }}>
        <Grid
  container
  spacing={4}
  sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "flex-start" }}
>
          {/* Main Content - 80% */}
          <Grid item xs={12} md={12} sx={{ flex: "0 0 75%", maxWidth: "75%" }}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {/* Hero Image */}
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="350"
                  image={
                    article.imageUrl
                      ? `${import.meta.env.VITE_BASE_URL || ""}${
                          article.imageUrl
                        }`
                      : "https://placehold.co/800x400/E0E7FF/3B82F6?text=No+Image"
                  }
                  alt={article.titleEnglish || "news-hero"}
                  sx={{ objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/800x400/E0E7FF/3B82F6?text=No+Image";
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    color: "#fff",
                    p: 2,
                  }}
                >
                  <Typography variant="h4" fontWeight="bold">
                    {displayTitle}
                  </Typography>
                </Box>
              </Box>

              <CardContent>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontStyle: "italic" }}
                >
                  {displaySummary}
                </Typography>
                <Box display="flex" gap={2} mb={2} color="text.secondary">
                  <Typography variant="body2">
                    📅 {new Date(article.publishedAt).toLocaleDateString("en-GB")}
                  </Typography>
                  {article.author && (
                    <Typography variant="body2">✍️ {article.author}</Typography>
                  )}
                  {article.newsDate && (
                    <Typography variant="body2">
                      📰 {new Date(article.newsDate).toLocaleDateString("en-GB")}
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    color: "text.primary",
                    "& p": { mb: 2, lineHeight: 1.7 },
                    "& img": { maxWidth: "100%", borderRadius: "8px" },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: displayContent,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar - 20% */}
          <Grid
  item
  xs={12}
  md={12}
  sx={{    flex: "0 0 25%",    maxWidth: "25%",    position: "sticky",    top: 100,    height: "calc(100vh - 120px)",
    overflowY: "auto",  }} >
     <Typography  variant="h6"  gutterBottom
       sx={{    color: "#1976d2", // link blue
        textDecoration: "underline",    fontWeight: "bold",    cursor: "pointer",  }}>
        Other Important News
     </Typography>
     
            {otherLoading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : otherNews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No other news available.
              </Typography>
            ) : (
              <List disablePadding>
                {otherNews.map((news) => {
                  const title = isHindi
                    ? news.titleHindi || news.titleEnglish
                    : news.titleEnglish || news.titleHindi;
                  const thumb = news.imageUrl
                    ? `${import.meta.env.VITE_BASE_URL || ""}${news.imageUrl}`
                    : news.img || "https://placehold.co/120x80";
                  return (
                    <ListItemButton
                      key={news.id}
                      component={Link}
                      to={{
                          pathname: `/news/${news.id}`,
                        }}
                        state={{ article: news }}
                      sx={{ mb: 1, borderRadius: 1 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={thumb}
                          alt={title}
                          sx={{ width: 80, height: 55, mr: 1 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, lineHeight: 1.2 }}
                          >
                            {title}
                          </Typography>
                        }
                        secondary={
                          news.publishedAt ? (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(news.publishedAt).toLocaleDateString("en-GB")}
                            </Typography>
                          ) : null
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default NewsDetailPage;
