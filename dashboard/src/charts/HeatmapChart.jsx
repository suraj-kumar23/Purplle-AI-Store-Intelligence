import { useEffect, useState } from "react";

import api from "../api/api";

import { Card, CardContent, Typography, Box } from "@mui/material";

import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const getColor = (value, max) => {
  const intensity = max > 0 ? value / max : 0;
  if (intensity > 0.75) return "#185FA5";
  if (intensity > 0.5)  return "#378ADD";
  if (intensity > 0.25) return "#85B7EB";
  return "#B5D4F4";
};

const CustomTooltip = ({ active, payload, label }) => {
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
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 500, fontFamily: "monospace" }}>
          {payload[0].value} visits
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function HeatmapChart() {

  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/heatmap").then((res) => {
      const chartData = Object.entries(res.data).map(([zone, visits]) => ({
        zone,
        visits,
      }));
      setData(chartData);
    });
  }, []);

  const max = Math.max(...data.map((d) => d.visits), 1);

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
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: "text.primary", mb: 0.5 }}>
              Zone heatmap
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
              Visit distribution by zone
            </Typography>
          </Box>
          {/* Intensity legend */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: 10, color: "text.disabled" }}>Low</Typography>
            {["#B5D4F4", "#85B7EB", "#378ADD", "#185FA5"].map((c) => (
              <Box key={c} sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: c }} />
            ))}
            <Typography sx={{ fontSize: 10, color: "text.disabled" }}>High</Typography>
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="zone"
              tick={{ fontSize: 10, fill: "var(--mui-palette-text-disabled, #9e9e9e)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--mui-palette-text-disabled, #9e9e9e)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar dataKey="visits" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.visits, max)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}