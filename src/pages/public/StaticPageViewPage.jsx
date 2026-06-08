import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStaticPageBySlug } from '../../services/staticPageService';

const StaticPageViewPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      const data = await getStaticPageBySlug(slug);
      setPage(data);
    };
    loadPage();
  }, [slug]);

  if (!page) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-semibold">{page.titleEnglish}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.contentEnglish }} />
    </div>
  );
};

export default StaticPageViewPage;
