import React from 'react';
import Marquee from 'react-fast-marquee';
import { Box, Typography, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Marqoo = ({ marqueeItems = [], speed = 50, direction = 'left' }) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'en';
  if (!marqueeItems.length) return null; // Nothing to display

  const languageMap = { en: 'english', hi: 'hindi' };
  const langKey = languageMap[language] || 'english';

  return (
    <Box sx={{ bgcolor: '#212121', py: 1,position:"relative" }}>
    {/* <Box sx={{ bgcolor: '#212121', py: 1 }}> */}
      <Marquee pauseOnHover speed={speed} direction={direction} gradient={false}>
        {marqueeItems.map((item) => {
          const content = (item.content && item.content[langKey]) || '';
          if (!content) return null;

          if (item.type.toLowerCase() === 'link' && item.url) {
            return (
              <Link
                key={item.id}
                href={item.url}
                color="white"
                underline="hover"
                sx={{ mx: 3, whiteSpace: 'nowrap', cursor: 'pointer' }}
                target="_blank"
                rel="noopener noreferrer"

              >
                {content}
              </Link>
            );
          }

          return (
            <Typography
              key={item.id}
              variant="body1"
              color="white"
              sx={{ mx: 3, whiteSpace: 'nowrap' }}
            >
              {content}
            </Typography>
          );
        })}
      </Marquee>
    </Box>
  );
};

export default Marqoo;
