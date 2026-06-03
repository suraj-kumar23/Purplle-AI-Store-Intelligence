import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import ReportIcon from "@mui/icons-material/Report";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

export default function AlertCard({ title, severity, description }) {
  const isHigh = severity === "HIGH";
  const isMed = severity === "MEDIUM";

  const severityColor = isHigh ? "error" : isMed ? "warning" : "success";

  const SeverityIcon = isHigh ? ReportIcon : isMed ? WarningIcon : InfoIcon;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "0.5px solid",
        borderColor: isHigh
          ? "error.light"
          : isMed
          ? "warning.light"
          : "divider",
        bgcolor: "background.paper",
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <SeverityIcon
              sx={{ fontSize: 18, color: `${severityColor}.main` }}
            />
            <Typography
              sx={{ fontSize: 14, fontWeight: 500, color: "text.primary" }}
            >
              {title}
            </Typography>
          </Box>
          <Chip
            label={severity}
            color={severityColor}
            size="small"
            variant="outlined"
            sx={{ fontSize: 10, fontFamily: "monospace", height: 22 }}
          />
        </Box>
        <Typography
          sx={{
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.7,
            pl: "26px",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}