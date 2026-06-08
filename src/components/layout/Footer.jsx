import React from "react";
import { Link } from "react-router-dom";
import { Box, Grid, Typography, IconButton, Divider } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from "react-i18next";
import logo from "../../assets/images/srlm_logo.png"
import MuiLink from "@mui/material/Link";

const links = [
  { labelkey: "footer.links.home", label_en: "Home", label_hi: "होम", to: "" },
  // { labelkey: "footer.links.whats_new", label_en: "What's New", label_hi: "क्या नया है", to: "" },
  // { labelkey: "footer.links.rti", label_en: "RTI", label_hi: "सूचना का अधिकार", to: "/rti/document" },
  // { labelkey: "footer.links.tender", label_en: "Tender", label_hi: "टेंडर", to: "/tenders" },
  // { labelkey: "footer.links.faq", label_en: "FAQ", label_hi: "सामान्य प्रश्न", to: "" },
  // { labelkey: "footer.links.feedback", label_en: "Feedback", label_hi: "फीडबैक", to: "/feedback" },
  { labelkey: "footer.links.contact", label_en: "Contact Us", label_hi: "हमसे संपर्क करें", to: "/contact" },
  // { labelkey: "footer.links.sitemap", label_en: "Sitemap", label_hi: "साइटमैप", to: "/contact" },
  // { labelkey: "footer.links.help", label_en: "Help", label_hi: "सहायता", to: "/contact" },
  // { labelkey: "footer.links.web_info_manager", label_en: "Web Information Manager", label_hi: "वेब सूचना प्रबंधक", to: "" },
  // { labelkey: "footer.links.abbreviations", label_en: "Abbreviations", label_hi: "संक्षेप", to: "" }
];

const Footer = ({ showFull = false }) => {
  const { isAuthenticated, hasRole, logout } = useAuth();
  const { t } = useTranslation();

  const renderLinks = (links) => (
  <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
    {links.map((link) => (
      <MuiLink
        key={link.to || link.labelkey}
        component={Link}
        to={link.to || ""}
        underline="none"
        sx={{
          color: "grey.300",
          fontSize: 12,
          transition: "0.3s",
          "&:hover": { color: "#ffffff", pl: 0.5 }
        }}
      >
        | {t(link.labelkey)}
      </MuiLink>
    ))}
  </Box>
);
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1F3C88",
        color: "white",
        mt: "auto",
        position: "relative",
        padding:1
      }}
    >
      {showFull && (<>
        <Grid container direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 6, md: 8 }} >
          {/* About Section */}
          <Grid item paddingX={{xs:1, md:2}}size={{ xs: 12, md: 4 }}>
            <Box
              component="img"
              src={logo} 
              alt="MP CMTC CMS"
              sx={{
                height: 55,       
                width: 'auto',  
                // mr: 1,      
              }}
            />
            <Typography
              variant="body2"
              color="grey.300"
              sx={{ lineHeight: 1.7, fontSize: 13 }}
              paddingY={{xs:1,md:2}}
            >
              {t('footer.about_description')}
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item size={{ xs: 12, md: 4}}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#ffffff",
                fontSize: 16
              }}
            >
              {t('footer.quick_links_title')}
            </Typography>
            {renderLinks(links)}
          </Grid>

          {/* Connect Section */}
          <Grid item size={{ xs: 12, md: 4 }} >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: "#ffffff",
                fontSize: 16
              }}
            >
              {t('footer.connect_title')}
            </Typography>
            <Typography variant="body2" color="grey.300" sx={{ mb: 2 ,fontSize: 13}}>
              {t('footer.address')}
            </Typography>
            <Typography variant="body2" color="grey.300" sx={{ mb: 2, fontSize: 13}}>
              {t('footer.phone_label')}:{" "}
              0755-4861262/63
            </Typography>
            {/* <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map(
                (Icon, idx) => (
                  <IconButton
                    key={idx}
                    href="#"
                    sx={{
                      color: "#000000",
                      bgcolor: "#d6d6d6",
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
            </Box> */}
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 1, borderColor: "grey.400" }} /> </>)
      }
      {/* Copyright */}
      <Typography
        variant="body2"
        color="grey.300"
        align="center"
        paddingBottom={2}
        sx={{
          fontSize: 13,
          letterSpacing: 0.3,
        }}
      >
        {t('footer.copyright')} &copy; {new Date().getFullYear()}  {t('footer.rights_reserved')}
      </Typography>
    </Box>
  );
};

export default Footer;
