"use client";

import {
    Box,
    Badge,
    Heading,
    Text,
    Button,
    Textarea,
    Select,
    SelectTrigger,
    SelectContent,
    Tabs,
    TabsContent,
    Switch,
    Field,
    Disclosure,
    DisclosureTrigger,
    DisclosureContent,
    type BoxProps,
} from "@optiaxiom/react";
import {
    DetailsPanel,
    DetailsPanelBody,
    DetailsPanelFooter,
    DetailsPanelHeader,
    Layout,
} from "@optiaxiom/react/unstable";
import { Input } from "@/app/components/Input";
import { getSelectValueInOptions } from "@/utils/selectValue";
import {
    IconEnvelope,
    IconSplit,
    IconHandPointer,
    IconClock,
    IconCodeBranch,
    IconCalendar,
    IconXmark,
    IconEllipsisSolid,
    IconTrashCan,
    IconPlus,
    IconCircleInfo,
    IconCircleQuestion as IconHelp,
    IconSearch,
    IconChevronDown,
    IconChevronRight,
    IconCode,
} from "@optiaxiom/icons";
import { IconSparkles } from "@optimizely/axiom-icons";
import { useReactFlow, MarkerType } from "@xyflow/react";
import { useState, useEffect } from "react";

// Helper to describe basic cron expressions
function describeCron(expression: string) {
    try {
        const parts = expression.trim().split(/\s+/);
        if (parts.length !== 5) return "Invalid cron expression";

        const [min, hour, dom, month, dow] = parts;

        // Time
        const h = parseInt(hour);
        const m = parseInt(min);

        const timeStr = (!isNaN(h) && !isNaN(m))
            ? `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? "PM" : "AM"}`
            : "";

        // Days
        const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let dayStr = "";

        if (dow === "*") {
            dayStr = "every day";
        } else {
            const d = parseInt(dow);
            if (!isNaN(d) && daysMap[d]) {
                dayStr = "only on " + daysMap[d];
            } else {
                dayStr = "custom schedule";
            }
        }

        if (timeStr && dayStr) return `At ${timeStr}, ${dayStr}`;
        return "Custom cron schedule";

    } catch (e) {
        return "Invalid cron expression";
    }
}

interface PanelProps {
    onClose: () => void;
    onSave?: () => void;
    node?: any;
}

const PanelContainer = ({
    children,
    title,
    icon,
    iconBg,
    onClose,
    onSave,
    hideCloseButton,
    hideMenuButton,
    headerAction,
}: {
    children: React.ReactNode;
    title: string;
    icon: React.ReactNode;
    iconBg: BoxProps["bg"];
    onClose?: () => void;
    onSave?: () => void;
    hideCloseButton?: boolean;
    hideMenuButton?: boolean;
    headerAction?: React.ReactNode;
}) => (
    <DetailsPanel w="full">
        <DetailsPanelHeader
            addonBefore={
                <Box
                    p="8"
                    rounded="full"
                    bg={iconBg}
                    color="fg.default"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    {icon}
                </Box>
            }
            addonAfter={
                <Box display="flex" gap="8" alignItems="center">
                    {headerAction}
                    {!hideCloseButton && (
                        <Button
                            icon={<IconXmark size={16} />}
                            appearance="subtle"
                            aria-label="Close"
                            size="sm"
                            onClick={onClose}
                        />
                    )}
                </Box>
            }
        >
            <Text fontWeight="600" fontSize="lg">{title}</Text>
        </DetailsPanelHeader>

        <DetailsPanelBody p="20">
            <Box bg="bg.secondary" rounded="md" p="16" display="flex" flexDirection="column" gap="24" flex="1">
                {children}
            </Box>
        </DetailsPanelBody>

        <DetailsPanelFooter>
            <Box
                display="flex"
                justifyContent="flex-end"
                gap="8"
                flex="1"
            >
                {(hideCloseButton || onSave) && <Button appearance="subtle" onClick={onClose}>Cancel</Button>}
                {!hideMenuButton && <Button appearance="subtle" icon={<IconEllipsisSolid size={16} />} aria-label="More options" />}
                <Button appearance="primary" onClick={onSave}>Apply</Button>
            </Box>
        </DetailsPanelFooter>
    </DetailsPanel>
);

export function EmailTriggerPanel({ onClose }: PanelProps) {
    return (
        <PanelContainer
            title="Email Trigger"
            icon={<IconEnvelope />}
            iconBg="bg.success.subtle"
            onClose={onClose}
        >
            <Field label="Short Description">
                <Input placeholder="Describe this trigger" />
            </Field>

            <Field label="Trigger Recipient" required info="Recipient details">
                <Box display="flex" alignItems="center" gap="8">
                    <Box flex="1">
                        <Input />
                    </Box>
                    <Text fontSize="md" color="fg.default">@stride.opal.optimizely.com</Text>
                </Box>
            </Field>

            <Box>
                <Field label="Sender Filters" required info="Filter criteria">
                    <Box display="flex" gap="8" alignItems="center">
                        <Box flex="1">
                            <Select defaultValue="contains" options={[{ label: "Contains", value: "contains" }, { label: "Equals", value: "equals" }]}>
                                <SelectTrigger size="lg">
                                    Contains
                                </SelectTrigger>
                                <SelectContent />
                            </Select>
                        </Box>
                        <Box style={{ flex: 2 }}>
                            <Input placeholder="Enter filter criteria" />
                        </Box>
                        <IconTrashCan size={16} className="cursor-pointer text-fg-tertiary hover:text-fg-default" />
                    </Box>
                </Field>
            </Box>

            <Button appearance="subtle" icon={<IconPlus />} alignSelf="start">
                Add Filter
            </Button>

            <Box borderT="1" borderColor="border.tertiary" my="8" />

            <Button appearance="subtle" icon={<IconPlus />} alignSelf="start" >
                Add Subject Filters
            </Button>
        </PanelContainer>
    );
}

const MATCH_TYPES = [
    { label: "Equals", value: "equals" },
    { label: "Not Equals", value: "not_equals" },
    { label: "Contains", value: "contains" },
    { label: "Not Contains", value: "not_contains" },
    { label: "Greater Than", value: "greater_than" },
    { label: "Less Than", value: "less_than" },
    { label: "Greater Than or Equals", value: "greater_than_or_equals" },
    { label: "Less Than or Equals", value: "less_than_or_equals" },
    { label: "Regex", value: "regex" },
];

export function ConditionPanel({ onClose, node }: PanelProps & { node: any }) {
    const { setNodes, setEdges } = useReactFlow();

    // Initialize conditions from node data or use defaults
    const [conditions, setConditions] = useState<{ matchType: string, value: string }[]>(
        node?.data?.conditions?.map((c: any, i: number) => typeof c === 'string' ? { matchType: 'equals', value: c } : c) ||
        [{ matchType: "equals", value: "" }, { matchType: "equals", value: "" }]
    );

    useEffect(() => {
        if (!node) return;

        // Update Node Data
        setNodes((nds) => nds.map(n => n.id === node.id ? {
            ...n,
            data: { ...n.data, conditions: conditions }
        } : n));

        // Update Edge Labels
        setEdges((eds) => eds.map(e => {
            if (e.source === node.id) {
                const targetNodeId = e.target;
                // Rely on the suffix -1, -2, -3...
                const match = targetNodeId.match(/-(\d+)$/);
                if (match) {
                    const index = parseInt(match[1]) - 1;
                    if (conditions[index]) {
                        return { ...e, label: conditions[index].value };
                    }
                }
            }
            return e;
        }));
    }, [conditions, node?.id, setNodes, setEdges]);

    const handleAddCondition = () => {
        const newIndex = conditions.length + 1;
        const newPlaceholderId = `placeholder-${Date.now()}-${newIndex}`;

        // Find current condition node to position new placeholder
        setNodes((nds) => {
            const currentNode = nds.find(n => n.id === node.id);
            if (!currentNode) return nds;

            // Positioning logic to spread nodes symmetrically (Index 1: -140, 2: 140, 3: -420, 4: 420...)
            const offset = (Math.ceil(newIndex / 2) * 280) - 140;
            const x = currentNode.position.x + (newIndex % 2 === 0 ? offset : -offset);

            const newPlaceholder = {
                id: newPlaceholderId,
                type: 'stepPlaceholder',
                data: { label: 'Drag and drop step' },
                position: {
                    x,
                    y: currentNode.position.y + 160
                },
            };
            return [...nds, newPlaceholder];
        });

        setEdges((eds) => [
            ...eds,
            {
                id: `e-${node.id}-${newPlaceholderId}`,
                source: node.id,
                target: newPlaceholderId,
                type: 'condition',
                label: '',
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { strokeDasharray: '5,5' }
            }
        ]);

        setConditions([...conditions, { matchType: "equals", value: "" }]);
    };

    const updateCondition = (index: number, fields: Partial<{ matchType: string, value: string }>) => {
        const newConditions = [...conditions];
        newConditions[index] = { ...newConditions[index], ...fields };
        setConditions(newConditions);
    };

    return (
        <PanelContainer
            title="Condition"
            icon={<IconSplit />}
            iconBg="bg.accent.subtle"
            onClose={onClose}
        >
            <Box display="flex" flexDirection="column" gap="32">
                {conditions.map((condition, index) => (
                    <Box key={index} display="flex" flexDirection="column" gap="16">
                        <Text fontWeight="600" fontSize="md" color="fg.secondary">Condition {index + 1}</Text>
                        <Field label="Match type" required>
                            {(() => {
                                const matchTypeValue = getSelectValueInOptions(
                                    condition.matchType,
                                    MATCH_TYPES,
                                    "equals"
                                );
                                return (
                                    <Select
                                        value={matchTypeValue}
                                        onValueChange={(val) =>
                                            updateCondition(index, { matchType: val })
                                        }
                                        options={MATCH_TYPES}
                                    >
                                        <SelectTrigger size="lg">
                                            {MATCH_TYPES.find((m) => m.value === matchTypeValue)
                                                ?.label}
                                        </SelectTrigger>
                                        <SelectContent />
                                    </Select>
                                );
                            })()}
                        </Field>
                        <Field label="Condition" required>
                            <Input
                                value={condition.value}
                                onChange={(e) => updateCondition(index, { value: e.target.value })}
                                placeholder="Enter condition"
                            />
                        </Field>
                        <Button appearance="subtle" icon={<IconPlus size={16} />} alignSelf="start" size="sm" p="0">
                            Add Rule
                        </Button>
                    </Box>
                ))}

                <Button appearance="default" icon={<IconPlus />} alignSelf="start" onClick={handleAddCondition}>
                    Add Condition
                </Button>
            </Box>
        </PanelContainer>
    );
}

export function InAppEventPanel({ onClose }: PanelProps) {
    return (
        <PanelContainer
            title="In-app Event"
            icon={<IconHandPointer />}
            iconBg="bg.success.subtle"
            onClose={onClose}
        >
            <Text color="fg.secondary" fontSize="sm">
                When a user triggers an in-app event, this workflow will activate.
            </Text>

            <Text fontWeight="600" fontSize="md" mt="4">Rules</Text>

            <Box bg="bg.avatar.neutral" p="16" rounded="sm" display="flex" flexDirection="column" gap="12">
                <Text fontWeight="600" fontSize="md">Rule 1</Text>

                <Field label="Product" required>
                    <Select defaultValue="cmp" options={[{ label: "Content Marketing Platform (CMP)", value: "cmp" }]}>
                        <SelectTrigger size="lg">
                            Content Marketing Platform (CMP)
                        </SelectTrigger>
                        <SelectContent />
                    </Select>
                </Field>

                <Field label="Event Type" required>
                    <Select defaultValue="select" options={[{ label: "Select type", value: "select" }, { label: "Click", value: "click" }]}>
                        <SelectTrigger size="lg">
                            Select type
                        </SelectTrigger>
                        <SelectContent />
                    </Select>
                </Field>

                <Field label="Description">
                    <Textarea placeholder="Optional" className="h-24" />
                </Field>

                <Button appearance="subtle" icon={<IconPlus />} alignSelf="start" size="sm">
                    Add Rule
                </Button>
            </Box>
        </PanelContainer>
    );
}

export function SchedulerPanel({ onClose }: PanelProps) {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const [selectedDays, setSelectedDays] = useState([1]); // Monday selected by default
    const [activeTab, setActiveTab] = useState("standard");
    const [cronExpression, setCronExpression] = useState("0 9 * * 1");

    // New States
    const [isRecurring, setIsRecurring] = useState(false);
    const [startDate, setStartDate] = useState("Jan 2, 2026");
    const [endDate, setEndDate] = useState("");
    const [recurValue, setRecurValue] = useState("1");
    const [recurUnit, setRecurUnit] = useState("week");

    // Time state
    const [startHour, setStartHour] = useState("9");
    const [startMinute, setStartMinute] = useState("00");
    const [startPeriod, setStartPeriod] = useState("AM");

    const toggleDay = (index: number) => {
        setSelectedDays(prev =>
            prev.includes(index)
                ? prev.filter(d => d !== index)
                : [...prev, index].sort()
        );
    };

    const getPreviewText = () => {
        if (!isRecurring) return null;

        if (activeTab === 'advanced') {
            return describeCron(cronExpression);
        }

        const timeStr = `${startHour}:${startMinute} ${startPeriod}`;
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let recurrenceStr = "";

        if (recurUnit === 'week') {
            if (selectedDays.length === 0) {
                return `At ${timeStr}, never`;
            }
            const selectedDayNames = selectedDays.map(d => dayNames[d]);
            if (selectedDays.length === 1) {
                recurrenceStr = `on ${selectedDayNames[0]}s`;
            } else {
                recurrenceStr = `on ${selectedDayNames.join(', ')}s`;
            }
        } else {
            // Basic fallback for other units if implemented later
            recurrenceStr = `every ${recurValue} ${recurUnit}(s)`;
        }

        return `At ${timeStr} EST, ${recurrenceStr}.`;
    };

    const timezoneOptions = [
        { label: "New York, United States (UTC-05:00)", value: "ny" },
        { label: "Los Angeles, United States (UTC-08:00)", value: "la" },
        { label: "Chicago, United States (UTC-06:00)", value: "chi" },
        { label: "Denver, United States (UTC-07:00)", value: "den" },
        { label: "Phoenix, United States (UTC-07:00)", value: "pho" },
        { label: "Anchorage, United States (UTC-09:00)", value: "anc" },
    ];

    const recurUnitOptions = [
        { label: "Day(s)", value: "day" },
        { label: "Week(s)", value: "week" },
        { label: "Month(s)", value: "month" },
        { label: "Year(s)", value: "year" },
    ];

    return (
        <PanelContainer
            title="Scheduler"
            icon={<IconCalendar />}
            iconBg="bg.success.subtle"
            onClose={onClose}
        >
            <Field label="Name">
                <Input defaultValue="Eg. Weekly Report" />
            </Field>

            <Box mb="8">
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring}>
                    Recurring
                </Switch>
            </Box>

            {!isRecurring ? (
                // Non-Recurring View
                <Box display="flex" flexDirection="column" style={{ gap: "24px" }}>
                    <Field label="Trigger Date">
                        <Box style={{ position: "relative" }}>
                            <Box style={{ position: "absolute", left: "12px", top: "10px", zIndex: 1 }} color="fg.tertiary">
                                <IconCalendar />
                            </Box>
                            <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ paddingLeft: '40px', fontFamily: 'var(--font-intel)' }} />
                        </Box>
                    </Field>

                    <Field label="Trigger Time">
                        <Box display="flex" gap="4">
                            <Select
                                value={getSelectValueInOptions(startHour, [{ label: "9", value: "9" }], "9")}
                                onValueChange={setStartHour}
                                options={[{ label: "9", value: "9" }]}
                            >
                                <SelectTrigger size="lg">{startHour}</SelectTrigger>
                                <SelectContent />
                            </Select>
                            <Select
                                value={getSelectValueInOptions(startMinute, [{ label: "00", value: "00" }], "00")}
                                onValueChange={setStartMinute}
                                options={[{ label: "00", value: "00" }]}
                            >
                                <SelectTrigger size="lg">{startMinute}</SelectTrigger>
                                <SelectContent />
                            </Select>
                            <Select
                                value={getSelectValueInOptions(startPeriod, [
                                    { label: "AM", value: "AM" },
                                    { label: "PM", value: "PM" },
                                ], "AM")}
                                onValueChange={setStartPeriod}
                                options={[
                                    { label: "AM", value: "AM" },
                                    { label: "PM", value: "PM" },
                                ]}
                            >
                                <SelectTrigger size="lg">{startPeriod}</SelectTrigger>
                                <SelectContent />
                            </Select>
                        </Box>
                    </Field>

                    <Field label="Time Zone">
                        <Select defaultValue="ny" options={timezoneOptions}>
                            <SelectTrigger size="lg">New York, United States (UTC-05:00)</SelectTrigger>
                            <SelectContent />
                        </Select>
                    </Field>
                </Box>
            ) : (
                // Recurring View
                <Box display="flex" flexDirection="column" style={{ gap: "24px" }}>
                    <Field label="Start from">
                        <Box style={{ position: "relative" }}>
                            <Box style={{ position: "absolute", left: "12px", top: "10px", zIndex: 1 }} color="fg.tertiary">
                                <IconCalendar />
                            </Box>
                            <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ paddingLeft: '40px', fontFamily: 'var(--font-intel)' }} />
                        </Box>
                    </Field>

                    <Field label="Time Zone">
                        <Select defaultValue="ny" options={timezoneOptions}>
                            <SelectTrigger size="lg">New York, United States (UTC-05:00)</SelectTrigger>
                            <SelectContent />
                        </Select>
                    </Field>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <Box display="flex" gap="24" borderB="1" borderColor="border.tertiary">
                            {(["standard", "advanced"] as const).map((tab) => (
                                <Box
                                    key={tab}
                                    pb="12"
                                    cursor="pointer"
                                    borderB={activeTab === tab ? "2" : "0"}
                                    onClick={() => setActiveTab(tab)}
                                    style={activeTab === tab ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
                                >
                                    <Text fontWeight={activeTab === tab ? "500" : "400"} color={activeTab === tab ? "fg.default" : "fg.secondary"}>
                                        {tab === "standard" ? "Standard" : "Advanced (Cron)"}
                                    </Text>
                                </Box>
                            ))}
                        </Box>
                        <TabsContent value="standard">
                            <Box bg="bg.avatar.neutral" p="16" rounded="sm" display="flex" flexDirection="column" gap="24" mt="16">
                                <Field label="Recur every">
                                    <Box display="flex" gap="8">
                                        <Box flex="1">
                                            <Input value={recurValue} onChange={(e) => setRecurValue(e.target.value)} />
                                        </Box>
                                        <Box style={{ flex: 2 }}>
                                            <Select
                                                value={getSelectValueInOptions(
                                                    recurUnit,
                                                    recurUnitOptions,
                                                    "week"
                                                )}
                                                onValueChange={setRecurUnit}
                                                options={recurUnitOptions}
                                            >
                                                <SelectTrigger size="lg">
                                                    {recurUnitOptions.find(
                                                        (o) =>
                                                            o.value ===
                                                            getSelectValueInOptions(
                                                                recurUnit,
                                                                recurUnitOptions,
                                                                "week"
                                                            )
                                                    )?.label}
                                                </SelectTrigger>
                                                <SelectContent />
                                            </Select>
                                        </Box>
                                    </Box>
                                </Field>

                                <Field label="On these days">
                                    <Box display="flex" gap="4">
                                        {days.map((d, i) => {
                                            const isSelected = selectedDays.includes(i);
                                            return (
                                                <Box
                                                    key={i}
                                                    w="32"
                                                    h="32"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    rounded="sm"
                                                    onClick={() => toggleDay(i)}
                                                    bg={isSelected ? "bg.accent" : "bg.default"}
                                                    color={isSelected ? "fg.default.inverse" : "fg.default"}
                                                    className="cursor-pointer border border-[var(--ax-colors-border-tertiary)]"
                                                >
                                                    <Text fontSize="sm">{d}</Text>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Field>

                                <Field label="Start time">
                                    <Box display="flex" gap="4">
                                        <Select
                                            value={getSelectValueInOptions(
                                                startHour,
                                                [{ label: "9", value: "9" }],
                                                "9"
                                            )}
                                            onValueChange={setStartHour}
                                            options={[{ label: "9", value: "9" }]}
                                        >
                                            <SelectTrigger size="lg">{startHour}</SelectTrigger>
                                            <SelectContent />
                                        </Select>
                                        <Select
                                            value={getSelectValueInOptions(
                                                startMinute,
                                                [{ label: "00", value: "00" }],
                                                "00"
                                            )}
                                            onValueChange={setStartMinute}
                                            options={[{ label: "00", value: "00" }]}
                                        >
                                            <SelectTrigger size="lg">{startMinute}</SelectTrigger>
                                            <SelectContent />
                                        </Select>
                                        <Select
                                            value={getSelectValueInOptions(
                                                startPeriod,
                                                [
                                                    { label: "AM", value: "AM" },
                                                    { label: "PM", value: "PM" },
                                                ],
                                                "AM"
                                            )}
                                            onValueChange={setStartPeriod}
                                            options={[
                                                { label: "AM", value: "AM" },
                                                { label: "PM", value: "PM" },
                                            ]}
                                        >
                                            <SelectTrigger size="lg">{startPeriod}</SelectTrigger>
                                            <SelectContent />
                                        </Select>
                                    </Box>
                                </Field>

                                <Field label="End date (Optional)">
                                    <Box style={{ position: "relative" }}>
                                        <Box style={{ position: "absolute", left: "12px", top: "10px", zIndex: 1 }} color="fg.tertiary">
                                            <IconCalendar size={20} />
                                        </Box>
                                        <Input
                                            placeholder="Ends on"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </Box>
                                </Field>
                            </Box>
                        </TabsContent>
                        <TabsContent value="advanced">
                            <Box bg="bg.avatar.neutral" p="16" rounded="sm" display="flex" flexDirection="column" gap="24" mt="16">
                                <Field label="Cron Expression">
                                    <Box bg="bg.default" p="12" rounded="sm" border="1" borderColor="border.tertiary">
                                        <Input
                                            value={cronExpression}
                                            onChange={(e) => setCronExpression(e.target.value)}
                                            style={{ border: 'none', padding: 0, height: 'auto', boxShadow: 'none', backgroundColor: 'transparent', fontFamily: 'var(--font-intel)' }}
                                            className="focus:ring-0"
                                        />
                                    </Box>
                                </Field>

                                <Field label="End date (Optional)">
                                    <Box style={{ position: "relative" }}>
                                        <Box style={{ position: "absolute", left: "12px", top: "10px", zIndex: 1 }} color="fg.tertiary">
                                            <IconCalendar />
                                        </Box>
                                        <Input
                                            placeholder="Ends on"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{ paddingLeft: '40px', fontFamily: 'var(--font-intel)' }}
                                        />
                                    </Box>
                                </Field>
                            </Box>
                        </TabsContent>
                    </Tabs>

                    <Box bg="bg.information.subtle" p="12" rounded="md" display="flex" gap="12">
                        <IconCircleInfo size={20} className="text-fg-information" />
                        <Box>
                            <Text fontWeight="600" fontSize="sm">Preview</Text>
                            <Text fontSize="sm" color="fg.secondary">{getPreviewText()}</Text>
                        </Box>
                    </Box>
                </Box>
            )}

        </PanelContainer>
    );
}

export function WorkflowSetupPanel({ onClose, onSave, workflowName, onNameChange }: PanelProps & { onSave?: () => void; workflowName: string; onNameChange: (name: string) => void }) {
    const [active, setActive] = useState(false);

    return (
        <PanelContainer
            title="Workflow Setup"
            icon={<IconCodeBranch />}
            iconBg="bg.avatar.purple"
            onClose={onClose}
            onSave={onSave}
            hideCloseButton
            hideMenuButton
            headerAction={
                <Switch checked={active} onCheckedChange={setActive}>
                    Active
                </Switch>
            }
        >
            <Field label="Name" required>
                <Input
                    value={workflowName}
                    onChange={(e) => onNameChange(e.target.value)}
                    autoFocus
                />
            </Field>

            <Field label="Id" required>
                <Box display="flex" flexDirection="column" gap="4">
                    <Input defaultValue="workflow_id" />
                    <Text fontSize="md" color="fg.default">@workflow_id</Text>
                </Box>
            </Field>

            <Field label="Description" info="Helper text">
                <Textarea
                    placeholder="What does this workflow agent do?"
                    resize="vertical"
                    className="h-20"
                />
            </Field>


        </PanelContainer>
    );
}

export function AgentNodePanel({ onClose, node }: PanelProps & { node: any }) {
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [inputOpen, setInputOpen] = useState(true);
    const [outputOpen, setOutputOpen] = useState(false);
    const [activeNodeTab, setActiveNodeTab] = useState("setup");

    // Mock data based on node, falling back to defaults
    const name = node?.data?.label || "Agent Name";
    const description = node?.data?.description || "Agent description...";
    // extract output type if available
    const outputType = node?.data?.outputType || "JSON";

    return (
        <DetailsPanel w="full" h="full" style={{ height: '100%' }}>
            <DetailsPanelHeader>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap="8">
                        <Box
                            p="6"
                            rounded="sm"
                            bg={node?.data?.bg || "bg.avatar.purple"}
                            color="fg.default"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            {node?.data?.icon}
                        </Box>
                        <Text fontWeight="600" fontSize="lg">{name}</Text>
                    </Box>
                    <Button
                        icon={<IconXmark size={16} />}
                        appearance="subtle"
                        aria-label="Close"
                        size="sm"
                        onClick={onClose}
                    />
                </Box>

                <Box mt="16">
                    <Box display="flex" gap="24" borderB="1" borderColor="border.tertiary">
                        {(["setup", "trace"] as const).map((tab) => (
                            <Box
                                key={tab}
                                pb="12"
                                cursor="pointer"
                                borderB={activeNodeTab === tab ? "2" : "0"}
                                onClick={() => setActiveNodeTab(tab)}
                                style={activeNodeTab === tab ? { borderBottomColor: "var(--ax-colors-fg-default)" } : {}}
                            >
                                <Text fontWeight={activeNodeTab === tab ? "500" : "400"} color={activeNodeTab === tab ? "fg.default" : "fg.secondary"}>
                                    {tab === "setup" ? "Setup" : "Trace"}
                                </Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </DetailsPanelHeader>

            <DetailsPanelBody p="0" overflowY="auto">
                <Box display="flex" flexDirection="column" gap="4" flex="1">
                    {/* Details Section */}
                    <CollapsibleSection
                        title="Details"
                        isOpen={detailsOpen}
                        onToggle={() => setDetailsOpen(!detailsOpen)}
                    >
                        <Field label="Name">
                            <Box display="flex" gap="12" alignItems="center">
                                <Box flex="1">
                                    <Input defaultValue={name} disabled />
                                </Box>
                            </Box>
                        </Field>

                        <Field label="Description">
                            <Textarea defaultValue={description} disabled />
                        </Field>
                    </CollapsibleSection>

                    {/* Input Section */}
                    <CollapsibleSection
                        title="Input"
                        isOpen={inputOpen}
                        onToggle={() => setInputOpen(!inputOpen)}
                    >
                        <Field label="Prompt Template" info="Define the agent skills">
                            <Textarea
                                defaultValue={`Role: You are a marketing copy expert. Generate content for ${name}...`}
                                className="h-32"
                                disabled
                            />
                        </Field>

                        <Box>
                            <Text fontWeight="400" fontSize="md" mb="8">Variables</Text>
                            <Box display="flex" flexDirection="column" gap="8">
                                <Box border="1" borderColor="border.tertiary" rounded="sm" p="12" display="flex" alignItems="center" justifyContent="space-between" bg="bg.default">
                                    <Box>
                                        <Text fontWeight="600">overview</Text>
                                        <Text fontSize="sm" color="fg.secondary">what the email is about</Text>
                                    </Box>
                                    <Box display="flex" gap="8" alignItems="center">
                                        <Badge>Required</Badge>
                                        <Text fontSize="sm" color="fg.secondary">String</Text>
                                    </Box>
                                </Box>
                                <Box border="1" borderColor="border.tertiary" rounded="sm" p="12" display="flex" alignItems="center" justifyContent="space-between" bg="bg.default">
                                    <Box>
                                        <Text fontWeight="600">target audience</Text>
                                        <Text fontSize="sm" color="fg.secondary">target audience of the email</Text>
                                    </Box>
                                    <Box display="flex" gap="8" alignItems="center">
                                        <Badge>Required</Badge>
                                        <Text fontSize="sm" color="fg.secondary">String</Text>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Field label="Tools" info="Select tools for the agent">
                            <Box border="1" borderColor="border.tertiary" rounded="sm" p="12" bg="bg.default">
                                <Text>send_email</Text>
                            </Box>
                        </Field>
                    </CollapsibleSection>

                    {/* Output Section */}
                    <CollapsibleSection
                        title="Output"
                        isOpen={outputOpen}
                        onToggle={() => setOutputOpen(!outputOpen)}
                        info="Read only"
                    >
                        <Box border="1" borderColor="border.tertiary" rounded="sm" p="12" bg="bg.default" display="flex" alignItems="center" gap="8">
                            <IconCode size={20} className="text-fg-secondary" />
                            <Text>{outputType}</Text>
                        </Box>
                    </CollapsibleSection>
                </Box>
            </DetailsPanelBody>
            <DetailsPanelFooter>
                <Box display="flex" justifyContent="flex-end" gap="8" flex="1">
                    <Button appearance="subtle" icon={<IconEllipsisSolid size={16} />} aria-label="More options" />
                    <Button appearance="primary" onClick={onClose}>Done</Button>
                </Box>
            </DetailsPanelFooter>
        </DetailsPanel >
    );
}

function CollapsibleSection({
    title,
    children,
    isOpen,
    onToggle,
    info,
    action
}: {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    info?: string;
    action?: React.ReactNode;
}) {
    return (
        <Disclosure open={isOpen} onOpenChange={onToggle} className="w-full">
            <DisclosureTrigger className="w-full p-0 flex items-center justify-between border-none shadow-none focus:ring-0 focus:outline-none bg-transparent hover:bg-transparent" chevronPosition="end">
                <Box
                    h="40"
                    px="0"
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    bg="bg.default"
                    className="hover:bg-[var(--ax-colors-bg-default-hovered)] w-full"
                >
                    <Box pl="0" display="flex" alignItems="center" gap="8">
                        <Text fontSize="md" fontWeight="500">{title}</Text>
                        {info && <IconHelp size={16} color="var(--ax-colors-fg-tertiary)" />}
                    </Box>
                    <Box pr="0" display="flex" alignItems="center" gap="8">
                        {action && <Box onClick={(e) => e.stopPropagation()}>{action}</Box>}
                    </Box>
                </Box>
            </DisclosureTrigger>

            <DisclosureContent>
                <Box
                    bg="bg.secondary"
                    p="16"
                    rounded="lg"
                    display="flex"
                    flexDirection="column"
                    gap="24"
                >
                    {children}
                </Box>
            </DisclosureContent>
        </Disclosure>
    );
}
