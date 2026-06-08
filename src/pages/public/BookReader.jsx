import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import { useLocation, useNavigate } from "react-router-dom";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const BookReader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pdfUrl } = location.state || {};

  const [numPages, setNumPages] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 800, height: 1000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const bookRef = useRef(null);

  if (!pdfUrl) {
    return <p>No book selected. Go back to Books page.</p>;
  }

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  // Responsive sizing based on window
  useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const width = screenWidth * 0.9;
      const height = screenHeight * 0.9;
      setDimensions({ width, height });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const goNext = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
      setCurrentPage(currentPage+1);
      
    }
  };

  const goPrev = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
      setCurrentPage(currentPage-1);
    }
  };

  const goToPage = (pageNum) => {
    if (bookRef.current && pageNum >= 1 && pageNum <= numPages) {
      const book = bookRef.current.pageFlip();
      book.turnToPage(pageNum - 1); // ✅ instantly go to that page
      setCurrentPage(pageNum);
    }
  };


  const handlePageClick = (e) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - left;
    clickX < width / 2 ? goPrev() : goNext();
  };

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",   // ✅ centers the flipbook vertically
        margin: 0,
        padding: 0,
      }}
    >

      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {numPages && (
          <HTMLFlipBook
            ref={bookRef}
            width={dimensions.width * zoom}
            height={dimensions.height * zoom}
            showCover={true}
            // onFlip={(e) => setCurrentPage(e.data + 1)}
            useMouseEvents={false}
            style={{
              margin: "0 auto",  // ✅ remove 60px margin
              boxShadow: "0 0 30px rgba(0,0,0,0.7)",
              cursor: "pointer",
              backgroundColor: "#222",
            }}
          >

            {Array.from(new Array(numPages), (_, index) => (
              <div
                key={`page_${index + 1}`}
                className="page"
                onClick={handlePageClick}
                style={{
                  background: "white",
                  height: "100%",
                  width: "100%",
                  overflow: "hidden",
                  userSelect: "none",
                }}
              >
                <Page
                  pageNumber={index + 1}
                  width={dimensions.width * zoom}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </HTMLFlipBook>
        )}
      </Document>

      {/* Control bar (scrolls with content now) */}
      {/* ✅ Fixed Control Bar (Always at Bottom of Page, Above Site Footer) */}
      {/* ✅ Responsive Toolbar for Desktop + Mobile */}
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0, 0, 0, 0.8)",
          borderRadius: "12px",
          padding: window.innerWidth < 600 ? "8px 10px" : "10px 20px",
          display: "flex",
          flexDirection: window.innerWidth < 600 ? "column" : "row", // 📱 stack vertically on mobile
          gap: window.innerWidth < 600 ? "8px" : "12px",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(6px)",
          width: window.innerWidth < 600 ? "90%" : "auto",
          maxWidth: "95%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: window.innerWidth < 600 ? "8px" : "10px",
          }}
        >
          <button
            onClick={goPrev}
            style={{
              padding: window.innerWidth < 600 ? "8px 12px" : "8px 16px",
              fontSize: window.innerWidth < 600 ? "12px" : "14px",
              background: "#444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              flex: "0 0 auto",
            }}
          >
            Prev
          </button>

          <span style={{ fontSize: window.innerWidth < 600 ? "12px" : "14px" }}>
            Page <strong>{currentPage}</strong> / {numPages || "-"}
          </span>

          <button
            onClick={goNext}
            style={{
              padding: window.innerWidth < 600 ? "8px 12px" : "8px 16px",
              fontSize: window.innerWidth < 600 ? "12px" : "14px",
              background: "#444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: window.innerWidth < 600 ? "6px" : "10px",
          }}
        >
          <input
            type="number"
            min="1"
            max={numPages || 1}
            value={pageInput}
            placeholder="Page #"
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const pageNum = parseInt(pageInput);
                if (!isNaN(pageNum)) {
                  goToPage(pageNum);
                  setPageInput("");
                }
              }
            }}
            style={{
              width: window.innerWidth < 600 ? "60px" : "90px",
              padding: "6px",
              fontSize: window.innerWidth < 600 ? "12px" : "14px",
              borderRadius: "5px",
              border: "1px solid #666",
              background: "#222",
              color: "white",
              textAlign: "center",
            }}
          />
          <button
            onClick={() => {
              const pageNum = parseInt(pageInput);
              if (!isNaN(pageNum)) {
                goToPage(pageNum);
                setPageInput("");
              }
            }}
            style={{
              padding: window.innerWidth < 600 ? "6px 10px" : "6px 12px",
              fontSize: window.innerWidth < 600 ? "12px" : "14px",
              background: "#555",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Go
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              padding: window.innerWidth < 600 ? "8px 12px" : "8px 16px",
              fontSize: window.innerWidth < 600 ? "12px" : "14px",
              background: "crimson",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginTop: window.innerWidth < 600 ? "4px" : "0",
          }}
        >
          <label style={{ fontSize: window.innerWidth < 600 ? "12px" : "14px" }}>
            Zoom:
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{
              marginLeft: "5px",
              width: window.innerWidth < 600 ? "80px" : "100px",
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default BookReader;
