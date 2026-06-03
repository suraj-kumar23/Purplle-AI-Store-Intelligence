import { useEffect, useState } from "react";

import api from "../api/api";

import {
  Card, CardContent, Typography,
  CircularProgress, Box,
} from "@mui/material";

import {
  PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = [
  "#378ADD", "#1D9E75", "#EF9F27",
  "#D85A30", "#534AB7", "#D4537E",
  "#639922", "#BA7517", "#0F6E56", "#6366F1",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "0.5px solid",
          borderColor: "divider",
          borderRadius: 2,
          px: 1.5,
          py: 1,
        }}
      >
        <Typography sx={{ fontSize: 11, color: "text.disabled", mb: 0.5 }}>
          {payload[0].name}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 500, fontFamily: "monospace" }}>
          ₹{Number(payload[0].value).toLocaleString()}
        </Typography>
      </Box>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1, justifyContent: "center" }}>
    {payload.map((entry, i) => (
      <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: entry.color, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{entry.value}</Typography>
      </Box>
    ))}
  </Box>
);

export default function BrandChart() {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/brands")
      .then((res) => {
        const chartData = Object.entries(res.data).map(([brand, revenue]) => ({
          brand,
          revenue,
        }));
        setData(chartData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Brand API Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          height: 400,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height={340}>
            <CircularProgress size={28} thickness={2} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box mb={2.5}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: "text.primary", mb: 0.5 }}>
            Top brand revenue
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
            Share by brand · ₹
          </Typography>
        </Box>

        <ResponsiveContainer width="100%" height={310}>
          <PieChart>
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="brand"
              outerRadius={100}
              innerRadius={50}
              paddingAngle={2}
              label={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}