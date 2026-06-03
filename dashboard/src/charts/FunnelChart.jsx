import { useEffect, useState } from "react";

import api from "../api/api";

import { Card, CardContent, Typography, Box } from "@mui/material";

import { FunnelChart, Funnel, Tooltip, LabelList } from "recharts";

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
          {payload[0].payload.name}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 500, fontFamily: "monospace" }}>
          {Number(payload[0].value).toLocaleString()}
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function StoreFunnelChart() {

  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/funnel").then((res) => {
      setData([
        { name: "Entry",       value: res.data.entry_count,    fill: "#378ADD" },
        { name: "Zone Visits", value: res.data.zone_visits,    fill: "#1D9E75" },
        { name: "Billing",     value: res.data.billing_visits, fill: "#EF9F27" },
      ]);
    });
  }, []);

  const total = data[0]?.value || 1;

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
            Conversion funnel
          </Typography>
          <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
            Visitor journey · entry → billing
          </Typography>
        </Box>

        {/* Summary strip */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            mb: 2.5,
          }}
        >
          {data.map((step) => (
            <Box
              key={step.name}
              sx={{
                bgcolor: "background.default",
                borderRadius: 2,
                border: "0.5px solid",
                borderColor: "divider",
                p: 1.25,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: step.fill }} />
                <Typography sx={{ fontSize: 10, color: "text.disabled", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>
                  {step.name}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 18, fontWeight: 500, fontFamily: "monospace", color: "text.primary", lineHeight: 1 }}>
                {Number(step.value || 0).toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: 10, color: "text.disabled", mt: 0.25 }}>
                {total > 0 ? Math.round(((step.value || 0) / total) * 100) : 0}% of entry
              </Typography>
            </Box>
          ))}
        </Box>

        <Box display="flex" justifyContent="center">
          <FunnelChart width={420} height={220}>
            <Tooltip content={<CustomTooltip />} />
            <Funnel
              dataKey="value"
              data={data}
              isAnimationActive
            >
              <LabelList
                position="center"
                dataKey="name"
                style={{ fontSize: 11, fill: "#fff", fontWeight: 500 }}
              />
            </Funnel>
          </FunnelChart>
        </Box>
      </CardContent>
    </Card>
  );
}