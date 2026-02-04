interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="group bg-white rounded-2xl p-6 border border-(--border-color) hover:border-(--brand-deep-blue) transition-all duration-300 hover:shadow-xl hover:shadow-(--brand-deep-blue)/5">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-(--brand-deep-blue)/10 to-(--brand-slate-blue)/10 flex items-center justify-center mb-5 group-hover:from-(--brand-deep-blue) group-hover:to-(--brand-slate-blue) transition-all duration-300">
                <div className="text-(--brand-deep-blue) group-hover:text-white transition-colors">
                    {icon}
                </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-(--text-heading)">
                {title}
            </h3>
            <p className="mt-2 text-sm text-(--text-main) opacity-70 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
