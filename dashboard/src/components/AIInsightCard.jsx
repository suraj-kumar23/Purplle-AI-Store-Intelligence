import { Card, CardContent, Typography, Box } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function AIInsightCard({ insight }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "0.5px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          </Box>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.7px",
              color: "text.disabled",
            }}
          >
            AI Insight
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: 13,
            color: "text.primary",
            lineHeight: 1.8,
            whiteSpace: "pre-line",
            fontFamily: "inherit",
          }}
        >
          {insight}
        </Typography>
      </CardContent>
    </Card>
  );
}