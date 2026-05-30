"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";

const LEFT_CODE = `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int comp = target - nums[i];
        if (seen.count(comp)) {
            return {seen[comp], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> arr = {2, 7, 11, 15};
    auto result = twoSum(arr, 9);
    cout << result[0] << ", " << result[1];
    return 0;
}`;

const RIGHT_CODE = `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0];
    int currSum = nums[0];
    for (int i = 1; i < nums.size(); i++) {
        currSum = max(nums[i], currSum + nums[i]);
        maxSum = max(maxSum, currSum);
    }
    return maxSum;
}

int main() {
    vector<int> arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    cout << "Max sum: " << maxSubArray(arr);
    return 0;
}`;

// Tokenize a line into colored spans (React elements, not HTML strings)
function tokenizeCpp(line: string, lineIdx: number) {
  const tokens: { text: string; color: string }[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    let matched = false;

    // Comments
    const commentMatch = remaining.match(/^(\/\/.*)/);
    if (commentMatch) {
      tokens.push({ text: commentMatch[1], color: "rgba(255,255,255,0.2)" });
      remaining = remaining.slice(commentMatch[1].length);
      matched = true;
      continue;
    }

    // Preprocessor directives
    const preprocMatch = remaining.match(/^(#include|#define|#pragma)/);
    if (preprocMatch) {
      tokens.push({ text: preprocMatch[1], color: "#c792ea" });
      remaining = remaining.slice(preprocMatch[1].length);
      matched = true;
      continue;
    }

    // Angle bracket includes
    const angleMatch = remaining.match(/^(<[a-zA-Z_]+>)/);
    if (angleMatch) {
      tokens.push({ text: angleMatch[1], color: "#c3e88d" });
      remaining = remaining.slice(angleMatch[1].length);
      matched = true;
      continue;
    }

    // String literals
    const strMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/);
    if (strMatch) {
      tokens.push({ text: strMatch[1], color: "#c3e88d" });
      remaining = remaining.slice(strMatch[1].length);
      matched = true;
      continue;
    }

    // Keywords
    const kwMatch = remaining.match(/^(using|namespace|return|for|if|int|auto|void|bool|char|double|float|long|struct|class|const|static|template|typename)\b/);
    if (kwMatch) {
      tokens.push({ text: kwMatch[1], color: "#c792ea" });
      remaining = remaining.slice(kwMatch[1].length);
      matched = true;
      continue;
    }

    // STL types/functions
    const stlMatch = remaining.match(/^(vector|unordered_map|map|set|string|pair|cout|cin|endl|max|min|count|size|sort|begin|end)\b/);
    if (stlMatch) {
      tokens.push({ text: stlMatch[1], color: "#82aaff" });
      remaining = remaining.slice(stlMatch[1].length);
      matched = true;
      continue;
    }

    // Namespace
    const nsMatch = remaining.match(/^(std)\b/);
    if (nsMatch) {
      tokens.push({ text: nsMatch[1], color: "#ffcb6b" });
      remaining = remaining.slice(nsMatch[1].length);
      matched = true;
      continue;
    }

    // Numbers
    const numMatch = remaining.match(/^(\d+)/);
    if (numMatch) {
      tokens.push({ text: numMatch[1], color: "#f78c6c" });
      remaining = remaining.slice(numMatch[1].length);
      matched = true;
      continue;
    }

    // Function names (word followed by open paren)
    const funcMatch = remaining.match(/^([a-zA-Z_]\w*)(\s*\()/);
    if (funcMatch) {
      tokens.push({ text: funcMatch[1], color: "#82aaff" });
      tokens.push({ text: funcMatch[2], color: "inherit" });
      remaining = remaining.slice(funcMatch[0].length);
      matched = true;
      continue;
    }

    if (!matched) {
      // Plain character
      tokens.push({ text: remaining[0], color: "inherit" });
      remaining = remaining.slice(1);
    }
  }

  return tokens.map((t, i) => (
    <span key={`${lineIdx}-${i}`} style={t.color !== "inherit" ? { color: t.color } : undefined}>
      {t.text}
    </span>
  ));
}

function CodeEditor({
  code,
  language,
  label,
  delay = 0,
}: {
  code: string;
  language: string;
  label: string;
  delay?: number;
}) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  const resetAnimation = useCallback(() => {
    setDisplayedChars(0);
    setStarted(false);
    setTimeout(() => setStarted(true), 1500);
  }, []);

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      setDisplayedChars((prev) => {
        if (prev >= code.length) {
          clearInterval(interval);
          setTimeout(resetAnimation, 2500);
          return prev;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [started, code.length, resetAnimation]);

  const visibleCode = code.slice(0, displayedChars);
  const lines = visibleCode.split("\n");

  return (
    <motion.div
      className="flex-1 min-w-0 max-w-[540px] rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a]/90 shadow-2xl shadow-black/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay / 1000 }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111111]/90 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] font-mono text-white/30 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[11px] font-mono text-white/20">{language}</span>
      </div>

      {/* Code area — FIXED HEIGHT, no growth */}
      <div className="p-5 h-[440px] overflow-hidden">
        <pre className="text-[13px] sm:text-[14px] leading-[1.75] font-mono opacity-40">
          {lines.map((line, i) => (
            <div key={i} className="flex whitespace-pre">
              <span className="w-7 shrink-0 text-right mr-4 text-white/15 select-none text-[12px]">
                {i + 1}
              </span>
              <code className="text-white">
                {tokenizeCpp(line, i)}
                {i === lines.length - 1 && displayedChars < code.length && (
                  <span className="inline-block w-[2px] h-[15px] bg-[#e9ab2b] ml-[1px] animate-pulse align-middle" />
                )}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </motion.div>
  );
}

export function CodeBattle() {
  return (
    <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-16 w-full px-2">
      <CodeEditor
        code={LEFT_CODE}
        language="C++"
        label="Player 1"
        delay={200}
      />
      <CodeEditor
        code={RIGHT_CODE}
        language="C++"
        label="Player 2"
        delay={600}
      />
    </div>
  );
}
