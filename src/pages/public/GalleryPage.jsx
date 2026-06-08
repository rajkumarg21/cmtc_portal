import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import {
  getAllGalleryItemsPublic,
  getGalleryCategories,
} from "../../services/galleryService";
import { MEDIA_TYPES } from "../../utils/constants";
import PageHeader from "../../components/public/Common/PageHeader";
import OutlinedInput from "@mui/material/OutlinedInput";

const placeholderGallery = [
  {
    id: 1,
    titleEnglish: "Sample Image 1",
    description: "Placeholder image",
    mediaType: MEDIA_TYPES.IMAGE,
    mediaUrl: "https://placehold.co/400x300",
  },
  {
    id: 2,
    titleEnglish: "Sample Video",
    description: "Placeholder video",
    mediaType: MEDIA_TYPES.VIDEO,
    mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://placehold.co/400x300?text=Video",
  },
  {
    id: 3,
    titleEnglish: "Sample Image 2",
    description: "Another placeholder image",
    mediaType: MEDIA_TYPES.IMAGE,
    mediaUrl: "https://placehold.co/400x300",
  },
];

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState(placeholderGallery);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMediaType, setSelectedMediaType] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const isYouTubeUrl = (url) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, categoriesData] = await Promise.all([
          getAllGalleryItemsPublic(),
          getGalleryCategories(),
        ]);
        setGalleryItems(itemsData.length > 0 ? itemsData : placeholderGallery);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching gallery data:", err);
        setGalleryItems(placeholderGallery);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenMedia = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const filteredItems = galleryItems.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.categoryId === selectedCategory
      : true;
    const matchesMediaType = selectedMediaType
      ? item.mediaType === selectedMediaType
      : true;
    return matchesCategory && matchesMediaType;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Our Gallery" />

      {/* Filters Row */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "center",
          flexWrap: "wrap",
          mb: 4,
          px: 4,
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            input={<OutlinedInput label="Category" />}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="media-type-label">Media Type</InputLabel>
          <Select
            labelId="media-type-label"
            value={selectedMediaType}
            onChange={(e) => setSelectedMediaType(e.target.value)}
            input={<OutlinedInput label="Media Type" />}
          >
            <MenuItem value="">All Media Types</MenuItem>
            <MenuItem value={MEDIA_TYPES.IMAGE}>Images</MenuItem>
            <MenuItem value={MEDIA_TYPES.VIDEO}>Videos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Gallery Items */}
      <Box sx={{ px: 4, pb: 5 }}>
        {filteredItems.length === 0 ? (
          <Typography align="center" color="text.secondary" py={6}>
            No gallery items found for the selected filters.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card
                  sx={{
                    width: 280,
                    height: 280, // fixed square card
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: 3,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardActionArea
                    sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                    onClick={() => handleOpenMedia(item)}
                  >
                    {/* Media fixed area */}
                    {item.mediaType === MEDIA_TYPES.IMAGE ? (
                      <CardMedia
                        component="img"
                        image={`${import.meta.env.VITE_APP_BACKEND_URL}${item.mediaUrl}`}
                        alt={item.titleEnglish || "Image"}
                        sx={{
                          height: "65%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/300x200?text=No+Image";
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "relative",
                          height: "65%",
                          width: "100%",
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={
                            `${import.meta.env.VITE_APP_BACKEND_URL}${item.thumbnailUrl}` ||
                            "https://placehold.co/300x200?text=Video"
                          }
                          alt={item.titleEnglish || "Video"}
                          sx={{
                            height: "100%",
                            width: "100%",
                            objectFit: "cover",
                            filter: "brightness(0.85)",
                          }}
                          onError={(e) => {
                            e.target.src =
                              "https://placehold.co/300x200?text=Video";
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PlayCircleOutlineIcon
                            sx={{
                              fontSize: 60,
                              color: "white",
                              opacity: 0.9,
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    {/* Text fixed area */}
                    <CardContent
                      sx={{
                        height: "35%",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        noWrap
                        sx={{ mb: 0.5 }}
                      >
                        {item.titleEnglish || item.titleHindi}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.description || "No description available"}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Modal for Image/Video */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: "relative", bgcolor: "black" }}>
          <IconButton
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white",
              zIndex: 10,
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <CloseIcon />
          </IconButton>

          {/* Media Preview */}
          {selectedItem?.mediaType === MEDIA_TYPES.VIDEO ? (
            <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
              {isYouTubeUrl(selectedItem.mediaUrl) ? (
                <iframe
                  src={selectedItem.mediaUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : (
                <video
                  src={`${import.meta.env.VITE_APP_BACKEND_URL}${selectedItem.mediaUrl}`}
                  controls
                  autoPlay
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                bgcolor: "black",
              }}
            >
              <img
                src={`${import.meta.env.VITE_APP_BACKEND_URL}${selectedItem?.mediaUrl}`}
                alt={selectedItem?.titleEnglish || "Image"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          {/* Title & Description */}
          <Box sx={{ p: 3, bgcolor: "white" }}>
            <Typography variant="h6" gutterBottom>
              {selectedItem?.titleEnglish || selectedItem?.titleHindi}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedItem?.description || "No description available"}
            </Typography>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default GalleryPage;
