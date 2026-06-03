import { Grid, Box, Typography, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

import api from "../api/api";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/LoadingSpinner";

import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

// ─── Tokens ──────────────────────────────────────────────────────────────────
const COLORS = {
  blue: "#3266ad",
  green: "#0F6E56",
  amber: "#BA7517",
  coral: "#D85A30",
  purple: "#534AB7",
  gray: "#73726c",
  blueBg: "#E6F1FB",
  greenBg: "#E1F5EE",
  amberBg: "#FAEEDA",
  coralBg: "#FAECE7",
  purpleBg: "#EEEDFE",
  greenText: "#3B6D11",
  greenTrendBg: "#EAF3DE",
};

const CHART_COLORS = {
  grid: "rgba(0,0,0,0.05)",
  text: "#888",
  brands: [COLORS.blue, COLORS.green, COLORS.coral, COLORS.amber, COLORS.gray],
};

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.75, mt: 3.5 }}>
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.2px",
          color: "text.disabled",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </Typography>
      <Box sx={{ flex: 1, height: "0.5px", bgcolor: "divider" }} />
    </Box>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, icon, subtitle, trend, accentColor, bgColor, iconColor }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        p: "18px 20px",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          bgcolor: accentColor,
          borderRadius: "2px 2px 0 0",
        },
      }}
    >
      {/* Icon badge */}
      <Box
        sx={{
          width: 36, height: 36,
          borderRadius: "8px",
          bgcolor: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1.75,
          "& svg": { fontSize: 20, color: iconColor || accentColor },
        }}
      >
        {icon}
      </Box>

      {/* Trend pill */}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: 10.5,
          fontWeight: 500,
          color: COLORS.greenText,
          bgcolor: COLORS.greenTrendBg,
          px: "7px",
          py: "2px",
          borderRadius: "20px",
          fontFamily: "monospace",
          mb: 0.75,
        }}
      >
        {trend}
      </Box>

      <Typography sx={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.8px", color: "text.disabled", fontWeight: 500, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.8px", lineHeight: 1, color: "text.primary" }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "text.disabled", mt: 0.5 }}>{subtitle}</Typography>
    </Box>
  );
}

// ─── Chart Card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, subtitle, badge, children, legendItems }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        p: "20px 22px",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.2px", color: "text.primary", mb: 0.4 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: "text.disabled", mb: badge ? 1.5 : 2.25 }}>
        {subtitle}
      </Typography>

      {badge && (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: 11,
            fontWeight: 500,
            color: COLORS.greenText,
            bgcolor: COLORS.greenTrendBg,
            px: "9px",
            py: "3px",
            borderRadius: "20px",
            fontFamily: "monospace",
            mb: 1.5,
          }}
        >
          {badge}
        </Box>
      )}

      {children}

      {legendItems && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", mt: 1.25 }}>
          {legendItems.map((item) => (
            <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.6, fontSize: 11, color: "text.secondary" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: item.color }} />
              {item.label}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── AI Insight Card ──────────────────────────────────────────────────────────
function AIInsightCard({ metrics, observations }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        p: "22px 24px",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 28, height: 28,
            bgcolor: COLORS.purpleBg,
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "& svg": { fontSize: 16, color: COLORS.purple },
          }}
        >
          <AutoAwesomeIcon />
        </Box>
        <Typography sx={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "text.disabled" }}>
          AI Insight
        </Typography>
      </Box>

      {/* Metric chips */}
      <Grid container spacing={1.5} mb={2.25} pb={2.25} sx={{ borderBottom: "0.5px solid", borderColor: "divider" }}>
        {metrics.map((m) => (
          <Grid item xs={6} sm={3} key={m.label}>
            <Box sx={{ bgcolor: "background.default", borderRadius: 2, p: "12px 14px" }}>
              <Typography sx={{ fontSize: 10.5, color: "text.disabled", textTransform: "uppercase", letterSpacing: "0.7px", fontWeight: 500, mb: 0.6 }}>
                {m.label}
              </Typography>
              <Typography sx={{ fontSize: 17, fontWeight: 600, color: "text.primary", letterSpacing: "-0.4px" }}>
                {m.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Observations */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9 }}>
        {observations.map((obs, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 16, color: COLORS.purple, mt: "2px", flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.7 }}>{obs}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── Chart configs ─────────────────────────────────────────────────────────────
const chartBaseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

function revenueChartData() {
  return {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [12000, 15000, 14000, 18000, 24000, 32000, 29000],
        borderColor: COLORS.blue,
        backgroundColor: "rgba(50,102,173,0.08)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: COLORS.blue,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };
}

function revenueChartOptions() {
  return {
    ...chartBaseOptions,
    scales: {
      x: {
        ticks: { color: CHART_COLORS.text, font: { size: 11 } },
        grid: { color: CHART_COLORS.grid },
        border: { dash: [4, 4] },
      },
      y: {
        ticks: {
          color: CHART_COLORS.text,
          font: { size: 11 },
          callback: (v) => "₹" + (v >= 1000 ? Math.round(v / 1000) + "k" : v),
        },
        grid: { color: CHART_COLORS.grid },
        border: { dash: [4, 4] },
      },
    },
  };
}

function brandChartData() {
  return {
    labels: ["COSRX", "Bare Anatomy", "Maybelline", "NY Bae", "Others"],
    datasets: [
      {
        data: [18, 15, 14, 12, 41],
        backgroundColor: CHART_COLORS.brands,
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 4,
      },
    ],
  };
}

function productChartData() {
  return {
    labels: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"],
    datasets: [
      {
        data: [11, 10, 5, 4, 2, 2, 2, 2, 2, 2],
        backgroundColor: [
          COLORS.blue, COLORS.blue,
          COLORS.green,
          COLORS.amber,
          COLORS.coral, COLORS.coral, COLORS.coral, COLORS.coral, COLORS.coral, COLORS.coral,
        ],
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };
}

function heatmapChartData() {
  return {
    labels: ["FOH", "Skincare"],
    datasets: [
      { label: "Low", data: [230, 180], backgroundColor: "#B5D4F4", borderRadius: 3 },
      { label: "Mid", data: [120, 90], backgroundColor: "#378ADD", borderRadius: 3 },
      { label: "High", data: [750, 30], backgroundColor: "#0C447C", borderRadius: 3 },
    ],
  };
}

function heatmapChartOptions() {
  return {
    ...chartBaseOptions,
    scales: {
      x: { ticks: { color: CHART_COLORS.text, font: { size: 12, weight: "500" } }, grid: { display: false } },
      y: { ticks: { color: CHART_COLORS.text, font: { size: 11 } }, grid: { color: CHART_COLORS.grid }, border: { dash: [4, 4] } },
    },
  };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get("/stores/STORE_BLR_002/metrics");
        setMetrics(response.data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error("Metrics Error:", err);
        setError("Unable to fetch latest metrics");
      }
    };

    fetchMetrics();

    const interval = setInterval(fetchMetrics, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

 if (!metrics && !error) {
  return <LoadingSpinner />;
}

  const aiMetrics = [
    { label: "Revenue", value: `₹${Number(metrics.revenue).toLocaleString("en-IN")}` },
    { label: "Conversion", value: `${metrics.conversion_rate}%` },
    { label: "Avg order", value: `₹${metrics.avg_order_value}` },
    { label: "Orders", value: metrics.purchases },
  ];

  const aiObservations = [
    "Top-performing brands — COSRX, Bare Anatomy, and Maybelline — continue to drive the majority of revenue this period.",
    "FOH billing zone activity remains the highest-traffic zone with strong high-density visit counts.",
    `Conversion is stable at ${metrics.conversion_rate}%, slightly above last week's benchmark.`,
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh", bgcolor: "background.default" }}>

      {/* ── HEADER ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3.5 }}>
        <PageHeader
          title="Store Intelligence Dashboard"
          subtitle={`Real-time AI powered retail analytics • Last updated ${lastUpdated.toLocaleTimeString("en-IN")}`}
        />
        <Chip
          label={`LIVE • ${lastUpdated.toLocaleTimeString("en-IN")}`}
          color="success"
          size="small"
          variant="outlined"
          sx={{ fontSize: 11, fontFamily: "monospace", mt: 0.5, borderRadius: "20px" }}
        />
      </Box>

      {error && (
        <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: "#FFF4E5", color: "#BA7517" }}>
          <Typography sx={{ fontSize: 12 }}>{error}</Typography>
        </Box>
      )}

      {/* ── KPI ROW ── */}
      <Grid container spacing={1.75} alignItems="stretch">
        <Grid item xs={6} sm={6} lg={3}>
          <KPICard
            title="Visitors"
            value={metrics.unique_visitors}
            icon={<PeopleIcon />}
            subtitle="Unique visitors"
            trend={
  metrics.unique_visitors > 50
    ? "↑ Active"
    : "→ Normal"
}
            accentColor={COLORS.blue}
            bgColor={COLORS.blueBg}
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <KPICard
            title="Revenue"
            value={`₹${Number(metrics.revenue).toLocaleString("en-IN")}`}
            icon={<CurrencyRupeeIcon />}
            subtitle="Total sales"
            trend={
  metrics.revenue > 30000
    ? "↑ Strong"
    : "→ Stable"
}
            accentColor={COLORS.green}
            bgColor={COLORS.greenBg}
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <KPICard
            title="Orders"
            value={metrics.purchases}
            icon={<ShoppingCartIcon />}
            subtitle="Completed orders"
            trend={
  metrics.purchases > 10
    ? "↑ Growing"
    : "→ Stable"
}
            accentColor={COLORS.amber}
            bgColor={COLORS.amberBg}
          />
        </Grid>
        <Grid item xs={6} sm={6} lg={3}>
          <KPICard
            title="Conversion Rate"
            value={`${metrics.conversion_rate}%`}
            icon={<TrendingUpIcon />}
            subtitle="Visitor → purchase"
            trend={
  metrics.conversion_rate > 25
    ? "↑ Healthy"
    : "↓ Low"
}
            accentColor={COLORS.coral}
            bgColor={COLORS.coralBg}
          />
        </Grid>
      </Grid>

      {/* ── REVENUE & BRANDS ── */}
      <SectionLabel>Revenue &amp; Brands</SectionLabel>
      <Grid container spacing={1.75} alignItems="stretch">
        <Grid item xs={12} lg={7}>
          <ChartCard title="Revenue trend" subtitle="Daily · this week · ₹" badge="↑ 14% vs last week">
            <Box sx={{ position: "relative", height: 210 }}>
              <Line data={revenueChartData()} options={revenueChartOptions()} />
            </Box>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <ChartCard
            title="Top brand revenue"
            subtitle="Share by brand · ₹"
            legendItems={[
              { label: "COSRX", color: COLORS.blue },
              { label: "Bare Anatomy", color: COLORS.green },
              { label: "Maybelline", color: COLORS.coral },
              { label: "NY Bae", color: COLORS.amber },
              { label: "Others", color: COLORS.gray },
            ]}
          >
            <Box sx={{ position: "relative", height: 180, maxWidth: 240, mx: "auto" }}>
              <Doughnut
                data={brandChartData()}
                options={{ ...chartBaseOptions, cutout: "70%" }}
              />
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ── PRODUCTS & ACTIVITY ── */}
      <SectionLabel>Products &amp; Activity</SectionLabel>
      <Grid container spacing={1.75} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <ChartCard title="Top products" subtitle="By units sold · current period">
            <Box sx={{ position: "relative", height: 230 }}>
              <Bar
                data={productChartData()}
                options={{
                  ...chartBaseOptions,
                  scales: {
                    x: { ticks: { color: CHART_COLORS.text, font: { size: 10 } }, grid: { display: false } },
                    y: { ticks: { color: CHART_COLORS.text, font: { size: 11 }, stepSize: 3 }, grid: { color: CHART_COLORS.grid }, border: { dash: [4, 4] } },
                  },
                }}
              />
            </Box>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard
            title="Zone heatmap"
            subtitle="Visit distribution by zone"
            legendItems={[
              { label: "Low", color: "#B5D4F4" },
              { label: "Mid", color: "#378ADD" },
              { label: "High", color: "#0C447C" },
            ]}
          >
            <Box sx={{ position: "relative", height: 200 }}>
              <Bar data={heatmapChartData()} options={heatmapChartOptions()} />
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ── AI INSIGHT ── */}
      <SectionLabel>AI Insight</SectionLabel>
      <AIInsightCard metrics={aiMetrics} observations={aiObservations} />

    </Box>
  );
}