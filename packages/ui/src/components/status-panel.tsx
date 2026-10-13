import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export function Notice({
  children,
  severity = "info",
}: {
  children: ReactNode;
  severity?: "error" | "info" | "success";
}) {
  return <Alert severity={severity}>{children}</Alert>;
}

export function StatusPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}
