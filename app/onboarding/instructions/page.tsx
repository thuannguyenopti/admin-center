"use client";

import { motion } from "framer-motion";
import { Heading, Text, Button, Box, Badge } from "@optiaxiom/react";
import { IconArrowRight, IconSparkles, IconRefresh, IconCheck } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function InstructionsPage() {
    const router = useRouter();

    return (
        <div className="w-full max-w-6xl mx-auto p-6 md:p-12">

            <header className="flex justify-between items-end mb-12">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Heading level="1" style={{ fontSize: "36px" }}>Your Instructions</Heading>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Text fontSize="lg" color="fg.secondary" className="max-w-xl">
                            Axiom has analyzed your brand and created a custom system prompt. This ensures every generation feels like <strong>you</strong>.
                        </Text>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <Button
                        appearance="primary"
                        size="lg"
                        icon={<IconArrowRight />}
                        onClick={() => router.push("/opal/activities")}
                    >
                        Go to Dashboard
                    </Button>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Brand Voice & Visual Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
                >
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <IconSparkles size={18} />
                            </div>
                            <Heading level="4">Brand Identity</Heading>
                        </div>
                        <Badge intent="success">Active</Badge>
                    </div>

                    <div className="p-8 flex-1 space-y-8">
                        {/* Tone Section */}
                        <div className="space-y-3">
                            <Text className="uppercase text-xs font-semibold text-slate-400 tracking-wider">Voice & Tone</Text>
                            <div className="flex flex-wrap gap-2">
                                {["Energetic", "Motivational", "Direct", "Premium"].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Visuals Section (New) */}
                        <div className="space-y-3">
                            <Text className="uppercase text-xs font-semibold text-slate-400 tracking-wider">Visual Elements</Text>
                            <div className="flex gap-4">
                                <div className="space-y-1 text-center">
                                    <div className="w-12 h-12 rounded-full shadow-sm border border-slate-100 bg-[#0052CC]" title="Primary Blue" />
                                    <Text fontSize="xs" color="fg.secondary">#0052CC</Text>
                                </div>
                                <div className="space-y-1 text-center">
                                    <div className="w-12 h-12 rounded-full shadow-sm border border-slate-100 bg-[#172B4D]" title="Dark Navy" />
                                    <Text fontSize="xs" color="fg.secondary">#172B4D</Text>
                                </div>
                                <div className="space-y-1 text-center">
                                    <div className="w-12 h-12 rounded-full shadow-sm border border-slate-200 bg-[#F4F5F7]" title="Light Gray" />
                                    <Text fontSize="xs" color="fg.secondary">#F4F5F7</Text>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Text className="uppercase text-xs font-semibold text-slate-400 tracking-wider">Typography</Text>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <Text fontSize="lg" fontWeight="700" className="mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Aa</Text>
                                <Text fontSize="sm" color="fg.secondary">Inter / Sans-serif</Text>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Text className="uppercase text-xs font-semibold text-slate-400 tracking-wider">System Instruction</Text>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono text-sm text-slate-600 leading-relaxed text-xs">
                                "You are the voice of Stride. Use short, punchy sentences. Focus on the thrill of the challenge. Avoid passive voice."
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Comparison Demo */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full"
                >
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <Heading level="4">Output Comparison</Heading>
                        <Button size="sm" appearance="subtle" icon={<IconRefresh size={14} />}>Regenerate</Button>
                    </div>

                    <div className="grid grid-rows-2 h-full divide-y divide-slate-100">
                        {/* Before */}
                        <div className="p-6 space-y-2 bg-slate-50/30">
                            <div className="flex justify-between">
                                <Text className="uppercase text-xs font-semibold text-red-400 tracking-wider">Before (Generic)</Text>
                            </div>
                            <Text color="fg.secondary">
                                "The Stride Triathlon is an event happening this year. You can sign up to participate in running, swimming, and biking. It will be a good experience for everyone involved."
                            </Text>
                        </div>

                        {/* After */}
                        <div className="p-6 space-y-2 bg-blue-50/30 relative">
                            <div className="flex justify-between">
                                <Text className="uppercase text-xs font-semibold text-blue-600 tracking-wider flex items-center gap-1">
                                    <IconCheck size={14} /> On-Brand
                                </Text>
                            </div>
                            <Text color="fg.default" className="font-medium">
                                "Ready. Set. Go. Join 2,000+ athletes for the ultimate test of endurance. Crush your PR on our scenic course. Don't just watch history—make it. Register for your bib today!"
                            </Text>

                            {/* Glow effect */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer / Next Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center justify-center p-8 border-t border-slate-100"
            >
                <Text color="fg.secondary" className="mb-4">Everything look good?</Text>
                <div className="flex gap-4">
                    <Button appearance="subtle">Edit Brand Rules</Button>
                    <Button appearance="primary" onClick={() => router.push("/opal/activities")}>Start Creating</Button>
                </div>
            </motion.div>

        </div>
    );
}
