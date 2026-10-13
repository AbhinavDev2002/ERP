import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import type { ReactNode } from "react";

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <Container maxWidth="sm">
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          py: { xs: 3, sm: 6 },
        }}
      >
        {children}
      </Box>
    </Container>
  );
}
