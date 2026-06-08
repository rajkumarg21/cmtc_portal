import React, { useState, useEffect } from 'react';
import { getPublishedCirculars } from '../../services/circularService';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material';
import PageHeader from '../../components/public/Common/PageHeader';
const defaultCirculars = [
  {
    id: 1,
    orderDate: '2025-08-01',
    titleEnglish: 'Default Circular 1',
    titleHindi: 'डिफ़ॉल्ट परिपत्र 1',
    categoryName: 'General',
    attachmentUrl: 'https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf',
  },
  {
    id: 2,
    orderDate: '2025-08-05',
    titleEnglish: 'Default Circular 2',
    titleHindi: 'डिफ़ॉल्ट परिपत्र 2',
    categoryName: 'Finance',
    attachmentUrl: '',
  },
  {
    id: 3,
    orderDate: '2025-08-10',
    titleEnglish: 'Default Circular 3',
    titleHindi: 'डिफ़ॉल्ट परिपत्र 3',
    categoryName: 'HR',
    attachmentUrl: '',
  },
];

const themeColor = '#ff4b2b'; // Your theme color

const CircularsPage = () => {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCirculars = async () => {
      try {
        const data = await getPublishedCirculars();
        setCirculars(data && data.length ? data : defaultCirculars);
      } catch (err) {
        console.error('Error fetching circulars:', err);
        setCirculars(defaultCirculars);
      } finally {
        setLoading(false);
      }
    };
    fetchCirculars();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress sx={{ color: themeColor }} />
      </Box>
    );

  return (
    <Box sx={{}}>
     <PageHeader
        title="News Laters"
      />
<Box sx={{padding:4}}>
      <Paper sx={{ overflowX: 'auto', borderRadius: 3, boxShadow: 4,padding:"20px" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Order Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Title (English)</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Title (Hindi)</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Attachment</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {circulars.map((circular) => (
              <TableRow
                key={circular.id}
                hover
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': { backgroundColor: '#f0f8f8' },
                }}
              >
                <TableCell>
                  {new Date(circular.orderDate).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell>{circular.titleEnglish}</TableCell>
                <TableCell>{circular.titleHindi}</TableCell>
                <TableCell>{circular.categoryName}</TableCell>
                <TableCell>
                  {circular.attachmentUrl ? (
                    <MuiLink
                      href={`${import.meta.env.VITE_BASE_URL}${circular.attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: themeColor, fontWeight: 500 }}
                    >
                      View Attachment
                    </MuiLink>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      </Box>
    </Box>
  );
};

export default CircularsPage;
