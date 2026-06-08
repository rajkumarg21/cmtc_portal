import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  Avatar,
  CircularProgress,
} from "@mui/material";

import {
  People,
  ShoppingCart,
  CheckCircle,
  Business, Cancel,
  Pending,
} from "@mui/icons-material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
import api from "../../services/apiService";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];


// ================= STAT CARD =================

const StatCard = ({ title, value, icon, gradient }) => (

  <Card
    sx={{
      borderRadius: 4,
      background: gradient,
      color: "#fff",
      p: 2.5,
      position: "relative",
      overflow: "hidden",

      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",

      transition: "all 0.3s ease",

      "&:hover": {
        transform: "translateY(-6px) scale(1.02)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      },
    }}
  >

    {/* Top Section */}

    <Stack direction="row" justifyContent="space-between" alignItems="center">

      <Box>

        <Typography
          sx={{
            fontSize: "13px",
            opacity: 0.9,
            fontWeight: 500,
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: "28px",
            fontWeight: "bold",
            mt: 1,
          }}
        >
          {value}
        </Typography>

      </Box>


      {/* Icon Circle */}

      <Avatar
        sx={{
          bgcolor: "rgba(255,255,255,0.2)",
          width: 50,
          height: 50,
        }}
      >
        {icon}
      </Avatar>
    </Stack>
    {/* Background Design Circle */}
    <Box
      sx={{
        position: "absolute",
        right: -20,
        bottom: -20,
        width: 100,
        height: 100,
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50%",
      }}
    />
  </Card>
);
// ================= MAIN =================

export default function AdminDashboardPage() {
  const { t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [districtData, setDistrictData] = useState([]);
  const [centerData, setCenterData] = useState([]);
  const month = 2;
  const year = 2026;
  useEffect(() => {
    loadDashboard();
  }, []);
  const loadDashboard = async () => {
    try {
      const statsRes = await api.get("/analytics/admin/dashboard-stats"
      );
      const districtRes = await api.get(`/analytics/district-booking-count?month=${month}&year=${year}` );
      const centerRes = await api.get(`/analytics/center-booking-count?month=${month}&year=${year}` );
      setStats(statsRes.data);
   setDistrictData(
  districtRes.data
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0,10)
    .map(item => ({
      name: item.districtNameHi,
      value: item.bookingCount
    }))
);
      setCenterData(
  centerRes.data
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .map(item => ({
      name: item.description,   // Hindi name
      value: item.bookingCount
    }))
);
    setLoading(false);
    } catch (error) {
      console.error(error);

    }
  };
  if (loading)
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  return (
    <Box p={4} bgcolor="#f8fafc" minHeight="100vh">
      <Typography variant="h4" mb={4} fontWeight="bold">
       {t("admin.adminDashboard")}
      </Typography>
      {/* STAT CARDS */}
     <Grid container spacing={3} mb={4}>
        <Grid item size={{ xs: 12, md: 4 }}>
           <Link to="/admin/users" style={{ textDecoration: "none" }}>
            <StatCard
            title={t("admin.totalUsers")}
            value={stats.totalUsers}
            icon={<People />}
            gradient="linear-gradient(135deg,#6366f1,#8b5cf6)"
          />
           </Link>
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
          <Link to="/admin/bookings/all" style={{ textDecoration: "none" }}>
          <StatCard
            title={t("admin.totalBookings")}
            value={stats.totalBooking}
            icon={<ShoppingCart />}
            gradient="linear-gradient(135deg,#0ea5e9,#38bdf8)"
          />
        </Link>
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
         <Link to="/admin/bookings/booked" style={{ textDecoration: "none" }}>
          <StatCard
            title={t("admin.confirmedBookings")}
            value={stats.booked}
            icon={<CheckCircle />}
            gradient="linear-gradient(135deg,#22c55e,#4ade80)"
          />
        </Link>
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
          <Link to="/admin/bookings/cancelled" style={{ textDecoration: "none" }}>
            <StatCard
            title={t("admin.cancelledBookings")}
            value={stats.cancelledBooking}
            icon={<Cancel />}
            gradient="linear-gradient(135deg,#ef4444,#f87171)"
          />
          </Link>
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
          <Link to="/admin/bookings/pending" style={{ textDecoration: "none" }}>
           <StatCard
            title={t("admin.pendingBookings")}
            value={
              stats.pendingDistrictApproval +
              stats.pendingBlockApproval
            }
            icon={<Pending />}
            gradient="linear-gradient(135deg,#f59e0b,#fbbf24)"
          />
          </Link>
        </Grid>

        <Grid item size={{ xs: 12, md: 4 }}>
        <Link to="/admin/bookings/rejected" style={{ textDecoration: "none" }}>
        <StatCard
            title={t("admin.rejectedBookings")}
            value={
              stats.blockRejected +
              stats.districtRejected
            }
            icon={<Cancel />}
            gradient="linear-gradient(135deg,#dc2626,#fb7185)"
          />
        </Link>
        </Grid>
      </Grid>

      {/* CHARTS */}
      <Grid container spacing={3}>
        {/* DISTRICT BAR CHART */}
        <Grid item xs={6} size={6}>
          <Card sx={{ p: 3 }}>
            <Typography mb={2} fontWeight="bold">
              {t("admin.districtWiseBooking")}
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#e64d00"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* CENTER PIE CHART */}
        <Grid item xs={6} size={6}>
          <Card sx={{ p: 3 }}>
            <Typography mb={2} fontWeight="bold">
            {t("admin.centerWiseBooking")}
            </Typography>

            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={centerData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={130}
                  innerRadius={60}   // 👈 makes it modern (donut chart)
                  paddingAngle={3}
                  label={({ percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                >
                  {centerData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
