import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import Logo from "../components/Logo";
import { Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" or "reset"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  // Focus the first code input when entering the reset step
  useEffect(() => {
    if (step === "reset" && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code.");
      }

      setMessage("We have sent a 6-digit verification code to your email.");
      setStep("reset");
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (value && !/^\d$/.test(value)) {
      return; // Only allow numbers
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // If current value is empty and backspace is pressed, clear previous and focus it
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1].focus();
      } else if (code[index]) {
        // If current value exists, clear it
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setCode(digits);
      inputRefs.current[5].focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          code: verificationCode,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setMessage("Password successfully reset! Redirecting to Sign In...");
      setTimeout(() => {
        navigate("/sign-in");
      }, 3000);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 backdrop-blur-md shadow-2xl">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity">
            <Logo className="h-8 w-8" gradientId="logo-grad-forgot" />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Connectify
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-zinc-100">
            {step === "email" ? "Reset Password" : "Enter Verification Code"}
          </h2>
          <p className="text-zinc-400 text-sm mt-1.5">
            {step === "email"
              ? "We will send you a 6-digit code to reset your password"
              : `Verification code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3.5 text-sm text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && !error && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-sm text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={loading}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors duration-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5 text-center">
                6-Digit Verification Code
              </label>
              
              {/* 6-Digit Box Layout */}
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {code.map((num, idx) => (
                  <input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={num}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    disabled={loading}
                    className="w-12 h-12 text-center text-xl font-bold bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
                    required
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors duration-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setError(null);
                setMessage(null);
                setCode(["", "", "", "", "", ""]);
              }}
              disabled={loading}
              className="w-full flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 font-semibold transition-all hover:text-zinc-200 active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Email
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-900 text-center">
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
