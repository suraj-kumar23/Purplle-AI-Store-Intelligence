import { useEffect, useState } from "react";

import api from "../api/api";

import { Card, CardContent, Typography, Box } from "@mui/material";

import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Cell,
} from "recharts";

const COLORS = [
  "#378ADD", "#378ADD", "#1D9E75",
  "#1D9E75", "#EF9F27", "#EF9F27",
];

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
          {payload[0].value} units
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function ProductChart() {

  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/products").then((res) => {
      const chartData = Object.entries(res.data).map(([product, qty]) => ({
        product,
        qty,
      }));
      setData(chartData);
    });
  }, []);

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
            Top products
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
            By units sold · current period
          </Typography>
        </Box>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="product"
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
            <Bar dataKey="qty" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}