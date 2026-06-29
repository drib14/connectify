import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ message = "Loading...", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}
