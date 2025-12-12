import { Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

interface DateTimeCellProps {
  date?: string;
  time?: string;
}

export function DateTimeCell({ date, time }: DateTimeCellProps) {
  if (!date || !time) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Text fontSize="md" color="fg.default">
        {date}
      </Text>
      <Text fontSize="sm" color="fg.tertiary">
        {time}
      </Text>
    </Box>
  );
}