import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export function SelectInput({
  id,
  label,
  value,
  options,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  error?: string | undefined;
}) {
  return (
    <TextField
      id={id}
      name={id}
      select
      label={label}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      error={Boolean(error)}
      helperText={error ?? " "}
      fullWidth
      required
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
