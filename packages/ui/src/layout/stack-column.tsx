import Stack from "@mui/material/Stack";
import type { ReactNode } from "react";

export function StackColumn({ children }: { children: ReactNode }) {
  return (
    <Stack component="div" spacing={2}>
      {children}
    </Stack>
  );
}

export function Cluster({ children }: { children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
      {children}
    </Stack>
  );
}
