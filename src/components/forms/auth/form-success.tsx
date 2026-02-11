import { CheckCircle2 } from "lucide-react";

/**
 * Reusable form success message component.
 * Displays a success message in a styled box with an icon.
 */
interface FormSuccessProps {
  message?: string;
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-500">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
