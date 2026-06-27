import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md flex justify-center">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors duration-200",
              card: "bg-zinc-900 border border-zinc-800 text-zinc-100",
              headerTitle: "text-zinc-100",
              headerSubtitle: "text-zinc-400",
              socialButtonsBlockButton: 
                "bg-zinc-850 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 transition-colors duration-200",
              socialButtonsBlockButtonText: "text-zinc-100 font-medium",
              formFieldLabel: "text-zinc-300",
              formFieldInput: 
                "bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg",
              footerActionLink: "text-indigo-400 hover:text-indigo-300",
              identityPreviewText: "text-zinc-100",
              identityPreviewEditButtonIcon: "text-zinc-400 hover:text-zinc-100",
            },
          }}
        />
      </div>
    </div>
  );
}
