// src/components/sections/GallerySection.jsx
import React, { useEffect, useState } from "react";
import { Grid, Card, CardMedia, Typography, Box } from "@mui/material";

export default function GallerySection({ section }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(`/api/${section.tenant}/content/section/${section.id}`)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [section]);

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {section.title || "Gallery"}
      </Typography>

      <Grid container spacing={2}>
        {items.map((imgItem) => {
          const data = JSON.parse(imgItem.dataJson || "{}");

          return (
            <Grid item xs={6} sm={4} md={3} key={imgItem.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="180"
                  image={data.imageUrl}
                  alt={data.caption}
                />
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {items.length === 0 && (
        <Typography>No images found.</Typography>
      )}
    </Box>
  );
}
