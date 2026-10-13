import Button from "@mui/material/Button";
import type { ReactNode } from "react";

export function ActionButton({
  children,
  type = "button",
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      type={type}
      variant="contained"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function LinkAction({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button component="a" href={href} variant="text">
      {children}
    </Button>
  );
}
