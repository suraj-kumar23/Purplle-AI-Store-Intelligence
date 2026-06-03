import { Grid } from "@mui/material";

export default function MetricGrid({ children }) {
  return (
    <Grid container spacing={2}>
      {children}
    </Grid>
  );
}