import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Divider } from "@mui/material";

export default function DynamicRenderer({ schema, itemsEndpoint }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(itemsEndpoint)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [itemsEndpoint]);

  const safeParse = (json) => {
    try {
      return JSON.parse(json);
    } catch {
      return {};
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {items.map((it) => {
        const data = safeParse(it.dataJson);

        return (
          <Card key={it.id} sx={{ mb: 2, p: 1 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Item #{it.id}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* If schema exists, render fields in schema order */}
              {schema?.fields?.length > 0 ? (
                schema.fields.map((field) => (
                  <Box key={field.name} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {field.label || field.name}
                    </Typography>
                    <Typography variant="body2">
                      {String(data[field.name] ?? "")}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">
                  {JSON.stringify(data, null, 2)}
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}

      {items.length === 0 && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          No items found.
        </Typography>
      )}
    </Box>
  );
}
