import { Card, CardContent, Typography, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function RevenueCard({ revenue }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
        minHeight: 130,
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 2,
              border: "0.5px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              "& svg": { fontSize: 16 },
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 16 }} />
          </Box>
          <Box display="flex" alignItems="center" gap={0.4}>
            <TrendingUpIcon sx={{ fontSize: 12, color: "success.main" }} />
            <Typography sx={{ fontSize: 11, color: "success.main", fontWeight: 500, fontFamily: "monospace" }}>
              +12%
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px", color: "text.disabled", mb: 0.5 }}>
          Revenue
        </Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 500, fontFamily: "monospace", color: "text.primary", lineHeight: 1, mb: 0.5 }}>
          ₹{revenue}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "success.main", fontWeight: 500 }}>
          Total Sales
        </Typography>
      </CardContent>
    </Card>
  );
}