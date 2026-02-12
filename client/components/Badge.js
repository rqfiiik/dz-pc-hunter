import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const variants = {
    great: "bg-success-bg text-success-text",
    good: "bg-warning-bg text-warning-text",
    bad: "bg-error-bg text-error-text",
    default: "bg-gray-100 text-gray-800",
};

export function Badge({ type = "default", className, children }) {
    const variantClass = variants[type?.toLowerCase()] || variants.default;

    return (
        <span
            className={twMerge(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
                variantClass,
                className
            )}
        >
            {children}
        </span>
    );
}
