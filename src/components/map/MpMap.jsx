import { Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GeoMap from "../map/GeoMap";
import mpDistricts from "../../assets/map/mp-district.json";

export default function MpMap() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ py: 1 }}>
      <Typography
        variant="h4"
        textAlign="center"
        fontWeight={600}
        mb={3}
        color="primary"
      >
        Madhya Pradesh District Map
      </Typography>

      <GeoMap
        title="Districts of Madhya Pradesh"
        data={mpDistricts}
        height="75vh"
        onFeatureClick={(districtName) => {
          navigate(`/district/${districtName}`);
        }}
      />
    </Container>
  );
}
