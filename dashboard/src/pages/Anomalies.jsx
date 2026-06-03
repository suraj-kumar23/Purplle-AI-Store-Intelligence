import { useEffect, useState } from "react";

import api from "../api/api";

import {
  Box,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";

import AlertCard from "../components/AlertCard";

export default function Anomalies() {

  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/anomalies")
      .then((res) => {
        setAnomalies(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <CircularProgress size={32} thickness={2} />
        <Typography
          sx={{
            fontSize: 12,
            color: "text.disabled",
            fontFamily: "monospace",
          }}
        >
          Scanning for anomalies…
        </Typography>
      </Box>
    );
  }

  const severityCounts = anomalies.reduce(
    (acc, item) => {
      const s = (item.severity || "").toLowerCase();
      if (s === "high") acc.high += 1;
      else if (s === "medium") acc.medium += 1;
      else acc.low += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "-0.3px",
              color: "text.primary",
              mb: 0.5,
            }}
          >
            Anomaly Center
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              fontWeight: 300,
            }}
          >
            AI-detected irregularities &amp; suggested actions
          </Typography>
        </Box>
        <Chip
          label={`${anomalies.length} detected`}
          size="small"
          variant="outlined"
          sx={{ fontSize: 11, fontFamily: "monospace", mb: 0.5 }}
        />
      </Box>

      {/* SEVERITY SUMMARY STRIP */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "0.5px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: "error.main",
            }}
          >
            High
          </Typography>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 500,
              fontFamily: "monospace",
              color: "text.primary",
              lineHeight: 1,
            }}
          >
            {severityCounts.high}
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "background.paper",
            border: "0.5px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: "warning.main",
            }}
          >
            Medium
          </Typography>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 500,
              fontFamily: "monospace",
              color: "text.primary",
              lineHeight: 1,
            }}
          >
            {severityCounts.medium}
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "background.paper",
            border: "0.5px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: "success.main",
            }}
          >
            Low
          </Typography>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 500,
              fontFamily: "monospace",
              color: "text.primary",
              lineHeight: 1,
            }}
          >
            {severityCounts.low}
          </Typography>
        </Box>
      </Box>

      {/* SECTION LABEL */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            color: "text.disabled",
            whiteSpace: "nowrap",
          }}
        >
          All Anomalies
        </Typography>
        <Box sx={{ flex: 1, height: "0.5px", bgcolor: "divider" }} />
      </Box>

      {/* EMPTY STATE */}
      {anomalies.length === 0 && (
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "0.5px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
            No anomalies detected
          </Typography>
          <Typography
            sx={{
              fontSize: 11,
              color: "text.disabled",
              fontFamily: "monospace",
            }}
          >
            All systems normal
          </Typography>
        </Box>
      )}

      {/* ALERT CARDS */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {anomalies.map((item, index) => (
          <AlertCard
            key={index}
            title={item.type}
            severity={item.severity}
            description={item.suggested_action}
          />
        ))}
      </Box>
    </Box>
  );
}