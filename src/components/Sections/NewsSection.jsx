// src/components/sections/NewsSection.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

export default function NewsSection({ section }) {
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
        {section.title || "News"}
      </Typography>

      {items.map((news) => {
        const data = JSON.parse(news.dataJson || "{}");

        return (
          <Card key={news.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{data.title}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {data.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.date}
              </Typography>
            </CardContent>
          </Card>
        );
      })}

      {items.length === 0 && (
        <Typography>No news available.</Typography>
      )}
    </Box>
  );
}
