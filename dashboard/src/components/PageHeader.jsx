import { Typography, Box } from "@mui/material";

export default function PageHeader({ title, subtitle }) {
  return (
    <Box mb={0}>
      <Typography
        sx={{
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: "-0.3px",
          color: "text.primary",
          mb: 0.5,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{ fontSize: 13, color: "text.secondary", fontWeight: 300 }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}