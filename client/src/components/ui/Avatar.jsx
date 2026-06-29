export default function Avatar({ src, name, size = "md", online, className = "" }) {
  const sizes = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-12 w-12 text-sm", xl: "h-16 w-16 text-lg" };
  const dotSizes = { sm: "h-2 w-2", md: "h-2.5 w-2.5", lg: "h-3 w-3", xl: "h-3.5 w-3.5" };
  const s = sizes[size] || sizes.md;
  const d = dotSizes[size] || dotSizes.md;
  const initials = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name || "Avatar"} className={`${s} rounded-full border border-zinc-800 object-cover`} />
      ) : (
        <div className={`${s} rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white`}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute -bottom-0.5 -right-0.5 ${d} rounded-full border-2 border-zinc-950 ${online ? "bg-emerald-500" : "bg-zinc-600"}`} />
      )}
    </div>
  );
}
