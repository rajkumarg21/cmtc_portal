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
  centers
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
// Create district wise count
const getDistrictCounts = () => {
  if (!centers) return {};

  const counts = {};

  centers.forEach((c) => {
    const key = c.districtNameEn?.toLowerCase();

    if (!counts[key]) counts[key] = 0;

    counts[key]++;
  });

  return counts;
};
const renderCenterCountMarkers = () => {

  if (!data?.features || !centers) return null;

  const counts = getDistrictCounts();

  return data.features.map((feature, index) => {

    const districtEn =
      feature.properties?.dist_nm_e?.toLowerCase();

    const count = counts[districtEn];

    if (!count) return null;

    const center =
      L.geoJSON(feature).getBounds().getCenter();

    return (
      <Marker
  key={districtEn}
  position={center}
  icon={L.divIcon({
    className: "",
    html: `
      <div class="building-marker">
        <div class="building-icon">🏢</div>
        <div class="building-count">${count}</div>
      </div>
    `,
    iconSize: [40, 40],      // ✅ VERY IMPORTANT
    iconAnchor: [20, 40],    // ✅ VERY IMPORTANT
  })}
/>
    );
  });
};

  return (
    <Card sx={{ borderRadius: 1, overflow: "hidden" }}>
      <CardHeader
        title={title}
        sx={{
          background: "#0f766e",
          color: "#fff",
          py: 1.2,
          textAlign: "center",
        }}
        
      />

      <CardContent sx={{ p: 0 }}>
        {/* FIX: Use full height like Version 1 */}
        <Box sx={{ height, width: "100%", position:"relative",zIndex:0}}>
          <MapContainer
            style={{ height: "90vh", width: "100%" }}
            center={[23.5, 78.5]}
            zoom={7}
            minZoom={7}
            maxBoundsViscosity={1.0}   // Prevent shrinking of map
            scrollWheelZoom={false}
          >
            <GeoJSON data={data} style={style} onEachFeature={onEachFeature} />
            <FitBounds geoJson={data} />
         {renderLabels()}
{renderCenterCountMarkers()}
          </MapContainer>
        </Box>
      </CardContent>
<style>
{`

.district-label {
 font-size:13px;
 font-weight:bold;
 color:#000;
 text-shadow:1px 1px 3px #fff;
 pointer-events:none;
}


/* BUILDING MARKER DESIGN */

.building-marker{

 position:relative;

 display:flex;

 align-items:center;

 justify-content:center;

}



.building-icon{

 font-size:10px;

 background:white;

 border-radius:50%;

 padding:6px;

 box-shadow:0 4px 10px rgba(0,0,0,0.3);

 border:3px solid #0f766e;

}


.building-count{

 position:absolute;

 top:-6px;

 right:-8px;

 background:#ef4444;

 color:white;

 font-size:12px;

 font-weight:bold;

 min-width:20px;

 height:20px;

 display:flex;

 align-items:center;

 justify-content:center;

 border-radius:50%;

 border:2px solid white;

 box-shadow:0 2px 6px rgba(0,0,0,0.4);

}


/* hover effect */

.building-marker:hover .building-icon{

 transform:scale(1.2);

 transition:0.2s;

 cursor:pointer;

}


`}
</style>

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
