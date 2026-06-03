import { CircularProgress, Box, Typography } from "@mui/material";

export default function LoadingSpinner() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      gap={2}
    >
      <CircularProgress size={32} thickness={2} />
      <Typography
        sx={{ fontSize: 12, color: "text.disabled", fontFamily: "monospace" }}
      >
        Loading…
      </Typography>
    </Box>
  );
}