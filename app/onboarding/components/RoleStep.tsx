"use client";

import { motion } from "framer-motion";
import { Heading, Text, Box } from "@optiaxiom/react";
import {
    IconSpeakerphone,
    IconSettingsAutomation,
    IconPencil,
    IconCode,
    IconBrain,
    IconChartBar
} from "@tabler/icons-react";

type RoleStepProps = {
    onSelect: (role: string) => void;
};

const roles = [
    { id: "marketer", label: "Digital Marketer", icon: IconSpeakerphone, desc: "Campaign strategy & execution" },
    { id: "marketing_ops", label: "Marketing Ops", icon: IconSettingsAutomation, desc: "Workflow automation & efficiency" },
    { id: "content_creator", label: "Content Creator", icon: IconPencil, desc: "Asset creation & copywriting" },
    { id: "developer", label: "Developer", icon: IconCode, desc: "Technical implementation & APIs" },
    { id: "ai_specialist", label: "AI Specialist", icon: IconBrain, desc: "Model tuning & governance" },
    { id: "product_manager", label: "Product Manager", icon: IconChartBar, desc: "Strategy & experimentation" },
];

export default function RoleStep({ onSelect }: RoleStepProps) {
    return (
        <div className="flex flex-col items-center space-y-8">
            <div className="text-center space-y-2">
                <Heading level="1" style={{ fontSize: "32px", fontWeight: "600" }}>
                    What best describes your role?
                </Heading>
                <Text fontSize="lg" color="fg.secondary">
                    We'll customize your Axiom experience based on your needs.
                </Text>
            </div>

            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl px-4">
                {roles.map((role, idx) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(role.label)}
                        className="cursor-pointer group"
                    >
                        <div className="
                            flex flex-col items-start p-6 h-full
                            bg-white/80 backdrop-blur-sm
                            border border-slate-200 rounded-xl
                            shadow-sm transition-all duration-200
                            group-hover:shadow-md group-hover:border-blue-200
                            relative overflow-hidden
                        ">
                            <div className="
                                p-3 rounded-lg mb-4
                                bg-slate-50 text-slate-500
                                group-hover:bg-blue-50 group-hover:text-blue-600
                                transition-colors duration-200
                            ">
                                <role.icon size={24} stroke={1.5} />
                            </div>

                            <Heading level="4" style={{ marginBottom: "4px" }}>
                                {role.label}
                            </Heading>
                            <Text fontSize="sm" color="fg.secondary">
                                {role.desc}
                            </Text>

                            {/* Active indicator visuals */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/10 rounded-xl pointer-events-none" />
                        </div>
                    </motion.div>
                ))}
            </Box>
        </div>
    );
}
