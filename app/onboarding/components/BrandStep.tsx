"use client";

import { useState } from "react";
import { Heading, Text, Button, Box } from "@optiaxiom/react";
import { IconArrowLeft, IconWorld, IconBook, IconLoader2 } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/app/components/Input";

type BrandStepProps = {
    onSubmit: (website: string, portal?: string) => void;
    onBack: () => void;
};

export default function BrandStep({ onSubmit, onBack }: BrandStepProps) {
    const [website, setWebsite] = useState("");
    const [portal, setPortal] = useState("");
    const [isScanning, setIsScanning] = useState(false);

    const handleSubmit = () => {
        if (!website) return;

        setIsScanning(true);
        // Simulate a "scan" duration before actually submitting
        setTimeout(() => {
            onSubmit(website, portal);
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center space-y-8 w-full max-w-2xl px-4">
            <AnimatePresence mode="wait">
                {!isScanning ? (
                    <motion.div
                        key="input-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full space-y-8"
                    >
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
                                Let's align with your brand.
                            </Heading>
                            <Text fontSize="lg" color="fg.secondary">
                                Help us learn your voice and visual style.
                            </Text>
                        </div>

                        <Box className="flex flex-col gap-6 w-full max-w-md mx-auto">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Website URL <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <IconWorld size={18} />
                                        </div>
                                        <Input
                                            placeholder="e.g. www.axiom.com"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Brand Portal / Style Guide <span className="text-slate-400 font-normal">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <IconBook size={18} />
                                        </div>
                                        <Input
                                            placeholder="e.g. brand.axiom.com"
                                            value={portal}
                                            onChange={(e) => setPortal(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                appearance="primary"
                                size="lg"
                                className="w-full mt-2"
                                disabled={!website}
                                onClick={handleSubmit}
                            >
                                Analyze Brand
                            </Button>
                        </Box>
                    </motion.div>
                ) : (
                    <motion.div
                        key="scanning-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center space-y-6 py-12"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-blue-100 animate-pulse" />
                            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <IconWorld size={32} className="text-blue-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Heading level="3">Analyzing {website}...</Heading>
                            <Text color="fg.secondary">Extracting colors, typography, and tone of voice.</Text>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
