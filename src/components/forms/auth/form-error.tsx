import { AlertCircle } from "lucide-react";

/**
 * Reusable form error message component.
 * Displays an error in a styled box with an icon.
 */
interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
