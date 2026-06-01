"use client";

import React from "react";

// ── Inline formatting ──────────────────────
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Pattern: **bold**, `code`, plain text
  const regex = /(\*\*(.+?)\*\*|`([^`]+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // Bold
      nodes.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      // Inline code
      nodes.push(<code key={match.index}>{match[3]}</code>);
    }
    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

// ── Table parser ───────────────────────────
function parseTable(lines: string[]): React.ReactElement {
  const rows = lines
    .filter((l) => !l.match(/^\|[\s\-:|]+\|$/)) // filter separator row
    .map((l) =>
      l
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean)
    );

  const header = rows[0] ?? [];
  const body = rows.slice(1);

  return (
    <table>
      <thead>
        <tr>
          {header.map((cell, j) => (
            <th key={j}>{renderInline(cell)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{renderInline(cell)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Main parser ────────────────────────────
function parseMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Code block ───────────────────────
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={key++}>
          <code data-lang={lang || undefined}>
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      continue;
    }

    // ── Table ────────────────────────────
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(
        <React.Fragment key={key++}>{parseTable(tableLines)}</React.Fragment>
      );
      continue;
    }

    // ── Headings ─────────────────────────
    if (line.startsWith("### ")) {
      elements.push(<h3 key={key++}>{renderInline(line.slice(4))}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={key++}>{renderInline(line.slice(3))}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(<h1 key={key++}>{renderInline(line.slice(2))}</h1>);
      i++;
      continue;
    }

    // ── Horizontal rule ──────────────────
    if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/)) {
      elements.push(<hr key={key++} />);
      i++;
      continue;
    }

    // ── Blockquote ───────────────────────
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key++}>
          <p>{renderInline(quoteLines.join(" "))}</p>
        </blockquote>
      );
      continue;
    }

    // ── Ordered list ─────────────────────
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={key++}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Unordered list ───────────────────
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Empty line (paragraph break) ─────
    if (line.trim() === "") {
      i++;
      continue;
    }

    // ── Paragraph ────────────────────────
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("# ") &&
      !lines[i].startsWith("## ") &&
      !lines[i].startsWith("### ") &&
      !lines[i].startsWith("> ") &&
      !lines[i].startsWith("- ") &&
      !lines[i].startsWith("|") &&
      !lines[i].startsWith("```") &&
      !lines[i].match(/^\d+\.\s/) &&
      !lines[i].match(/^-{3,}$/) &&
      !lines[i].match(/^\*{3,}$/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    
    // Safety fallback to prevent infinite loops
    if (paraLines.length === 0 && i < lines.length) {
      paraLines.push(lines[i]);
      i++;
    }

    elements.push(
      <p key={key++}>{renderInline(paraLines.join(" "))}</p>
    );
  }

  return elements;
}

// ── Component ──────────────────────────────
interface NoteContentProps {
  content: string;
}

export function NoteContent({ content }: NoteContentProps) {
  const elements = parseMarkdown(content);

  return <div className="prose-note">{elements}</div>;
}
