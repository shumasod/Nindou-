import React from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  focus?: boolean;
}

export function FormField({
  label,
  value,
  onChange,
  onSubmit,
  placeholder = "",
  focus = false,
}: Props) {
  return (
    <Box>
      <Text color="cyan" bold>
        {label}:{" "}
      </Text>
      <TextInput
        value={value}
        onChange={onChange}
        {...(onSubmit ? { onSubmit } : {})}
        placeholder={placeholder}
        focus={focus}
      />
    </Box>
  );
}
