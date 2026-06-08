import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import Sidebar from '../layout/Sidebar';
import { getStaticPageBySlug } from '../../services/staticPageService';
import { useTranslation } from 'react-i18next';

const ContentSection = ({ pageName = 'about' }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchPageContent = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getStaticPageBySlug(pageName);

        let resolvedTitle = data?.titleEnglish || '';
        let resolvedContent = data?.contentEnglish || '';

        if (i18n.language === 'hi') {
          resolvedTitle = data?.titleHindi || resolvedTitle;
          resolvedContent = data?.contentHindi || resolvedContent;
        }

        setTitle(resolvedTitle);
        setContent(resolvedContent);
      } catch (err) {
        console.error('Failed to fetch content:', err);
        setError('Content could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, [i18n.language, pageName]);

  return (
    <Box sx={{ backgroundColor: '#fff8f2' }}>
      <Box sx={{ py: 8, px: { xs: 2, md: 10 }, backgroundColor: '#fff' }}>
        <Grid container spacing={6} alignItems="center">
             <Grid item xs={12} md={6} size={6}>   <Sidebar /> </Grid>

          <Grid item xs={12} md={6} size={6}>
            <Card
              sx={{
                width: { xs: '100%', md: '100%' },
                zIndex: 1,
                p: 3,
                borderRadius: 4,
                backgroundColor: '#fff',
                boxShadow: 3,
              }}
            >
              <CardContent>
                <Box>
                  <Button
                    size="small"
                    sx={{
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      fontSize: 11,
                      fontWeight: 600,
                      mb: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 2,
                    }}
                  >
                    {pageName}
                  </Button>

                  {loading && <CircularProgress size={24} />}
                  {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                      {error}
                    </Typography>
                  )}
                  {!loading && !error && content && (
                    <>
                    
                      <Typography variant="h5" fontWeight={600} gutterBottom>
                        {title}
                      </Typography>
                      <Typography
                        variant="body1"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ContentSection;
