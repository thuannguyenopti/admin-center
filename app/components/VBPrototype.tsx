'use client';

import { Box, Button, Field, Heading, Text, Input as Input2, Checkbox } from "@optiaxiom/react";
import { ReactNode, useEffect, Fragment, Children } from "react";
import { useState } from "react";import { 
    IconPlus,
    IconDots,
    IconUpload,
    IconBooks,
    IconLink,
    IconSparkles,
    IconTrash,
    IconPilcrow,
    IconForms,
    IconRectangle,
    IconHeading,
    IconBrackets,
   } from "@tabler/icons-react";
import { Menu, MenuContent, MenuTrigger } from "@optiaxiom/react/unstable";


const Input: React.FC<{ prop: any, onChange: any, propIndex: number }> = ({ prop, onChange, propIndex }) => {
    return <div className="p-6 pr-0 py-2">
        <Field label={prop.label}>
            <Input2
            placeholder={prop.placeholder || ""}
            value={prop.value || ""}
                onChange={e => onChange(e.currentTarget.value, propIndex)}
            />
        </Field>
    </div>
}
        
const Row: React.FC<{ children: ReactNode, addCol: any, removeRow: any, onDragStart: any}> = ({ children, addCol, removeRow, onDragStart }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="p-1 py-0 -mr-[24px]">
            <div
                className="group p-1 cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-5"
                onDragStart={onDragStart} draggable
            >
                <div className="flex gap-1 items-center" onClick={() => setIsOpen(!isOpen)} >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                            transition: "transform 0.2s",
                        }}
                    >
                        <path
                            d="M6.39844 8.64844C6.16406 8.88281 5.8125 8.88281 5.60156 8.64844L1.85156 4.89844C1.61719 4.6875 1.61719 4.33594 1.85156 4.125C2.0625 3.89062 2.41406 3.89062 2.625 4.125L5.97656 7.47656L9.35156 4.10156C9.5625 3.89062 9.91406 3.89062 10.125 4.10156C10.3594 4.33594 10.3594 4.6875 10.125 4.89844L6.39844 8.64844Z"
                            fill="#66708C"
                        />
                    </svg>
                    <Text>Row</Text>
                </div>
                <div className="group-hover:visible invisible" style={{
                    visibility: menuOpen ? "visible" : undefined,
                }}>
                <Menu onOpenChange={() => setMenuOpen(!menuOpen)} open={menuOpen} options={[
                        {
                            addon: <IconTrash size={16} />,
                            label: "Remove Row",
                            intent: "danger",
                            execute: () => {removeRow(); setMenuOpen(false);},
                        }
                        ]}>
                        <MenuTrigger icon={<IconDots />} aria-label="add ele" appearance="subtle" size="sm" iconPosition="start" />
                        <MenuContent />
                    </Menu>
                    <Button onClick={addCol} appearance="subtle" size="sm" aria-label="add row" icon={<IconPlus />} />

                </div>
            </div>
            <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>
        </div>
    );
}

const Col: React.FC<{ children: ReactNode, addElement: any, removeCol: any, onDragStart: any }> = ({ children, addElement, removeCol, onDragStart }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    return (
        <Box>
            <div
                className="group p-1 pl-3 cursor-pointer rounded-[4px] hover:bg-[#091E4208] flex gap-1 items-center w-full justify-between pr-5"
                draggable
                onDragStart={onDragStart}
            >
                <div 
                    className="flex gap-1 items-center" 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                            transition: "transform 0.2s",
                        }}
                    >
                        <path
                            d="M6.39844 8.64844C6.16406 8.88281 5.8125 8.88281 5.60156 8.64844L1.85156 4.89844C1.61719 4.6875 1.61719 4.33594 1.85156 4.125C2.0625 3.89062 2.41406 3.89062 2.625 4.125L5.97656 7.47656L9.35156 4.10156C9.5625 3.89062 9.91406 3.89062 10.125 4.10156C10.3594 4.33594 10.3594 4.6875 10.125 4.89844L6.39844 8.64844Z"
                            fill="#66708C"
                        />
                    </svg>
                    <Text>Column</Text>
                </div>
                <div className="group-hover:visible invisible" style={{
                    visibility: (menuOpen || addOpen) ? "visible" : undefined,
                }}>
                    <Menu onOpenChange={() => setMenuOpen(!menuOpen)} open={menuOpen} options={[
                        {
                            addon: <IconTrash size={16} />,
                            label: "Remove Column",
                            intent: "danger",
                            execute: () => {removeCol(); setMenuOpen(false); },
                        }
                        ]}>
                        <MenuTrigger icon={<IconDots />} aria-label="add ele" appearance="subtle" size="sm" iconPosition="start" />
                        <MenuContent />
                    </Menu>
                    <Menu onOpenChange={() => setAddOpen(!addOpen)} open={addOpen} options={[
                        {
                            group: {label: "Add Element"},
                            addon: <IconHeading size={16} />,
                            label: "Heading",
                            execute: () => {addElement("Heading")},
                        },
                        {
                            addon: <IconPilcrow size={16} />,
                            label: "Text",
                            execute: () => addElement("Text"),
                        },
                        {
                            addon: <IconForms size={16} />,
                            label: "Input",
                            execute: () => addElement("Input"),
                        },
                        {
                            addon: <IconRectangle size={16} />,
                            label: "Button",
                            execute: () => addElement("Button"),
                        },
                    ]}>
                        <MenuTrigger icon={<IconPlus />} aria-label="add ele" appearance="subtle" size="sm" iconPosition="start" />
                        <MenuContent />
                    </Menu>
                </div>
            </div>
            <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>
        </Box>
    );
}

const Ele: React.FC<{ element: any, removeEle: any, setCurrentEle: any, type: any, setCurrentHoverEle: any, label: string, onDragStart: any }> = ({ element, removeEle, setCurrentEle, type, setCurrentHoverEle, label, onDragStart }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <Box pl="32" py="2" pr="20">
            <div
            onMouseEnter={() => setCurrentHoverEle(element.id)}
            onMouseLeave={() => setCurrentHoverEle("none")}
            draggable
            onDragStart={onDragStart}
            onClick={() => {if (!menuOpen) setCurrentEle(element.id)}}
                className="group p-2 py-0 text-sm h-[40px] pl-3 cursor-pointer border border-[#CACFDC] hover:border-[#838DA4] rounded-[4px] hover:bg-[#091E4208] gap-1 items-center w-full bg-white flex justify-between"
            >
                <div className="flex gap-1 items-center w-full group-hover:w-[calc(100%-24px)]" style={{ color: label ? "#2E3442" : "#66708C" }}>
                        <div className="min-w-5">{(() => {
                            switch (type) {
                                case "Heading":
                                    return <IconHeading size={16} />
                                    ;
                                case "Text":
                                    return <IconPilcrow size={16} />
                                    ;
                                case "Input":
                                    return <IconForms size={16} />
                                    ;
                                case "Button":
                                    return <IconRectangle size={16} />
                                    ;
                                default:
                                    return <IconBrackets size={16} />
                                    ;
                            }
                        })()}</div> 

                    <span className="truncate overflow-hidden text-ellipsis">{label || <span className="italic text-[#66708C]">{`Empty ${type}`}</span>}</span>   
                </div>
                <div className="min-w-[24px] invisible group-hover:visible" style={{
                    visibility: menuOpen ? "visible" : undefined,
                }}>
                    <Menu onOpenChange={(e) => setMenuOpen(!menuOpen)} open={menuOpen} options={[
                        {
                            addon: <IconTrash size={16} />,
                            label: "Remove Element",
                            intent: "danger",
                            execute: () => {removeEle(); setMenuOpen(false);},
                        }
                    ]} >
                        <MenuTrigger onClick={e => {e.stopPropagation(); setMenuOpen(true)}} icon={<IconDots />} aria-label="add ele" appearance="subtle" size="sm" iconPosition="start" />
                        <MenuContent />
                    </Menu>
                </div>
            </div>
        </Box>
    );
}

interface OutlineProps {
    currentEle: string;
    currentHoverEle: string;
    dragging: string;
    theEles: Record<string, any>;
    onInputChange: (value: string, propIndex: number) => void;
    setCurrentEle: React.Dispatch<React.SetStateAction<string>>;
    setDragging: React.Dispatch<React.SetStateAction<string>>;
    setData: React.Dispatch<React.SetStateAction<any[]>>;
    setCurrentHoverEle: React.Dispatch<React.SetStateAction<string>>;
    setTheEles: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    data: any;
}

const Outline: React.FC<OutlineProps> = ({ setDragging, currentEle, theEles, onInputChange, setCurrentEle, currentHoverEle, setCurrentHoverEle, data, setData, setTheEles, dragging }) => {

    const addCol = (e: any, row: number) => {
        e.stopPropagation();
    
        setData(prev => [
            ...prev.slice(0, row),
            {
                ...prev[row],
                children: [
                    ...prev[row].children,
                    { label: "Column", children: [], id: "col-" + Date.now()}
                ]
            },
            ...prev.slice(row + 1)
        ]);
    };

    const addElement = (type: string, colIndex: number, rowIndex: number) => {
        const uKey = `${type}-${Date.now()}`;
        setTheEles(prev => ({
            ...prev,
            [uKey]: {
            type: type,
            props: (() => {
                switch (type) {
                case "Heading":
                    return [{ type: "text", label: "Text" }];
                case "Text":
                    return [{ type: "text", label: "Text" }];
                case "Input":
                    return [
                    { type: "text", label: "Label" },
                    { type: "text", label: "Placeholder" },
                    { type: "text", label: "Tooltip" },
                    { type: "checkbox", label: "Required", value: false }
                    ];
                case "Button":
                    return [{ type: "text", label: "Label" }];
                default:
                    return [];
                }
            })()
            }
        }));
        setData(prev => {
            const updatedRow = {
                ...prev[rowIndex],
                children: prev[rowIndex].children.map((col: any, index: number) => {
                    if (index === colIndex) {
                        return {
                            ...col,
                            children: [
                                ...col.children,
                                { id: uKey }
                            ]
                        };
                    }
                    return col;
                })
            };

            return [
                ...prev.slice(0, rowIndex),
                updatedRow,
                ...prev.slice(rowIndex + 1)
            ];
        });
    };

    const removeCol = (e: any, colIndex: number, rowIndex: number) => {
        setData(prev => {
            const updatedRow = {
                ...prev[rowIndex],
                children: prev[rowIndex].children.filter((_: any, index: number) => index !== colIndex)
            };

            return [
                ...prev.slice(0, rowIndex),
                updatedRow,
                ...prev.slice(rowIndex + 1)
            ];
        })
    ;}

    const removeEle = (id: string) => {
        setData(prev => {
            return prev.map(row => {
                return {
                    ...row,
                    children: row.children.map((col: any) => {
                        return {
                            ...col,
                            children: col.children.filter((ele: any) => ele.id !== id)
                        };
                    })
                };
            });
        })
    };

    const removeRow = (rowIndex: number) => {
        setData(prev => prev.filter((_, index: number) => index !== rowIndex));
    }

    const onDragStart = (e: any, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("Drag started", id);
        setDragging(id);
    }

    const onDragHover = (e: any, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("Drag hover: " + id);
        if (dragging) {
            setCurrentHoverEle("" + id);
        }
    }

    return (
        <div className="">
            <div className="flex w-[200%] transition duration-300" style={{ transform: currentEle === "none" ? "translateX(0%)" : "translateX(-50%)" }}>
                <div className="min-w-[50%] w-[50%]" >
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" px="24" pr="0" py="4" mt="32">
                        <Text fontSize="lg" fontWeight="600">Outline</Text>
                        <Box display="flex" alignItems="center" gap="2">
                            <Button onClick={() => setData(prev => [...prev, {label: "Row", id: "row-" + Date.now(), children: []}])} appearance="subtle" size="sm" aria-label="add row" icon={<IconPlus />} />
                        </Box>
                    </Box>
                    <Box fontSize="sm" className="text-[#66708C]">
                        {data.map((row: any, index: number) => (
                            <div key={index}>
                                {dragging?.startsWith("row-") && <div className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px]" onMouseEnter={(e) => onDragHover(e, row.id)} >
                                    <Box bg="bg.accent" rounded="full" className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-0" />
                                </div>}
                                <Row 
                                    onDragStart={(e: any) => onDragStart(e, row.id)} 
                                    removeRow={(e:any) => removeRow(index)} 
                                    addCol={(e: any) => addCol(e, index)} 
                                >
                                    {row.children && row.children.map((col: any, i: number) => 
                                    <div key={i}>
                                        {dragging?.startsWith("col-") && <div className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] ml-3 mr-0" onMouseEnter={(e) => onDragHover(e, col.id)} >
                                            <Box bg="bg.accent" rounded="full" className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-0" />
                                        </div>}
                                        <Col 
                                            onDragStart={(e: any) => onDragStart(e, col.id)} 
                                            removeCol={(e: any) => removeCol(e, i, index)} 
                                            addElement={(e: any, ) => addElement(e, i, index)} 
                                            key={"col" + i}
                                        >
                                            {col.children.map((element: any, j: number) => 
                                            <div
                                            key={"ele" + j} >
                                                {dragging && (!dragging.startsWith("col-") && !dragging.startsWith("row-")) && 
                                                    <div className="ind group h-[44px] mx-1 relative z-10 -my-[22px] pt-[20px] ml-8 mr-0" onMouseEnter={(e) => onDragHover(e, element.id)} >
                                                        <Box bg="bg.accent" rounded="full" className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-0" />
                                                    </div>
                                                }
                                                <Ele 
                                                    removeEle={(e: any) => removeEle(element.id)} 
                                                    onDragStart={(e: any) => onDragStart(e, element.id)} 
                                                    type={theEles[element.id].type} 
                                                    element={element} 
                                                    label={theEles[element.id]?.props[0]?.value || undefined} 
                                                    setCurrentEle={setCurrentEle} 
                                                    setCurrentHoverEle={setCurrentHoverEle}
                                                />
                                            </div>)}
                                            {dragging && (!dragging.startsWith("col-") && !dragging.startsWith("row-")) && 
                                                <div className="ind group h-[44px] mx-1 relative z-10 -my-[22px] pt-[20px] ml-8 mr-0" onMouseEnter={(e) => onDragHover(e, "last-ele-" + col.id)} >
                                                    <Box bg="bg.accent" rounded="full" className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-0" />
                                                </div>}
                                        </Col>
                                    </div>)}
                                    {dragging?.startsWith("col-") && <div className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px] ml-3" onMouseEnter={(e) => onDragHover(e, "col-last-" + row.id)} >
                                        <Box bg="bg.accent" rounded="full" className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-0" />
                                    </div>}
                                </Row>
                                
                            </div>
                        ))}   
                        
                        {dragging?.startsWith("row-") && <div className="ind group h-8 mx-1 relative z-10 -my-4 pt-[14px] -mr-[20px]" onMouseEnter={(e) => onDragHover(e, "row-last")} >
                            <Box bg="bg.accent" rounded="full" className="transition duration-500 h-[4px] group-hover:opacity-100 opacity-0" />
                        </div>}
                    </Box>
                </div>
                <div className="min-w-[50%] w-[50%]">
                    <Text fontSize="sm" px="24" pt="16" fontWeight="400" color="fg.accent" onClick={() => setCurrentEle("none")} className="cursor-pointer">{"<-"} Outline</Text> 
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" px="24" pr="0" py="4">
                        <Text fontSize="lg" fontWeight="600">{currentEle !== "none" ? theEles[currentEle]?.type || "" : ""}</Text>
                        <Box display="flex" alignItems="center" gap="8">
                            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 14.5C11.3125 14.5 13.4375 13.2812 14.625 11.25C15.7812 9.25 15.7812 6.78125 14.625 4.75C13.4375 2.75 11.3125 1.5 9 1.5C6.65625 1.5 4.53125 2.75 3.34375 4.75C2.1875 6.78125 2.1875 9.25 3.34375 11.25C4.53125 13.2812 6.65625 14.5 9 14.5ZM9 0C11.8438 0 14.4688 1.53125 15.9062 4C17.3438 6.5 17.3438 9.53125 15.9062 12C14.4688 14.5 11.8438 16 9 16C6.125 16 3.5 14.5 2.0625 12C0.625 9.53125 0.625 6.5 2.0625 4C3.5 1.53125 6.125 0 9 0ZM10 8C10 8.5625 9.53125 9 9 9C8.4375 9 8 8.5625 8 8C8 7.46875 8.4375 7 9 7C9.53125 7 10 7.46875 10 8ZM12 7C12.5312 7 13 7.46875 13 8C13 8.5625 12.5312 9 12 9C11.4375 9 11 8.5625 11 8C11 7.46875 11.4375 7 12 7ZM7 8C7 8.5625 6.53125 9 6 9C5.4375 9 5 8.5625 5 8C5 7.46875 5.4375 7 6 7C6.53125 7 7 7.46875 7 8Z" fill="#2E3442"/>
                            </svg>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5.5C9.65625 5.5 7.53125 6.75 6.34375 8.75C5.1875 10.7812 5.1875 13.25 6.34375 15.25C7.53125 17.2812 9.65625 18.5 12 18.5C14.3125 18.5 16.4375 17.2812 17.625 15.25C18.7812 13.25 18.7812 10.7812 17.625 8.75C16.4375 6.75 14.3125 5.5 12 5.5ZM12 20C9.125 20 6.5 18.5 5.0625 16C3.625 13.5312 3.625 10.5 5.0625 8C6.5 5.53125 9.125 4 12 4C14.8438 4 17.4688 5.53125 18.9062 8C20.3438 10.5 20.3438 13.5312 18.9062 16C17.4688 18.5 14.8438 20 12 20ZM11.25 14.75V12.75H9.25C8.8125 12.75 8.5 12.4375 8.5 12C8.5 11.5938 8.8125 11.25 9.25 11.25H11.25V9.25C11.25 8.84375 11.5625 8.5 12 8.5C12.4062 8.5 12.75 8.84375 12.75 9.25V11.25H14.75C15.1562 11.25 15.5 11.5938 15.5 12C15.5 12.4375 15.1562 12.75 14.75 12.75H12.75V14.75C12.75 15.1875 12.4062 15.5 12 15.5C11.5625 15.5 11.25 15.1875 11.25 14.75Z" fill="#4F576E"/>
                            </svg>
                        </Box>
                    </Box>
                    {theEles[currentEle]?.props?.map((prop: any, ind: number) => 
                        <Fragment key={ind}>
                        {prop.type === "text" && (
                            <Input prop={prop} propIndex={ind} onChange={onInputChange} />
                        )}
                        {prop.type === "checkbox" && (
                            <div className="p-6 pr-0 py-2">
                                <Checkbox
                                    checked={prop.value === "true" ? true : false}
                                    onChange={(e) => onInputChange(e.currentTarget.checked ? "true" : "false", ind)}
                                >{prop.label}</Checkbox>
                            </div>
                        )}
                        </Fragment>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function VBPrototype() {
    const onInputChange = (value: any, propIndex: number) => {
        if (currentEle !== "none" && currentEle in theEles) {
            setTheEles((prev: any) => {
                const oldProps = prev[currentEle as keyof typeof prev].props;
                const newProps = [...oldProps];
                newProps[propIndex] = { ...oldProps[propIndex], value: value };
                
                return {
                    ...prev,
                    [currentEle]: {
                        ...prev[currentEle as keyof typeof prev],
                        props: newProps
                    }
                };
            });
        }
    }

    const [dragging, setDragging] = useState<any>(null);
    const [cloning, setCloning] = useState<boolean>(false);

    const [currentEle, setCurrentEle] = useState<string>("none");
    const [currentHoverEle, setCurrentHoverEle] = useState<string>("none");
    const [theEles, setTheEles] = useState<any>({
        // "heading": {
        //     type: "Heading", 
        //     props: [
        //     {type: "text", label: "Text"},
        // ]},
        // "text": {"label": "Text", "type": "Text", props: [
        //     {type: "text", label: "Text"},
        // ]},
        // "first name": {"type": "Input", props: [
        //     {type: "text", label: "Label"},
        //     {type: "text", label: "Placeholder"},
        //     {type: "text", label: "Tooltip"},
        //     {type: "checkbox", label: "Required", value: false},
        // ]},
        // "last name": {"type": "Input", props: [
        //     {type: "text", label: "Label"},
        //     {type: "text", label: "Placeholder"},
        //     {type: "text", label: "Tooltip"},
        //     {type: "checkbox", label: "Required", value: false},
        // ]},
        // "email": {"type": "Input", props: [
        //     {type: "text", label: "Label"},
        //     {type: "text", label: "Placeholder"},
        //     {type: "text", label: "Tooltip"},
        //     {type: "checkbox", label: "Required", value: false},
        // ]},
        // "company": {"type": "Input", props: [
        //     {type: "text", label: "Label"},
        //     {type: "text", label: "Placeholder"},
        //     {type: "text", label: "Tooltip"},
        //     {type: "checkbox", label: "Required", value: false},
        // ]},
        // "job title": {"type": "Input", props: [
        //     {type: "text", label: "Label"},
        //     {type: "text", label: "Placeholder"},
        //     {type: "text", label: "Tooltip"},
        //     {type: "checkbox", label: "Required", value: false},
        // ]},
        // "products": {"type": "Input", props: [
        //     {type: "text", label: "Label"},
        //     {type: "text", label: "Placeholder"},
        //     {type: "text", label: "Tooltip"},
        //     {type: "checkbox", label: "Required", value: false},
        // ]},
        // "button": {"type": "Button", props: [
        //     {type: "text", label: "Label"},
        // ]}
    });

    const [data, setData] = useState<any[]>([
    ]);


    // Add escape key event listener
    useEffect(() => {

        const handleMouseUp = (e: MouseEvent) => {
            console.log("Mouse up, resetting dragging state");
            if (currentHoverEle !== "none" && dragging !== null && currentHoverEle !== dragging) {
                // If we are dragging and hovering over a different element, we need to update the data
                console.log(dragging, currentHoverEle);

                if (dragging.startsWith("row-") && currentHoverEle.startsWith("row-")) {
                    setData(prev => {
                        return prev.reduce((acc, row, idx) => {
                            if (row.id === dragging) {
                                return acc; // Skip the dragging row
                            }
                            if (row.id === currentHoverEle) {
                                return [...acc, prev.find(r => r.id === dragging)!, row]; // Insert dragging row above currentHoverEle
                            }
                            return [...acc, row];
                        }, []);
                    })
                    setCurrentHoverEle("none");
                } else if (dragging.startsWith("col-") && (currentHoverEle.startsWith("col-") && !currentHoverEle.startsWith("col-last"))) {
                    // Moving a column before another column in the same row
                    setData(prev => {
                        const updatedData = [...prev];
                
                        let sourceRow = null;
                        let targetRow = null;
                        let colA = null;
                
                        // Find the source row (where colA is)
                        for (const row of updatedData) {
                            const colIndex = row.children.findIndex((col:any) => col.id === dragging);
                            if (colIndex !== -1) {
                                sourceRow = row;
                                colA = row.children.splice(colIndex, 1)[0]; // remove colA
                                break;
                            }
                        }
                
                        if (!colA) {
                            console.warn("Column A not found.");
                            return updatedData;
                        }
                
                        // Find the target row (where colB is)
                        for (const row of updatedData) {
                            const colBIndex = row.children.findIndex((col:any) => col.id === currentHoverEle);
                            if (colBIndex !== -1) {
                                targetRow = row;
                
                                // If sourceRow and targetRow are the same, adjust index for removed A
                                const insertIndex = (sourceRow === targetRow && colBIndex > 0)
                                    ? colBIndex
                                    : colBIndex;
                
                                row.children.splice(insertIndex, 0, colA);
                                break;
                            }
                        }
                
                        if (!targetRow) {
                            console.warn("Column B not found.");
                            return updatedData;
                        }
                
                        return updatedData;
                    });
                    setCurrentHoverEle("none");
                } else if (dragging.startsWith("row-") && currentHoverEle.startsWith("row-last")) {
                    // If we are dragging an element and hovering over the last row, we need to add it to the last row
                    console.log("Moving element", dragging, "to the end of the last row");
                    setData(prev => {
                        const updatedData = [...prev];
                
                        const rowAIndex = updatedData.findIndex(row => row.id === dragging);
                        if (rowAIndex === -1) {
                            console.warn("Row A not found.");
                            return updatedData;
                        }
                
                        // Remove row A from its current position
                        const [rowA] = updatedData.splice(rowAIndex, 1);
                
                        // Push it to the end
                        updatedData.push(rowA);
                
                        return updatedData;
                    });
                    setCurrentHoverEle("none");
                } else if (dragging.startsWith("col-") && currentHoverEle.startsWith("col-last")) {
                    // If we are dragging an element and hovering over the last row, we need to add it to the last row
                    console.log("Moving element", dragging, "to the end of the last col");
                    setData(prev => {
                        const updatedData = [...prev];
                
                        // Extract row ID from target string (assuming "col-last-row-456" → "row-456")
                        const targetRowId = currentHoverEle.replace(/^col-last-/, '');
                
                        let colA = null;
                
                        // Step 1: Remove colA from its current row
                        for (const row of updatedData) {
                            const colIndex = row.children.findIndex((col: any) => col.id === dragging);
                            if (colIndex !== -1) {
                                colA = row.children.splice(colIndex, 1)[0];
                                break;
                            }
                        }
                
                        if (!colA) {
                            console.warn("Column A not found.");
                            return updatedData;
                        }
                
                        // Step 2: Find the target row
                        const targetRow = updatedData.find(row => row.id === targetRowId);
                        if (!targetRow) {
                            console.warn("Target row not found.");
                            return updatedData;
                        }
                
                        // Step 3: Add colA to the end of the target row
                        targetRow.children.push(colA);
                
                        return updatedData;
                    });
                    setCurrentHoverEle("none");
                } else if (
                    !dragging.startsWith("col-") &&
                    !dragging.startsWith("row-") && 
                    !currentHoverEle.startsWith("col-") && 
                    !currentHoverEle.startsWith("row-") &&
                    !currentHoverEle.startsWith("last-ele")) {
                        const newid = `${dragging}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                        setData(prev => {
                            const updatedData = [...prev];
                        
                            let draggedElement = null;
                        
                            // Find and remove (or find without removing if cloning) the dragged element
                            outerLoop:
                            for (const row of updatedData) {
                                for (const col of row.children) {
                                    const elementIndex = col.children.findIndex((ele: any) => ele.id === dragging);
                                    if (elementIndex !== -1) {
                                        if (cloning) {
                                            // Clone reference but do NOT remove original
                                            draggedElement = { ...col.children[elementIndex] };
                                        } else {
                                            // Move: remove the element
                                            draggedElement = col.children.splice(elementIndex, 1)[0];
                                        }
                                        break outerLoop;
                                    }
                                }
                            }
                        
                            if (!draggedElement) {
                                console.warn("Dragged element not found: ", dragging);
                                return updatedData;
                            }
                        
                            if (cloning) {
                        
                                // Clone the actual element in theEles and assign it the new id
                                const originalEle = theEles[dragging];
                                if (!originalEle) {
                                    console.warn("Original element not found in theEles: ", dragging);
                                    return updatedData;
                                }
                        
                                const newElementClone = { ...originalEle, id: newid };
                                setTheEles((prevEles: any) => ({
                                    ...prevEles,
                                    [newid]: newElementClone
                                }));
                        
                                // Update the reference used in Data
                                draggedElement.id = newid;
                            }
                        
                            // Find the target column and insert the (moved or cloned) element
                            outerInsertLoop:
                            for (const row of updatedData) {
                                for (const col of row.children) {
                                    const elementIndex = col.children.findIndex((ele: any) => ele.id === currentHoverEle);
                                    if (elementIndex !== -1) {
                                        // Check if the element is already present in the column
                                        const isAlreadyPresent = col.children.some((ele: any) => ele.id === draggedElement.id);
                                        if (!isAlreadyPresent) {
                                            col.children.splice(elementIndex, 0, draggedElement);
                                        }
                                        return updatedData;
                                    }
                                }
                            }
                        
                            console.warn("Target position not found.");
                            return updatedData;
                        });
                    setCurrentHoverEle("none");
                } else if (currentHoverEle.startsWith("last-ele")) {
                    // If we are dragging an element and hovering over the last element, we need to add it to the last column of the last row
                    console.log("Moving element", dragging, "to the end of the last ele");
                    const newid = `${dragging}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    setData(prev => {
                        const updatedData = [...prev];
                
                        // Extract column ID from target string (assuming "last-ele-col-456" → "col-456")
                        const targetColId = currentHoverEle.replace(/^last-ele-/, '');
                
                        let elementA = null;
                
                        // Step 1: Remove elementA from its current column
                        outerLoop:
                        for (const row of updatedData) {
                            for (const col of row.children) {
                                const eleIndex = col.children.findIndex((ele: any) => ele.id === dragging);
                                if (eleIndex !== -1) {
                                    if (cloning) {
                                        // Clone reference but do NOT remove original
                                        elementA = { ...col.children[eleIndex] };
                                    } else {
                                        // Move: remove the element
                                        elementA = col.children.splice(eleIndex, 1)[0];
                                    }
                                    break outerLoop;
                                }
                            }
                        }
                
                        if (!elementA) {
                            console.warn("Element A not found.");
                            return updatedData;
                        }
                
                        if (cloning) {
                            // Clone the actual element in theEles and assign it the new id
                            const originalEle = theEles[dragging];
                            if (!originalEle) {
                                console.warn("Original element not found in theEles: ", dragging);
                                return updatedData;
                            }
                
                            const newElementClone = { ...originalEle, id: newid };
                            setTheEles((prevEles: any) => ({
                                ...prevEles,
                                [newid]: newElementClone
                            }));
                
                            // Update the reference used in Data
                            elementA.id = newid;
                        }
                
                        // Step 2: Find the target column
                        let targetCol = null;
                        for (const row of updatedData) {
                            targetCol = row.children.find((col: any) => col.id === targetColId);
                            if (targetCol) break;
                        }
                
                        if (!targetCol) {
                            console.warn("Target column not found.");
                            return updatedData;
                        }
                
                        // Step 3: Add elementA to the end of the target column if not already present
                        const isAlreadyPresent = targetCol.children.some((ele: any) => ele.id === elementA.id);
                        if (!isAlreadyPresent) {
                            targetCol.children.push(elementA);
                        }
                
                        return updatedData;
                    });
                    setCurrentHoverEle("none");
                }

            }
            setDragging(null);
        };
        
        if (currentEle !== "none") {
            const firstInput = document.querySelector("input");
            if (firstInput) {
                firstInput.focus();
            }
        }

        window.addEventListener("mouseup", handleMouseUp);
      
        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === "Alt" && event.location === 1) {
                setCloning(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setCurrentEle("none");
                setCurrentHoverEle("none");
            } else if (event.key === "Alt" && event.location === 1) {
                setCloning(true);
            }
        };

        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [currentEle, dragging, currentHoverEle]);


    return (<div className="-mt-[72px] -ml-[24px] w-[calc(100vw-57px)] select-none">
        <Box bg="bg.page" w="full" className="grid grid-cols-[0fr_1fr] grid-rows-[0fr_1fr]">
            <Box bg="bg.default" borderB="1" borderColor="border.tertiary" gridColumn="2" px="24" py="12" display="flex" alignItems="center" gap="4" justifyContent="space-between">
                <Box gridColumn="2" display="flex" alignItems="center" gap="8"  >
                    <svg className="-translate-y-[2px]" width="21" height="17" viewBox="0 0 21 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.7812 2.875C17.4688 2.5625 17 2.5625 16.7188 2.875L16.0625 3.53125L17.5 4.96875L18.1562 4.28125C18.4375 4 18.4375 3.53125 18.1562 3.21875L17.7812 2.875ZM11.2188 8.40625C11.125 8.53125 11.0625 8.65625 11.0312 8.78125L10.7188 10.3438L12.25 10.0312C12.4062 10 12.5312 9.90625 12.625 9.8125L16.4375 6L15 4.59375L11.2188 8.40625ZM15.6562 1.8125C16.5312 0.9375 17.9375 0.90625 18.8438 1.8125L19.2188 2.1875C20.0938 3.0625 20.0938 4.46875 19.2188 5.34375L13.6875 10.875C13.375 11.1875 13 11.4062 12.5625 11.5L9.875 12.0312C9.65625 12.0938 9.375 12.0312 9.21875 11.8438C9.03125 11.6562 8.9375 11.4062 9 11.1562L9.5625 8.46875C9.65625 8.0625 9.875 7.65625 10.1562 7.375L15.6562 1.8125ZM2.25 5H8.25C8.65625 5 9 5.34375 9 5.75C9 6.1875 8.65625 6.5 8.25 6.5H2.25C1.8125 6.5 1.5 6.84375 1.5 7.25V14.75C1.5 15.1875 1.8125 15.5 2.25 15.5H15.75C16.1562 15.5 16.5 15.1875 16.5 14.75V10.75C16.5 10.3438 16.8125 10 17.25 10C17.6562 10 18 10.3438 18 10.75V14.75C18 16 16.9688 17 15.75 17H2.25C1 17 0 16 0 14.75V7.25C0 6.03125 1 5 2.25 5ZM4 12C3.4375 12 3 11.5625 3 11C3 10.4688 3.4375 10 4 10C4.53125 10 5 10.4688 5 11C5 11.5625 4.53125 12 4 12ZM8 11C8 11.5625 7.53125 12 7 12C6.4375 12 6 11.5625 6 11C6 10.4688 6.4375 10 7 10C7.53125 10 8 10.4688 8 11Z" fill="#2E3442"/>
                    </svg>
                    <Text fontSize="md" fontWeight="600">My Form</Text> 
                    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 14.5C11.3125 14.5 13.4375 13.2812 14.625 11.25C15.7812 9.25 15.7812 6.78125 14.625 4.75C13.4375 2.75 11.3125 1.5 9 1.5C6.65625 1.5 4.53125 2.75 3.34375 4.75C2.1875 6.78125 2.1875 9.25 3.34375 11.25C4.53125 13.2812 6.65625 14.5 9 14.5ZM9 0C11.8438 0 14.4688 1.53125 15.9062 4C17.3438 6.5 17.3438 9.53125 15.9062 12C14.4688 14.5 11.8438 16 9 16C6.125 16 3.5 14.5 2.0625 12C0.625 9.53125 0.625 6.5 2.0625 4C3.5 1.53125 6.125 0 9 0ZM10 8C10 8.5625 9.53125 9 9 9C8.4375 9 8 8.5625 8 8C8 7.46875 8.4375 7 9 7C9.53125 7 10 7.46875 10 8ZM12 7C12.5312 7 13 7.46875 13 8C13 8.5625 12.5312 9 12 9C11.4375 9 11 8.5625 11 8C11 7.46875 11.4375 7 12 7ZM7 8C7 8.5625 6.53125 9 6 9C5.4375 9 5 8.5625 5 8C5 7.46875 5.4375 7 6 7C6.53125 7 7 7.46875 7 8Z" fill="#2E3442"/>
</svg>

                    <Text fontSize="sm" fontWeight="500" px="8" py="2" className="rounded-full bg-[#D1F0E1] block text-[#24663E]">Auto saved</Text> 
                </Box>
                <Box gridColumn="2" display="flex" alignItems="center" gap="8">
                    <Button appearance="primary" size="lg">Publish</Button>
                </Box>
            </Box>
            <Box w="224" >
                <Outline
                    dragging={dragging}
                    setDragging={setDragging} 
                    currentHoverEle={currentHoverEle} 
                    setCurrentEle={setCurrentEle} 
                    data={data} 
                    setTheEles={setTheEles} 
                    setData={setData} 
                    currentEle={currentEle} 
                    theEles={theEles} 
                    onInputChange={onInputChange} 
                    setCurrentHoverEle={setCurrentHoverEle} /> 
            </Box>
            <div className="p-6 pt-3 flex items-stretch z-10">
                <div className="rounded-lg bg-white shadow-lg grow w-full" onClick={() => setCurrentEle("none")} style={{
                    background: "radial-gradient(112.7% 105.9% at 2.27% 5.46%, rgba(255, 0, 0, 0.10) 0%, rgba(0, 0, 0, 0.00) 100%), linear-gradient(180deg, #360041 0%, #002A3A 100%)"
                }}>
                    <div className="w-[500px] m-auto p-4 min-h-[80vh] pt-24">   
                    {data.map((row, index) => 
                        <section className="grid grid-flow-col auto-cols-fr gap-4 text-white" key={index}>
                            {row.children.map((col: any, colIndex: any) => 
                                <div key={"col" + colIndex}>
                                    {col.children.map((element: any, eleIndex: any) => 
                                        <div key={"ele" + eleIndex} className="relative group">
                                            <div onClick={(e) => { e.stopPropagation(); setCurrentEle(element.id); setCurrentHoverEle("none") }} style={{
                                                visibility: (currentEle === element.id || currentHoverEle === element.id) ?     "visible" : undefined,
                                                opacity:    (currentEle === element.id || currentHoverEle === element.id) ?     (currentEle === element.id ? 1 : .5) : undefined,
                                                top:        (currentEle === element.id || currentHoverEle === element.id) ?     "-8px" : undefined,
                                                left:       (currentEle === element.id || currentHoverEle === element.id) ?     "-8px" : undefined,
                                                right:      (currentEle === element.id || currentHoverEle === element.id) ?     "-8px" : undefined,
                                                bottom:     (currentEle === element.id || currentHoverEle === element.id) ?     "-8px" : undefined
                                            }} className="cursor-pointer group-hover:visible group-hover:-left-2 group-hover:-top-2 group-hover:-right-2 group-hover:-bottom-2 group-hover:opacity-50 transition-all duration-100 invisible opacity-0 absolute border border-2 -left-1 -top-1 -right-1 -bottom-1 z-10 border-[#0037FF] rounded-[4px] rounded-tl-none">
                                                <div className="bg-[#0037FF] flex gap-1 items-center text-white text-[9px] absolute px-2 py-[3px] rounded-[4px] -top-5 -left-[2px] rounded-b-none">{(() => {
                            switch (theEles[element.id]?.type) {
                                case "Heading":
                                    return <IconHeading size={12} />
                                    ;
                                case "Text":
                                    return <IconPilcrow size={12} />
                                    ;
                                case "Input":
                                    return <IconForms size={12} />
                                    ;
                                case "Button":
                                    return <IconRectangle size={12} />
                                    ;
                                default:
                                    return <IconBrackets size={12} />
                                    ;
                            }
                        })()}{theEles[element.id]?.type}</div>
                                            </div>
                                            {(() => {
                            switch (theEles[element.id]?.type) {
                                case "Heading":
                                    return <h1 className="text-3xl mb-5 font-bold">{theEles[element.id]?.props.find((prop: any) => prop.label === "Text")?.value || <>&nbsp;</>}</h1>
                                    ;
                                case "Text":
                                    return <p className="mb-2">{theEles[element.id]?.props.find((prop: any) => prop.label === "Text")?.value || <>&nbsp;</>}</p>
                                    ;
                                case "Input":
                                    return <div className="group relative mt-4">
                                        {theEles[element.id]?.props.find((prop: any) => prop.label === "Tooltip")?.value && 
                                        
                                            <div className="text-sm group-hover:opacity-100 group-hover:scale-100 group-hover:delay-1000 delay-0 group-hover:visible group-hover:-translate-y-2 opacity-0 text-center invisible absolute left-1/2 -translate-x-1/2 bottom-10 scale-90 shadow-lg transition-[.3s] px-2 py-1 rounded-md bg-[#000] text-white">
                                                {theEles[element.id]?.props.find((prop: any) => prop.label === "Tooltip")?.value}
                                            </div>
                                        }
                                            <label>
                                                {theEles[element.id]?.props.find((prop: any) => prop.label === "Label")?.value || <>&nbsp;</>}
                                                {theEles[element.id]?.props.find((prop: any) => prop.label === "Required")?.value === "true" && <span className="text-[#ff5500]"> *</span>}
                                            </label>
                                            <input type="text" placeholder={theEles[element.id]?.props.find((prop: any) => prop.label === "Placeholder")?.value || null} className="border border-[#ffffff22] rounded-[6px] p-2 w-full bg-[#ffffff11] placeholder:text-[#ffffff66]" />
                                        </div>
                                    ;
                                case "Button":
                                    return <div className="text-right mt-4">
                                        <div className="rounded bg-[#6846FF] px-5 py-3 text-center text-white font-bold inline-block">{theEles[element.id]?.props.find((prop: any) => prop.label === "Label")?.value || <>&nbsp;</>}</div>
                                    </div>
                                    ;
                                default:
                                    return <svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.75 1H7.25C7.65625 1 8 1.34375 8 1.75C8 2.1875 7.65625 2.5 7.25 2.5H5.75C5.03125 2.5 4.5 3.0625 4.5 3.75V5.1875C4.5 5.90625 4.1875 6.625 3.6875 7.125L2.78125 8L3.6875 8.90625C4.1875 9.40625 4.5 10.125 4.5 10.8438V12.25C4.5 12.9688 5.03125 13.5 5.75 13.5H7.25C7.65625 13.5 8 13.8438 8 14.25C8 14.6875 7.65625 15 7.25 15H5.75C4.21875 15 3 13.7812 3 12.25V10.8438C3 10.5 2.84375 10.1875 2.625 9.96875L1.21875 8.53125C0.90625 8.25 0.90625 7.78125 1.21875 7.46875L2.625 6.0625C2.84375 5.84375 3 5.53125 3 5.1875V3.75C3 2.25 4.21875 1 5.75 1ZM14.25 1C15.75 1 17 2.25 17 3.75V5.1875C17 5.53125 17.125 5.84375 17.3438 6.0625L18.7812 7.5C19.0625 7.78125 19.0625 8.25 18.7812 8.53125L17.3438 9.96875C17.125 10.1875 17 10.5 17 10.8438V12.25C17 13.7812 15.75 15 14.25 15H12.75C12.3125 15 12 14.6875 12 14.25C12 13.8438 12.3125 13.5 12.75 13.5H14.25C14.9375 13.5 15.5 12.9688 15.5 12.25V10.8438C15.5 10.125 15.7812 9.40625 16.2812 8.90625L17.1875 8L16.2812 7.125C15.7812 6.625 15.5 5.90625 15.5 5.1875V3.75C15.5 3.0625 14.9375 2.5 14.25 2.5H12.75C12.3125 2.5 12 2.1875 12 1.75C12 1.34375 12.3125 1 12.75 1H14.25Z" fill="currentColor"/>
                                    </svg>
                                    ;
                            }
                        })()}
                                        </div>)}
                                </div>)}
                        </section>
                    )}
                    </div>
                </div>
            </div>
        </Box>
      </div>
  );
}
