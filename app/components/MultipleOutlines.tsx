
"use client";

import React, { useState } from "react";
import { Box, Heading, Sidebar, Tabs, TabsList, TabsTrigger, TabsContent, Nav, NavBody, NavItem, SubNav } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import {
    initialExperiences,
    initialPages,
} from "@/app/db/initialData";

export default function MultipleOutlines() {
    const [activeTab, setActiveTab] = useState<"outlines" | "properties">("outlines");
    const landing = initialExperiences.find((e) => e.experienceTypeId === "exp-landing-page");

    // derive outlines from landing data (dynamic keys and titles)
    const outlinesList: { key: string; title: string }[] = landing?.outlines
        ? Object.entries(landing.outlines).map(([k, v]: any) => ({ key: k, title: v?.title || k }))
        : [];

    // derive blog posts (latest 5) from initialPages
    const blogPosts = initialPages.filter((p) => p.contentTypeId === "ct-blog-post");

    const [selectedOutline, setSelectedOutline] = useState<null | string>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    return (
        <Sidebar expanded={true}>
            <SubNav >
                {/* back navitem removed — back button will appear in the header row */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "outlines" | "properties")}>

                    <NavBody>
                        {selectedOutline && (
                            <Button appearance="subtle" size="sm" onClick={() => setSelectedOutline(null)}>
                                ← Back
                            </Button>
                        )}
                        <Heading level="3">{selectedOutline ? (selectedOutline === "main" ? "Main" : "Aside") : "Page"}</Heading>


                        <TabsList>
                            <TabsTrigger value="outlines">{selectedOutline ? "Content" : "Outlines"}</TabsTrigger>
                            <TabsTrigger value="properties">Properties</TabsTrigger>
                        </TabsList>

                    </NavBody>

                    <TabsContent value="outlines">

                        {!selectedOutline && (
                            <NavBody>
                                {outlinesList.length === 0 && (
                                    <Text color="fg.secondary">No outlines available</Text>
                                )}
                                {outlinesList.map((o) => (
                                    <NavItem key={o.key} onClick={() => setSelectedOutline(o.key)} aria-label={o.title}>
                                        {o.title}
                                    </NavItem>
                                ))}
                            </NavBody>
                        )}

                        {selectedOutline && (
                            <NavBody>
                                {/* sections for the selected outline */}
                                {((landing?.outlines?.[selectedOutline]?.content || []) as any[]).length === 0 && (
                                    <Text color="fg.secondary">No sections available</Text>
                                )}
                                {((landing?.outlines?.[selectedOutline]?.content || []) as any[]).map((s: any) => (
                                    <React.Fragment key={s.id}>
                                        <NavItem
                                            onClick={() => setSelectedSection(s.id)}
                                            aria-label={s.name || s.id}
                                            active={selectedSection === s.id}
                                        >
                                            {s.name || s.id}
                                        </NavItem>

                                        {/* If this section is named Latest Blogposts, list the posts beneath it */}
                                        {String(s.name).toLowerCase().includes("blog") && (
                                            (blogPosts || []).slice(0, 5).map((p) => (
                                                <NavItem
                                                    key={p.id}
                                                    onClick={() => setSelectedSection(p.id)}
                                                    aria-label={p.data.title}
                                                    style={{ paddingLeft: 16 }}
                                                    active={selectedSection === p.id}
                                                >
                                                    {p.data.title}
                                                </NavItem>
                                            ))
                                        )}
                                    </React.Fragment>
                                ))}
                            </NavBody>
                        )}
                    </TabsContent>

                    <TabsContent value="properties">
                        <NavBody>
                            <Text color="fg.secondary">Select an outline item to see properties.</Text>

                        </NavBody>
                    </TabsContent>
                </Tabs>
            </SubNav>
        </Sidebar>
    );
}

