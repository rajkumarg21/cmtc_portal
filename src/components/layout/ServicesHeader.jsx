import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { Link } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

const ServicesHeader = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const buttonStyle = {
    color: "#fff",
    textTransform: "none",
    fontWeight: 400,
    fontSize: "0.95rem",
  };

  const services = [
    { label: t("services.hsgProduct"), path: "/advertisementSectionList" },
    { label: t("services.livelihoodActivity"), path: "/filmSectionList" },
    { label: t("services.actAndRule"), path: "/projectSectionList" },
    { label: t("services.successStory"), path: "/printingSectionList" },
    { label: t("services.policies"), path: "/eventSectionList" },
    { label: t("services.anualActionPlan"), path: "/ActionPlanList" },
  ];

  return (
    <>
      <Box
        sx={{
          background: "#7a0c19d9",
          px: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        {/* Left Section - Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 600,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            {t("services.title")}
          </Typography>
          <ChevronRightIcon sx={{ color: "#fff", ml: 0.5 }} />
        </Box>

        {/* Desktop Buttons */}
        {!isMobile && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 3,
              flexWrap: "wrap",
              flex: 1,
            }}
          >
            {services.map((service) => (
              <Button
                key={`${service.path}-${service.label}`}
                component={Link}
                to={service.path}
                sx={buttonStyle}
              >
                {service.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Mobile Menu Icon */}
        {isMobile && (
          <IconButton
            onClick={toggleDrawer(true)}
            sx={{ color: "#fff", ml: 1 }}
            aria-label="open menu"
          >
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: "75%",
            backgroundColor: "#7a0c19",
            color: "#fff",
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t("services.title")}
          </Typography>
          <IconButton onClick={toggleDrawer(false)} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {services.map((service) => (
            <ListItem key={service.path} disablePadding>
              <ListItemButton
                component={Link}
                to={service.path}
                onClick={toggleDrawer(false)}
                sx={{
                  "&:hover": { backgroundColor: "#8e1c27" },
                }}
              >
                <ListItemText
                  primary={service.label}
                  primaryTypographyProps={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "#fff",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default ServicesHeader;
