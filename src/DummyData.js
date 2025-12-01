// /data/pdfFiles.js
export const pdfFiles = [
  {
    id: '1',
    publicationYear: '42',
    title: '42_29_25',
    editionNo: '32',
    dateFrom: '21/01/2025',
    dateTo: '28/01/2025',
    pdfUrl: 'files/42_29_25.pdf' 
  },
  {
    id: '3',
    publicationYear: '42',
    title: '42_28_25',
    editionNo: '32',
    dateFrom: '21/01/2025',
    dateTo: '28/01/2025',
    pdfUrl: 'files/42_29_25.pdf' 
  },
  {
    id: '2',
    publicationYear: '42',
    title: '42_27_25',
    editionNo: '32',
    dateFrom: '21/01/2025',
    dateTo: '28/01/2025',
    pdfUrl: 'files/42_29_25.pdf' 
  },
];

//Important
export const defaultHeaderLinks = [
  { path: '/', labelKey: 'home' },
  { path: '/gallery', labelKey: 'gallery' },
  { path: '/rojgarAndNirman', labelKey: 'rojgar' },
  { path: '/books', labelKey: 'books' },
  // { path: '/rti/submit', labelKey: 'rti' },
  // { path: '/subscriptions/new', labelKey: 'subscription' }
];

export const RojgarNirmanSubHeaderTabs = [
  { labelKey: 'overview', path: '/rojgarAndNirman' },
  { labelKey: 'abhilekh', path: '/rojgarAndNirman/abhilekh' },
  { labelKey: 'samyiki', path: '/rojgarAndNirman/samyiki' },
  { labelKey: 'khelCharcha', path: '/rojgarAndNirman/khelCharcha' },
  { labelKey: 'lastWeek', path: '/rojgarAndNirman/lastWeek' },
];

//marqueeItems dummy list
export const marqueeItems = [
  {
    id: 1,
    type: 'text',
    content: {
      en: 'Welcome to our site!',
      hi: 'हमारी साइट पर आपका स्वागत है!',
    },
  },
  {
    id: 12,
    type: 'link',
    content: {
      en: 'Check updates',
      hi: 'अपडेट देखें',
    },
    url: '/rojgarAndNirman',
  },
];

