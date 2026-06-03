import { Box, Typography, Chip } from "@mui/material";

import PageHeader from "../components/PageHeader";

import ProductChart from "../charts/ProductChart";
import BrandChart from "../charts/BrandChart";

export default function Products() {

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
          title="Product Analytics"
          subtitle="Top Products & Brands"
        />
        <Chip
          label="Live"
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontSize: 11, fontFamily: "monospace", mb: 0.5 }}
        />
      </Box>

      {/* SECTION LABEL — Products */}
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
          Top Products
        </Typography>
        <Box sx={{ flex: 1, height: "0.5px", bgcolor: "divider" }} />
      </Box>

      {/* PRODUCT CHART */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          p: 2.5,
          mb: 3,
        }}
      >
        <ProductChart />
      </Box>

      {/* SECTION LABEL — Brands */}
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
          Brand Performance
        </Typography>
        <Box sx={{ flex: 1, height: "0.5px", bgcolor: "divider" }} />
      </Box>

      {/* BRAND CHART */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          border: "0.5px solid",
          borderColor: "divider",
          p: 2.5,
        }}
      >
        <BrandChart />
      </Box>
    </Box>
  );
}