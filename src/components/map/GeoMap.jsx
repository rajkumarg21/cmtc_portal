import React, { useEffect } from "react";
import { MapContainer, GeoJSON, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardContent, Box } from "@mui/material";

// Fit bounds helper (same as Version 1)
const FitBounds = ({ geoJson }) => {
  const map = useMap();
  useEffect(() => {
    if (geoJson) {
      const layer = L.geoJSON(geoJson);
      map.fitBounds(layer.getBounds(), { padding: [40, 40] });
    }
  }, [geoJson, map]);
  return null;
};

const brightColors = [
  "#FF5733", "#33B5FF", "#FF33A8", "#33FF57", "#FFD133", "#8E33FF",
  "#FF6F33", "#33FFD1", "#FF3333", "#33FF8A", "#33A8FF", "#FF33F6",
];

let colorIndex = 0;

export default function GeoMap({
  data,
  title = "District Map",
  height = "350px",
  onFeatureClick = () => {},
}) {

  // Same coloring logic as V1 (works perfectly)
  const getDistrictColor = () => {
    const color = brightColors[colorIndex % brightColors.length];
    colorIndex++;
    return color;
  };

  const style = () => ({
    fillColor: getDistrictColor(),
    color: "black",
    weight: 1.5,
    fillOpacity: 0.8,
  });

  const onEachFeature = (feature, layer) => {
    const engName = feature.properties?.dist_nm_e;
    const hindiName = feature.properties?.dist_nm_h;

    layer.on({
      click: () => onFeatureClick(engName),
    });

    if (hindiName) {
      layer.bindTooltip(hindiName, {
        permanent: false,
        direction: "top",
      });
    }
  };

  // Labels INSIDE polygon — exact same logic as V1
  const renderLabels = () => {
    if (!data?.features) return null;

    return data.features.map((feature, index) => {
      const hindiName = feature.properties?.dist_nm_h;
      if (!feature.geometry) return null;

      const center = L.geoJSON(feature).getBounds().getCenter();

      return (
        <Marker
          key={index}
          position={center}
          icon={L.divIcon({
            className: "district-label",
            html: `<div>${hindiName}</div>`,
          })}
        />
      );
    });
  };

  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
      <CardHeader
        title={title}
        sx={{
          background: "#1976d2",
          color: "#fff",
          py: 1.2,
          textAlign: "center",
        }}
      />

      <CardContent sx={{ p: 0 }}>
        {/* FIX: Use full height like Version 1 */}
        <Box sx={{ height, width: "100%", position:"relative",zIndex:0 }}>
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            center={[23.5, 78.5]}
            zoom={7}
            minZoom={6}
            maxBoundsViscosity={1.0}   // Prevent shrinking of map
            scrollWheelZoom={false}
          >
            <GeoJSON data={data} style={style} onEachFeature={onEachFeature} />
            <FitBounds geoJson={data} />
            {renderLabels()}
          </MapContainer>
        </Box>
      </CardContent>

      <style>
        {`
          .district-label {
            font-size: 13px;
            font-weight: bold;
            color: black;
            text-shadow: 1px 1px 2px white;
            pointer-events: none !important;   /* 🔥 IMPORTANT FIX */
          }
        `}
      </style>
    </Card>
  );
}
