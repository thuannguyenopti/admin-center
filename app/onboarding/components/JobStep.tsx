"use client";

import { useState } from "react";
import { Heading, Text, Button, Checkbox, Box } from "@optiaxiom/react";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { motion } from "framer-motion";

type JobStepProps = {
    selectedRole: string;
    onSubmit: (jobs: string[]) => void;
    onBack: () => void;
};

// Map roles to specific jobs (simplified for this demo based on plan)
const getJobsForRole = (role: string) => {
    const common = [
        "Explore Axiom capabilities",
        "Invite team members"
    ];

    if (role.includes("Marketer") || role.includes("Product")) {
        return [
            "Run A/B tests on web/feature",
            "Personalize visitor experiences",
            "Orchestrate cross-channel campaigns",
            "Analyze detailed user segments",
            ...common
        ];
    }
    if (role.includes("Ops")) {
        return [
            "Automate content approvals",
            "Integrate marketing tools (CRM, CMS)",
            "Manage DAM assets",
            "Monitor team velocity/usage",
            ...common
        ];
    }
    if (role.includes("Content")) {
        return [
            "Generate variations of copy",
            "Create hero images & visuals",
            "SEO optimization for articles",
            "Translate content",
            ...common
        ];
    }
    // Dev / AI / Default
    return [
        "Build custom AI Agents",
        "Configure Guardrails & Safety",
        "Integrate APIs / Webhooks",
        "Fine-tune Models",
        ...common
    ];
};

export default function JobStep({ selectedRole, onSubmit, onBack }: JobStepProps) {
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const jobs = getJobsForRole(selectedRole);

    const toggleJob = (job: string) => {
        setSelectedJobs(prev =>
            prev.includes(job) ? prev.filter(j => j !== job) : [...prev, job]
        );
    };

    return (
        <div className="flex flex-col items-center space-y-8 w-full max-w-2xl px-4">
            <div className="w-full flex justify-start">
                <Button
                    appearance="subtle"
                    icon={<IconArrowLeft size={16} />}
                    onClick={onBack}
                    size="sm"
                >
                    Back
                </Button>
            </div>

            <div className="text-center space-y-2">
                <Heading level="2" style={{ fontSize: "28px", fontWeight: "600" }}>
                    What are your main goals today?
                </Heading>
                <Text fontSize="lg" color="fg.secondary">
                    Select all that apply for your <span className="font-medium text-slate-800">{selectedRole}</span> workspace.
                </Text>
            </div>

            <Box className="flex flex-col gap-3 w-full">
                {jobs.map((job, idx) => {
                    const isSelected = selectedJobs.includes(job);
                    return (
                        <motion.div
                            key={job}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div
                                onClick={() => toggleJob(job)}
                                className={`
                                    flex items-center p-4 rounded-xl border cursor-pointer
                                    transition-all duration-200
                                    ${isSelected
                                        ? "bg-blue-50 border-blue-200 shadow-sm"
                                        : "bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                                    }
                                `}
                            >
                                <div className={`
                                    flex items-center justify-center w-6 h-6 rounded-md mr-4
                                    border transition-colors
                                    ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}
                                `}>
                                    {isSelected && <IconCheck size={14} color="white" stroke={3} />}
                                </div>
                                <Text fontWeight={isSelected ? "500" : "400"} color="fg.default">
                                    {job}
                                </Text>
                            </div>
                        </motion.div>
                    );
                })}
            </Box>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: selectedJobs.length > 0 ? 1 : 0.5, y: 0 }}
                className="w-full pt-4"
            >
                <Button
                    appearance="primary"
                    size="lg"
                    className="w-full"
                    disabled={selectedJobs.length === 0}
                    onClick={() => onSubmit(selectedJobs)}
                >
                    Continue
                </Button>
            </motion.div>
        </div>
    );
}
