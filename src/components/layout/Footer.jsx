import React from "react";
import { Link } from "react-router-dom";
import { Box, Grid, Typography, IconButton, Divider } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from "react-i18next";

const Footer = ({showFull=false}) => {
  const { isAuthenticated, hasRole, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0f172a",
        color: "white",
        mt: "auto",
        position: "relative",
      }}
    >
      {showFull && (<><Grid container direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 6, md: 8 }} padding={2}>
        {/* About Section */}
        <Grid item size={{ sx: 12, md: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: "bold",
              background: "linear-gradient(90deg, #4ade80, #60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            {t('footer.about_title')}
          </Typography>
          <Typography
            variant="body2"
            color="grey.400"
            sx={{ lineHeight: 1.8, fontSize: 14 }}
          >
            {t('footer.about_description')}
          </Typography>
        </Grid>

        {/* Quick Links */}
        <Grid item size={{ xs: 12, md: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: "bold",
              color: "#60a5fa",
            }}
          >
            {t('footer.quick_links_title')}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              // { labelkey: "footer.links.news", label: "Latest News", to: "/news" },
               { labelkey: "footer.links.tender", label: "Tender", to: "/tenders" },
              { labelkey: "footer.links.rti_document", label: "RTI Document", to: "/rti/document" },
              { labelkey: "footer.links.gradation_list", label: "Gradation List", to: "/gradationlist" },
              { labelkey: "footer.links.employees_property", label: "Employees Property", to: "/employeesproperty" },
              { labelkey: "footer.links.contact", label: "Contact Us", to: "/contact" },
              { labelkey: "footer.links.feedback", label: "Feedback", to: "/feedback" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  color: "#cbd5e1",
                  textDecoration: "none",
                  fontSize: 14,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#60a5fa")}
                onMouseLeave={(e) => (e.target.style.color = "#cbd5e1")}
              >
                ➤ {t(link.labelkey)}
              </Link>
            ))}
          </Box>
        </Grid>

        {/* Connect Section */}
        <Grid item size={{ xs: 12, md: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: "bold",
              color: "#60a5fa",
            }}
          >
            {t('footer.connect_title')}
          </Typography>
          <Typography variant="body2" color="grey.400" sx={{ mb: 0.5 }}>
            {t('footer.address')}
          </Typography>
          <Typography variant="body2" color="grey.400" sx={{ mb: 0.5 }}>
            {t('footer.email_label')}:{" "}
            <a
              href="mailto:info@mpmadhyam.gov.in"
              style={{ color: "#cbd5e1", textDecoration: "none" }}
            >
              info@mpmadhyam.gov.in
            </a>
          </Typography>
          <Typography variant="body2" color="grey.400" >
            {t('footer.phone_label')}:{" "}
            <a
              href="tel:0755-2551330"
              style={{ color: "#cbd5e1", textDecoration: "none" }}
            >
              0755-2551330,{" "}
            </a>
            <a
              href="tel:4281330"
              style={{ color: "#cbd5e1", textDecoration: "none" }}
            >
              4281330
            </a>
          </Typography>
          <Typography variant="body2" color="grey.400" sx={{ mb: 2 }}>
            {t('footer.fax_label')}:{" "}
            0755-2558409
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map(
              (Icon, idx) => (
                <IconButton
                  key={idx}
                  href="#"
                  sx={{
                    color: "#cbd5e1",
                    bgcolor: "#1e293b",
                    borderRadius: "50%",
                    transition: "all 0.3s",
                    "&:hover": {
                      color: "#fff",
                      bgcolor: "#60a5fa",
                      transform: "translateY(-3px) scale(1.1)",
                      boxShadow: "0 4px 12px rgba(96,165,250,0.4)",
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              )
            )}
          </Box>
        </Grid>
      </Grid>

        {/* Divider */}
        <Divider sx={{ my: { xs: 4, md: 6 }, borderColor: "grey.700" }} /> </>)
      }
      {/* Copyright */}
      <Typography
        variant="body2"
        color="grey.500"
        align="center"
        sx={{
          fontSize: 13,
          letterSpacing: 0.3,
        }}
      >
        &copy; {new Date().getFullYear()}             {t('footer.rights_reserved')}
      </Typography>
    </Box>
  );
};

export default Footer;
