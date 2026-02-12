import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

function StatItem({ label, value, subtext, icon: Icon, colorClass }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-mist shadow-sm flex items-center gap-4 min-w-[200px] flex-1">
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold text-carbon mt-0.5">{value}</p>
                {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
            </div>
        </div>
    );
}

export function StatsTicker({ avg, min, max, count }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">
            <StatItem
                label="Market Average"
                value={`${avg?.toLocaleString()} DA`}
                icon={BarChart3}
                colorClass="bg-primary text-primary"
            />
            <StatItem
                label="Lowest Price"
                value={`${min?.toLocaleString()} DA`}
                subtext="Best deal found"
                icon={TrendingDown}
                colorClass="bg-success text-success"
            />
            <StatItem
                label="Highest Price"
                value={`${max?.toLocaleString()} DA`}
                icon={TrendingUp}
                colorClass="bg-error text-error"
            />
            <StatItem
                label="Listings Scanned"
                value={count || 0}
                subtext="Confidence Score"
                icon={DollarSign}
                colorClass="bg-warning text-warning"
            />
        </div>
    );
}
