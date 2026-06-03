import { useEffect, useState } from "react";
import api from "../api/api";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    active &&
    payload &&
    payload.length
  ) {
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
        <Typography
          sx={{
            fontSize: 11,
            color: "text.disabled",
            mb: 0.5,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "monospace",
          }}
        >
          ₹
          {Number(
            payload[0].value
          ).toLocaleString("en-IN")}
        </Typography>
      </Box>
    );
  }

  return null;
};

export default function RevenueChart() {

  const [data, setData] =
    useState([]);

  useEffect(() => {

    const fetchRevenue =
      async () => {

        try {

          const res =
            await api.get(
              "/stores/STORE_BLR_002/metrics"
            );

          const revenue =
            Number(
              res.data.revenue
            );

          const timestamp =
            new Date()
              .toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }
              );

          setData(
            (prev) => {

              const updated = [

                ...prev,

                {
                  time: timestamp,
                  revenue,
                },

              ];

              return updated.slice(
                -10
              );
            }
          );

        } catch (err) {

          console.error(
            "Revenue API Error:",
            err
          );
        }
      };

    fetchRevenue();

    const interval =
      setInterval(
        fetchRevenue,
        5000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        bgcolor:
          "background.paper",
        height: "100%",
      }}
    >
      <CardContent
        sx={{ p: 2.5 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2.5}
        >
          <Box>

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 500,
                color:
                  "text.primary",
                mb: 0.5,
              }}
            >
              Revenue Trend
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color:
                  "text.disabled",
              }}
            >
              Live Revenue
              Snapshots
            </Typography>

          </Box>

          <Chip
            label="LIVE"
            size="small"
            color="success"
            variant="outlined"
            sx={{
              fontSize: 10,
              fontFamily:
                "monospace",
              height: 22,
            }}
          />

        </Box>

        <ResponsiveContainer
          width="100%"
          height={260}
        >

          <LineChart
            data={data}
          >

            <CartesianGrid
              strokeDasharray="2 4"
              stroke="rgba(0,0,0,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={
                (v) =>
                  `₹${Math.round(
                    v / 1000
                  )}k`
              }
            />

            <Tooltip
              content={
                <CustomTooltip />
              }
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#378ADD"
              strokeWidth={2}
              dot={{
                r: 3,
                fill:
                  "#378ADD",
              }}
              activeDot={{
                r: 5,
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
}