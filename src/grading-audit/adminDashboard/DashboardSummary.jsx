import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDashboardSummary } from "./dashboardService";

const DashboardSummary = () => {
  const [summary, setSummary] = useState({
    totalCenters: 0,
    completedCenters: 0,
    inProgressCenters: 0,
    notStartedCenters: 0,
    completionPercentage: 0,
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
    //  const response = await getDashboardSummary(cycleId);
     const response = await getDashboardSummary(2);// HARDCODE VALUE
     setSummary(response.data);

      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Assessment Dashboard</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        <Card title="Total Centers" value={summary.totalCenters} />
        <Card title="Completed" value={summary.completedCenters} />
        <Card title="In Progress" value={summary.inProgressCenters} />
        <Card title="Not Started" value={summary.notStartedCenters} />
        <Card
          title="Completion %"
          value={`${summary.completionPercentage}%`}
        />
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "20px",
      textAlign: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      background: "#fff",
    }}
  >
    <h5>{title}</h5>
    <h2>{value}</h2>
  </div>
);

export default DashboardSummary;