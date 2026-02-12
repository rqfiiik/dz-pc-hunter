import { Badge } from "./Badge";
import { ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function DealCard({ title, price, rawPrice, score, link, source, className }) {
    return (
        <div
            className={twMerge(
                "group relative bg-surface rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 ease-out border border-transparent hover:border-mist transform hover:-translate-y-1",
                className
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <Badge type={score}>{score}</Badge>
                <span className="text-xs font-medium text-slate-400 capitalize flex items-center gap-1">
                    {source}
                    <ExternalLink size={12} />
                </span>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold text-carbon leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>
            </div>

            <div className="flex items-end justify-between mt-auto">
                <div>
                    <p className="text-sm text-slate-500 font-medium">Price</p>
                    <p className="text-2xl font-extrabold text-carbon tracking-tight">
                        {price ? `${price.toLocaleString()} DA` : rawPrice}
                    </p>
                </div>

                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                >
                    View Deal
                </a>
            </div>

            {/* Clickable Card Overlay */}
            <a href={link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" aria-label={`View deal for ${title}`} />
        </div>
    );
}
