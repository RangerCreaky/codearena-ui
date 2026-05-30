"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const CODE_LINES = [
  { text: "from codearena import Arena, Fighter", delay: 40 },
  { text: "", delay: 200 },
  { text: 'arena = Arena(mode="1v1")', delay: 45 },
  { text: 'fighter = Fighter(lang="python")', delay: 45 },
  { text: "", delay: 200 },
  { text: '@arena.challenge("binary-search")', delay: 40 },
  { text: "def solve(nums, target):", delay: 50 },
  { text: "    lo, hi = 0, len(nums) - 1", delay: 40 },
  { text: "    while lo <= hi:", delay: 45 },
  { text: "        mid = (lo + hi) // 2", delay: 40 },
  { text: "        if nums[mid] == target:", delay: 40 },
  { text: "            return mid", delay: 45 },
  { text: "        elif nums[mid] < target:", delay: 40 },
  { text: "            lo = mid + 1", delay: 40 },
  { text: "        else:", delay: 50 },
  { text: "            hi = mid - 1", delay: 40 },
  { text: "    return -1", delay: 45 },
  { text: "", delay: 200 },
  { text: "arena.submit(solve)  # ✓ Accepted!", delay: 35 },
];

type TokenType = "keyword" | "function" | "string" | "comment" | "decorator" | "number" | "operator" | "default";

function tokenize(line: string): Array<{ text: string; type: TokenType }> {
  const tokens: Array<{ text: string; type: TokenType }> = [];
  const keywords = ["from", "import", "def", "return", "while", "if", "elif", "else"];
  const builtins = ["len"];

  // Handle comments
  const commentIdx = line.indexOf("#");
  const codePart = commentIdx >= 0 ? line.substring(0, commentIdx) : line;
  const commentPart = commentIdx >= 0 ? line.substring(commentIdx) : "";

  // Handle leading whitespace
  const leadingSpaces = codePart.match(/^(\s*)/)?.[1] || "";
  if (leadingSpaces) tokens.push({ text: leadingSpaces, type: "default" });

  const trimmed = codePart.trimStart();
  const words = trimmed.split(/(\s+|[(),:=@"<>[\]]+)/);

  for (const word of words) {
    if (!word) continue;
    if (keywords.includes(word)) {
      tokens.push({ text: word, type: "keyword" });
    } else if (builtins.includes(word)) {
      tokens.push({ text: word, type: "function" });
    } else if (word.startsWith("@")) {
      tokens.push({ text: word, type: "decorator" });
    } else if (word.startsWith('"') || word.endsWith('"')) {
      tokens.push({ text: word, type: "string" });
    } else if (/^\d+$/.test(word)) {
      tokens.push({ text: word, type: "number" });
    } else if (/^[(),:=<>[\]]+$/.test(word)) {
      tokens.push({ text: word, type: "operator" });
    } else if (
      word === "Arena" || word === "Fighter" || word === "solve" ||
      word === "arena" || word === "fighter"
    ) {
      tokens.push({ text: word, type: "function" });
    } else {
      tokens.push({ text: word, type: "default" });
    }
  }

  if (commentPart) {
    tokens.push({ text: commentPart, type: "comment" });
  }

  return tokens;
}

const colorMap: Record<TokenType, string> = {
  keyword: "text-[oklch(0.7_0.15_280)]",
  function: "text-[oklch(0.78_0.15_80)]",
  string: "text-[oklch(0.72_0.17_155)]",
  comment: "text-[oklch(0.55_0.05_155)]",
  decorator: "text-[oklch(0.78_0.15_80)]",
  number: "text-[oklch(0.78_0.14_55)]",
  operator: "text-muted-foreground",
  default: "text-foreground",
};

export function AnimatedTerminal() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedLines, currentChar]);

  // Reset function
  const resetTerminal = useCallback(() => {
    setDisplayedLines([]);
    setCurrentLine(0);
    setCurrentChar(0);
    setIsTyping(true);
  }, []);

  // Typing effect
  useEffect(() => {
    if (!isTyping || currentLine >= CODE_LINES.length) {
      if (currentLine >= CODE_LINES.length) {
        setIsTyping(false);
        const timeout = setTimeout(resetTerminal, 5000);
        return () => clearTimeout(timeout);
      }
      return;
    }

    const line = CODE_LINES[currentLine];

    if (line.text === "") {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => [...prev, ""]);
        setCurrentLine((prev) => prev + 1);
        setCurrentChar(0);
      }, line.delay);
      return () => clearTimeout(timeout);
    }

    if (currentChar < line.text.length) {
      const timeout = setTimeout(() => {
        setCurrentChar((prev) => prev + 1);
      }, line.delay + Math.random() * 20);
      return () => clearTimeout(timeout);
    }

    // Line complete
    const timeout = setTimeout(() => {
      setDisplayedLines((prev) => [...prev, line.text]);
      setCurrentLine((prev) => prev + 1);
      setCurrentChar(0);
    }, 100);
    return () => clearTimeout(timeout);
  }, [isTyping, currentLine, currentChar, resetTerminal]);

  const currentLineText =
    currentLine < CODE_LINES.length
      ? CODE_LINES[currentLine].text.substring(0, currentChar)
      : "";

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[oklch(0.15_0.01_260)] rounded-t-xl border border-b-0 border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.2_25)]" />
          <div className="w-3 h-3 rounded-full bg-[oklch(0.8_0.15_85)]" />
          <div className="w-3 h-3 rounded-full bg-[oklch(0.72_0.19_145)]" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">
          arena.py
        </span>
      </div>

      {/* Terminal body */}
      <div
        ref={terminalRef}
        className="bg-[oklch(0.12_0.01_260)] rounded-b-xl border border-t-0 border-white/[0.06] p-4 font-mono text-sm leading-6 h-[340px] overflow-y-auto"
      >
        {displayedLines.map((line, i) => (
          <div key={i} className="flex">
            <span className="text-muted-foreground/40 select-none w-8 text-right mr-3 text-xs leading-6">
              {i + 1}
            </span>
            <span>
              {line === "" ? (
                <br />
              ) : (
                tokenize(line).map((token, j) => (
                  <span key={j} className={colorMap[token.type]}>
                    {token.text}
                  </span>
                ))
              )}
            </span>
          </div>
        ))}

        {/* Current typing line */}
        {isTyping && currentLine < CODE_LINES.length && (
          <div className="flex">
            <span className="text-muted-foreground/40 select-none w-8 text-right mr-3 text-xs leading-6">
              {displayedLines.length + 1}
            </span>
            <span>
              {tokenize(currentLineText).map((token, j) => (
                <span key={j} className={colorMap[token.type]}>
                  {token.text}
                </span>
              ))}
              <span
                className={`inline-block w-[2px] h-4 bg-primary align-middle ml-px transition-opacity ${
                  showCursor ? "opacity-100" : "opacity-0"
                }`}
              />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
