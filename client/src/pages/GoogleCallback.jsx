import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, AlertCircle } from "lucide-react";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Verifying credentials with Google...");
  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("No authorization code found in callback URL.");
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const authenticate = async () => {
      try {
        setStatus("Establishing secure session...");
        await loginWithGoogle(code);
      } catch (err) {
        console.error("Google Auth callback error:", err);
        setError(err.message || "Failed to authenticate with Google.");
      }
    };

    authenticate();
  }, [searchParams, loginWithGoogle]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center selection:bg-indigo-500 selection:text-white">
        <div className="max-w-md w-full rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 backdrop-blur-md">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">Authentication Failed</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate("/sign-in")}
            className="w-full inline-flex h-10 items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center selection:bg-indigo-500 selection:text-white">
      <div className="max-w-md w-full flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-zinc-200">{status}</h3>
        <p className="text-zinc-500 text-xs mt-2">Please do not close this window.</p>
      </div>
    </div>
  );
}
