import React from 'react';

function parseInline(text: string): React.ReactNode[] {
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            elements.push(text.substring(lastIndex, match.index));
        }

        const fullMatch = match[0];
        if (fullMatch.startsWith('[')) {
            const linkText = match[2];
            const href = match[3];
            elements.push(
                <a
                    key={`link-${match.index}`}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="font-medium text-emerald-600 underline underline-offset-2 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                    {linkText}
                </a>
            );
        } else if (fullMatch.startsWith('**')) {
            const boldText = match[4];
            elements.push(
                <strong key={`bold-${match.index}`} className="font-semibold text-slate-900 dark:text-white">
                    {parseInline(boldText)}
                </strong>
            );
        } else if (fullMatch.startsWith('*')) {
            const italicText = match[5];
            elements.push(
                <em key={`italic-${match.index}`} className="italic">
                    {parseInline(italicText)}
                </em>
            );
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
    }

    return elements.length > 0 ? elements : [text];
}

export function MarkdownRenderer({
    content,
    className = '',
}: {
    content: string;
    className?: string;
}) {
    if (!content) return null;

    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const elements: React.ReactNode[] = [];
    let currentListItems: string[] = [];
    let currentParagraphLines: string[] = [];

    function flushList() {
        if (currentListItems.length > 0) {
            const items = [...currentListItems];
            currentListItems = [];
            elements.push(
                <ul
                    key={`ul-${elements.length}`}
                    className="my-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300"
                >
                    {items.map((item, idx) => (
                        <li key={`li-${idx}`} className="leading-relaxed">
                            {parseInline(item)}
                        </li>
                    ))}
                </ul>
            );
        }
    }

    function flushParagraph() {
        if (currentParagraphLines.length > 0) {
            const text = currentParagraphLines.join(' ');
            currentParagraphLines = [];
            elements.push(
                <p
                    key={`p-${elements.length}`}
                    className="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                >
                    {parseInline(text)}
                </p>
            );
        }
    }

    function flushAll() {
        flushParagraph();
        flushList();
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
            flushAll();
            continue;
        }

        // Skip document top-level title
        if (line.startsWith('# ') && !line.startsWith('## ')) {
            flushAll();
            continue;
        }

        // Skip raw "Last Updated:" line (handled by page header)
        if (/^Last Updated:\s*.+$/i.test(line)) {
            flushAll();
            continue;
        }

        // Section Heading (## )
        if (line.startsWith('## ')) {
            flushAll();
            const headingText = line.replace(/^##\s+/, '');
            elements.push(
                <div
                    key={`h2-${elements.length}`}
                    className="mt-8 border-t border-slate-100 pt-6 first:mt-0 first:border-0 first:pt-0 dark:border-slate-800/80"
                >
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
                        {parseInline(headingText)}
                    </h2>
                </div>
            );
            continue;
        }

        // Subheading (### )
        if (line.startsWith('### ')) {
            flushAll();
            const headingText = line.replace(/^###\s+/, '');
            elements.push(
                <h3
                    key={`h3-${elements.length}`}
                    className="mt-5 mb-2 text-base font-semibold text-slate-900 dark:text-white"
                >
                    {parseInline(headingText)}
                </h3>
            );
            continue;
        }

        // Bullet list item (- or *)
        if (/^[-*]\s+/.test(line)) {
            flushParagraph();
            const itemText = line.replace(/^[-*]\s+/, '');
            currentListItems.push(itemText);
            continue;
        }

        // If currently in a list but encountered non-list text
        if (currentListItems.length > 0) {
            flushList();
        }

        // Standard paragraph line
        currentParagraphLines.push(line);
    }

    flushAll();

    return <div className={`space-y-4 ${className}`}>{elements}</div>;
}

export default MarkdownRenderer;
