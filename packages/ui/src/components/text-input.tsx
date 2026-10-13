import TextField from "@mui/material/TextField";

export function TextInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: "text" | "email";
  error?: string | undefined;
  autoComplete?: string | undefined;
}) {
  return (
    <TextField
      id={id}
      name={id}
      label={label}
      type={type}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      onBlur={onBlur}
      error={Boolean(error)}
      helperText={error ?? " "}
      autoComplete={autoComplete}
      fullWidth
      required
    />
  );
}
