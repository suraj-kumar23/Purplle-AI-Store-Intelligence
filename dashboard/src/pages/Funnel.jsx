import { Box, Typography, Chip } from "@mui/material";

import PageHeader from "../components/PageHeader";
import FunnelChart from "../charts/FunnelChart";

export default function Funnel() {

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
        <PageHeader
          title="Conversion Funnel"
          subtitle="Visitor Journey Analytics"
        />
        <Chip
          label="Live"
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontSize: 11, fontFamily: "monospace", mb: 0.5 }}
        />
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
          Journey Breakdown
        </Typography>
        <Box sx={{ flex: 1, height: "0.5px", bgcolor: "divider" }} />
      </Box>

      {/* CHART CARD */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          p: 2.5,
        }}
      >
        <FunnelChart />
      </Box>
    </Box>
  );
}