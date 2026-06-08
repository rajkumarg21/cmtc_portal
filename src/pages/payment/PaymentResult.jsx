import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Button, Badge } from "react-bootstrap";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search || ""), [location.search]);

  const bookingId = params.get("bookingId") || "";
  const bookingRef = params.get("bookingRef") || "";
  const stage = (params.get("stage") || "").toUpperCase(); // ADVANCE / REMAINING / FULL
  const status = (params.get("status") || "UNKNOWN").toUpperCase();
  const reason = params.get("reason") || "";
  const appRef = params.get("appRef") || "";

  const isInternalParam = (params.get("isInternal") || "").toLowerCase();
  const isInternal = isInternalParam === "true" || isInternalParam === "1" || isInternalParam === "yes";

  const isSuccess = status === "SUCCESS" || status === "S";
  const isFailed = status === "FAILED" || status === "FAIL" || status === "F" || status === "ERROR";
  const isPending = status === "PENDING" || status === "P" || status === "BOOKED";

  useEffect(() => {
    console.log("✅ CMTC PaymentResult:", { bookingId, bookingRef, stage, status, isInternal, appRef, reason });
  }, [bookingId, bookingRef, stage, status, isInternal, appRef, reason]);

  const badgeVariant = isSuccess ? "success" : isPending ? "warning" : isFailed ? "danger" : "secondary";
  const statusIcon = isSuccess ? "✅" : isPending ? "⏳" : isFailed ? "❌" : "ℹ️";

  const stageText =
    stage === "ADVANCE" ? "Advance Payment (25%)" :
    stage === "REMAINING" ? "Remaining Payment (75%)" :
    stage === "FULL" ? "Full Payment (100%)" :
    stage || "-";

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      <Card className="shadow border-0" style={{ maxWidth: 560, width: "100%", borderRadius: 16 }}>
        <Card.Body className="p-4 text-center">

          <div style={{ fontSize: 48 }} className="mb-3">{statusIcon}</div>
          <h4 className="fw-bold mb-2">
            {isSuccess ? "Payment Successful" : isPending ? "Payment Pending" : isFailed ? "Payment Failed" : "Payment Status"}
          </h4>

          <Badge bg={badgeVariant} className="mb-3 px-3 py-2">{status}</Badge>

          {isSuccess && <p className="text-muted">Your payment was completed successfully. You can now view your booking details.</p>}
          {isPending && <p className="text-muted">Your payment is currently pending. Please check again after a few minutes.</p>}
          {isFailed && <p className="text-muted">The payment could not be completed. Any deducted amount will be reversed as per bank/payment gateway timelines.</p>}
          {reason && <p className="text-muted small">Reason: <span className="fw-semibold">{reason}</span></p>}

          <Card className="bg-light border-0 my-4">
            <Card.Body className="py-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="small text-muted">Booking ID</div>
                  <div className="fw-semibold">{bookingId || "-"}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="small text-muted">Booking Ref</div>
                  <div className="fw-semibold">{bookingRef || "-"}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="small text-muted">Payment Type</div>
                  <div className="fw-semibold">{isInternal ? "Internal User (100%)" : "External User (Stage-wise)"}</div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="small text-muted">Payment Stage</div>
                  <div className="fw-semibold">{stageText}</div>
                </div>
                <div className="col-12">
                  <div className="small text-muted">Application Ref</div>
                  <div className="fw-semibold">{appRef || "-"}</div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <div className="d-flex gap-2 justify-content-center mt-4 flex-wrap">
            <Button variant="primary" onClick={() => navigate("/cmtc-booking")}>My Bookings</Button>
            {bookingId && <Button variant="outline-primary" onClick={() => navigate(`/cmtc-booking/${bookingId}`)}>View Booking</Button>}
            <Button variant="outline-secondary" onClick={() => navigate("/")}>Go Home</Button>
          </div>

        </Card.Body>
      </Card>
    </Container>
  );
}