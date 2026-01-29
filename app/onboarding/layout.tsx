export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full bg-white relative overflow-hidden flex flex-col">
            {/* Subtle Aurora Background Effect */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-100/40 blur-[120px]" />

            {/* Content Container */}
            <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-8">
                {children}
            </div>
        </div>
    );
}
