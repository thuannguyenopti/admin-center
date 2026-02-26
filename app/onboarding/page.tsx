"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Heading, Text, Button } from "@optiaxiom/react";
import RoleStep from "./components/RoleStep";
import JobStep from "./components/JobStep";
import BrandStep from "./components/BrandStep";
import { useRouter } from "next/navigation";

export type OnboardingData = {
    role: string | null;
    jobs: string[];
    website?: string;
    portal?: string;
};

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<"role" | "job" | "brand" | "finish">("role");
    const [data, setData] = useState<OnboardingData>({
        role: null,
        jobs: [],
    });

    const handleRoleSelect = (role: string) => {
        setData((prev) => ({ ...prev, role }));
        setTimeout(() => setStep("job"), 300);
    };

    const handleJobsSubmit = (jobs: string[]) => {
        setData((prev) => ({ ...prev, jobs }));
        setStep("brand");
    };

    const handleBrandSubmit = (website: string, portal?: string) => {
        setData((prev) => ({ ...prev, website, portal }));
        setStep("finish");
        // Simulate analyzing/processing before redirecting to Instructions page
        setTimeout(() => {
            router.push("/onboarding/instructions");
        }, 1500);
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
                {step === "role" && (
                    <motion.div
                        key="step-role"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <RoleStep onSelect={handleRoleSelect} />
                    </motion.div>
                )}

                {step === "job" && (
                    <motion.div
                        key="step-job"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <JobStep
                            selectedRole={data.role!}
                            onSubmit={handleJobsSubmit}
                            onBack={() => setStep("role")}
                        />
                    </motion.div>
                )}

                {step === "brand" && (
                    <motion.div
                        key="step-brand"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <BrandStep
                            onSubmit={handleBrandSubmit}
                            onBack={() => setStep("job")}
                        />
                    </motion.div>
                )}

                {step === "finish" && (
                    <motion.div
                        key="step-finish"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
                    >
                        <Heading level="1" style={{ fontSize: "32px" }}>Designing your experience...</Heading>
                        <Text fontSize="lg" color="fg.secondary">
                            Applying <span className="font-semibold text-blue-600">{data.website}</span> brand rules.
                        </Text>
                        {/* Simple pulsing loader */}
                        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin mt-8" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
