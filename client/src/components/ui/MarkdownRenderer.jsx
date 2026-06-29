import React from "react";

/**
 * A custom, lightweight, premium Markdown parser and renderer.
 * Formats lists, headers, bold/italic, code blocks, and markdown tables with a gorgeous dark study theme.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Split by code blocks first
  const parts = content.split("```");
  
  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        // If index is odd, it is a code block
        if (index % 2 === 1) {
          const lines = part.split("\n");
          let language = lines[0].trim();
          let code = lines.slice(1).join("\n");
          if (!code && language) {
            code = language;
            language = "";
          }
          return (
            <div key={index} className="my-4 rounded-xl border border-zinc-800/80 bg-zinc-950 overflow-hidden font-mono shadow-xl animate-fade-in">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-900/40 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <span>{language || "code"}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code.trim())}
                  className="cursor-pointer hover:text-zinc-300 transition-colors text-[9px] bg-zinc-900 hover:bg-zinc-850 px-2 py-0.5 rounded border border-zinc-855"
                >
                  Copy Code
                </button>
              </div>
              <pre className="p-4 text-xs text-indigo-300 overflow-x-auto whitespace-pre leading-relaxed select-text">{code.trim()}</pre>
            </div>
          );
        }

        // Otherwise parse normal blocks
        const blocks = part.split("\n\n");
        return blocks.map((block, bIdx) => {
          const trimmed = block.trim();
          if (!trimmed) return null;

          // 1. Check if it's a table
          if (trimmed.startsWith("|") && trimmed.includes("\n|")) {
            const rows = trimmed.split("\n").map(r => r.trim()).filter(Boolean);
            if (rows.length >= 2) {
              const headers = rows[0]
                .split("|")
                .map(h => h.trim())
                .filter((_, i, arr) => i > 0 && i < arr.length - 1);
              
              const bodyRows = rows.slice(2).map(row => {
                return row
                  .split("|")
                  .map(c => c.trim())
                  .filter((_, i, arr) => i > 0 && i < arr.length - 1);
              });

              return (
                <div key={`${index}-${bIdx}`} className="my-4 overflow-x-auto border border-zinc-900 rounded-xl bg-zinc-950/40 shadow-2xl">
                  <table className="min-w-full divide-y divide-zinc-900 text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/60">
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-4 py-3 text-[11px] font-extrabold text-indigo-200 uppercase tracking-wider border-b border-zinc-900">
                            {renderInline(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                      {bodyRows.map((r, rIdx) => (
                        <tr key={rIdx} className="hover:bg-zinc-900/20 odd:bg-zinc-900/5 transition-colors">
                          {r.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-2.5 text-xs text-zinc-355 border-t border-zinc-900/40 leading-relaxed">
                              {renderInline(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
          }

          // 2. Check headers
          if (trimmed.startsWith("### ")) {
            return <h3 key={`${index}-${bIdx}`} className="text-sm font-bold text-indigo-300 mt-4 mb-2">{renderInline(trimmed.substring(4))}</h3>;
          }
          if (trimmed.startsWith("## ")) {
            return <h2 key={`${index}-${bIdx}`} className="text-base font-bold text-zinc-150 mt-5 mb-2.5 border-b border-zinc-900/50 pb-1">{renderInline(trimmed.substring(3))}</h2>;
          }
          if (trimmed.startsWith("# ")) {
            return <h1 key={`${index}-${bIdx}`} className="text-lg font-extrabold text-zinc-100 mt-6 mb-3">{renderInline(trimmed.substring(2))}</h1>;
          }

          // 3. Check lists
          if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
            const listItems = trimmed.split("\n").map(li => li.trim()).filter(Boolean);
            const isNumbered = /^\d+\.\s/.test(listItems[0]);

            const parsedItems = listItems.map((item, itemIdx) => {
              const cleanedItem = isNumbered
                ? item.replace(/^\d+\.\s+/, "")
                : item.replace(/^[-•*]\s+/, "");
              return (
                <li key={itemIdx} className="text-xs text-zinc-300 leading-relaxed my-1">
                  {renderInline(cleanedItem)}
                </li>
              );
            });

            return isNumbered ? (
              <ol key={`${index}-${bIdx}`} className="list-decimal space-y-1.5 my-3 pl-5 text-indigo-400">{parsedItems}</ol>
            ) : (
              <ul key={`${index}-${bIdx}`} className="list-disc space-y-1.5 my-3 pl-5 text-indigo-400">{parsedItems}</ul>
            );
          }

          // 4. Default paragraph
          return <p key={`${index}-${bIdx}`} className="text-sm text-zinc-250 leading-relaxed my-2">{renderInline(trimmed)}</p>;
        });
      })}
    </div>
  );
}

// Render inline Markdown tags (Bold, Italic, Inline Code backticks)
function renderInline(text) {
  if (!text) return "";

  // Split by inline code badges (wrapped in backticks `code`)
  const parts = text.split("`");
  
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return (
        <code key={idx} className="bg-zinc-950 border border-zinc-900 text-indigo-400 font-mono text-[10px] px-1.5 py-0.5 rounded shadow-sm select-all">
          {part}
        </code>
      );
    }
    return parseFormattedText(part);
  });
}

function parseFormattedText(text) {
  if (!text) return "";
  
  // Split by ** to find bold tokens
  const boldParts = text.split("**");
  return boldParts.map((bPart, bIdx) => {
    const isBold = bIdx % 2 === 1;
    
    // Split by * to find italic tokens
    const italicParts = bPart.split("*");
    const formattedItalic = italicParts.map((iPart, iIdx) => {
      const isItalic = iIdx % 2 === 1;
      if (isItalic) {
        return <em key={iIdx} className="italic text-zinc-350">{iPart}</em>;
      }
      return iPart;
    });

    if (isBold) {
      return <strong key={bIdx} className="font-bold text-indigo-200">{formattedItalic}</strong>;
    }
    return <span key={bIdx}>{formattedItalic}</span>;
  });
}
