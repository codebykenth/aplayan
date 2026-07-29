import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FaqItem {
    question: string;
    answer: string;
}

const faqs: FaqItem[] = [
    {
        question: 'Is Aplayan really free? No hidden charges?',
        answer:
            'Aplayan is 100% free for all job seekers. There are no paid tiers, subscription fees, or hidden charges. Your data privacy is our priority — we run on serverless PHP architecture, so we keep operational costs at zero and pass that savings on to you.',
    },
    {
        question: 'How accurate is the Philippine tax & net pay calculator?',
        answer:
            'Our calculator follows the latest BIR TRAIN Law brackets, SSS contribution schedules, PhilHealth (5% / 2.5% employee share), and Pag-IBIG contribution tables. It supports Regular Employee, 8% Freelancer, and Tax-Exempt regimes. While we strive for accuracy, always consult a licensed accountant for official tax filing.',
    },
    {
        question: 'What happens to my resume data? Is it stored?',
        answer:
            'Your resume is processed ephemerally — it is analyzed in-memory and never written to our database or file storage. This zero-storage approach eliminates data breach risks entirely. You stay in full control of your personal information at all times.',
    },
    {
        question: 'Can I export my resume as a PDF that passes ATS scanners?',
        answer:
            'Yes! Aplayan generates ATS-optimized PDF resumes in two professionally designed templates: ATS Single Column (modern sans-serif, bulleted for maximum ATS parsability) and ATS Classic Serif (executive serif for managerial roles). Both output clean, machine-parseable PDFs without images or complex layouts that confuse ATS bots.',
    },
    {
        question: 'Does Aplayan support remote work and international salary offers?',
        answer:
            'Absolutely. Aplayan handles multi-currency offers (PHP, USD, EUR, GBP, AUD, SGD, JPY, and more) with live exchange rate conversion. The tax engine adapts to Tax-Exempt / Overseas regime for remote workers, and the comparison matrix lets you evaluate foreign salary offers alongside local ones.',
    },
];

interface AccordionItemProps {
    item: FaqItem;
    index: number;
    open: boolean;
    onToggle: () => void;
}

function AccordionItem({ item, open, onToggle }: AccordionItemProps) {
    return (
        <div
            className={cn(
                'rounded-xl border transition-all',
                open ? 'border-primary/40 bg-card/90 shadow-xs' : 'border-border bg-card/50 hover:border-foreground/30',
            )}
        >
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between px-5 py-4 text-left cursor-pointer"
            >
                <span className="text-base font-semibold text-foreground">{item.question}</span>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400 transition-transform duration-200',
                        open && 'rotate-180 text-primary',
                    )}
                />
            </button>
            <div
                className={cn(
                    'overflow-hidden transition-all duration-200',
                    open ? 'max-h-96' : 'max-h-0',
                )}
            >
                <p className="px-5 pb-4 text-sm font-medium leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {item.answer}
                </p>
            </div>
        </div>
    );
}

export default function FaqAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="rounded-xl border border-border bg-card/60 p-6 backdrop-blur-sm sm:p-8">
            <h3 className="text-xl font-bold text-foreground">
                Frequently Asked Questions
            </h3>
            <p className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Everything you need to know before signing up.
            </p>

            <div className="mt-6 space-y-3">
                {faqs.map((item, index) => (
                    <AccordionItem
                        key={index}
                        item={item}
                        index={index}
                        open={openIndex === index}
                        onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                    />
                ))}
            </div>
        </div>
    );
}
