// src/pages/public/StaticPageDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStaticPageBySlug } from '../../services/staticPageService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // ✅ Import

const StaticPageDetail = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { i18n, t } = useTranslation(); // ✅ Hook

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError('');
      try {
        const pageData = await getStaticPageBySlug(slug);
        if (pageData && pageData.status === 'PUBLISHED') {
          setPage(pageData);
        } else {
          setPage(null);
          setError(t('pageNotPublished')); // 🟡 Optional: add to translation file
          toast.error(t('pageNotPublished'));
        }
      } catch (err) {
        console.error('Failed to fetch static page by slug:', err);
        setError(t('pageLoadError') + ': ' + (err.response?.data?.message || err.message));
        toast.error(t('pageLoadError'));
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPage();
  }, [slug, i18n.language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
        <p className="ml-2">{t('loadingContent') || 'Loading page content...'}</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center py-8">{error}</p>;
  }

  if (!page) {
    return (
      <p className="text-gray-600 text-center py-8">
        {t('pageNotFound') || 'Page not found or content is empty.'}
      </p>
    );
  }

  // ✅ Language-based content
  const isHindi = i18n.language === 'hi';
  const displayContent = isHindi ? page.contentHindi : page.contentEnglish;
  const displayTitle = isHindi ? page.titleHindi : page.titleEnglish;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">{displayTitle}</h1>

        {/* <p className="text-gray-600 text-sm mb-6 text-center">
          {t('lastUpdated') || 'Last Updated'}:{' '}
          {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'N/A'}
        </p> */}

        {displayContent ? (
          <div
            className="prose max-w-none text-gray-800 leading-relaxed quill-content"
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        ) : (
          <p className="text-gray-500 text-center">
            {isHindi ? t('noContentHindi') || 'No Hindi content available.' : t('noContentEnglish') || 'No English content available.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default StaticPageDetail;
