"use client";

import React, { Fragment } from "react";
import { Box, Field, Text, Input as AxiomInput, Checkbox, Heading } from "@optiaxiom/react";

type Props = {
  currentEle: string;
  elementType: string;
  propsList?: any[];
  onBack: () => void;
  onInputChange: (value: any, propIndex: number) => void;
};

const Input: React.FC<{ prop: any; onChange: any; propIndex: number }> = ({ prop, onChange, propIndex }) => {
  return (
    <div className="p-6 pr-0 py-2">
      <Field label={prop.label}>
        <AxiomInput placeholder={prop.placeholder || ""} value={prop.value || ""} onChange={(e: any) => onChange(e.currentTarget.value, propIndex)} />
      </Field>
    </div>
  );
};

export default function ElementEditor({ currentEle, elementType, propsList, onBack, onInputChange }: Props) {
  return (
    <div className="min-w-[50%] w-[50%] pt-4">
      <Text fontSize="sm" fontWeight="400" color="fg.accent" onClick={onBack} className="cursor-pointer">
        {"<-"} Outline
      </Text>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap="8" pr="0" py="4">
        <Heading level="4">
          {elementType}
        </Heading>
        <Box display="flex" alignItems="center" gap="8">
          <Box color="fg.default">
            <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 14.5C11.3125 14.5 13.4375 13.2812 14.625 11.25C15.7812 9.25 15.7812 6.78125 14.625 4.75C13.4375 2.75 11.3125 1.5 9 1.5C6.65625 1.5 4.53125 2.75 3.34375 4.75C2.1875 6.78125 2.1875 9.25 3.34375 11.25C4.53125 13.2812 6.65625 14.5 9 14.5ZM9 0C11.8438 0 14.4688 1.53125 15.9062 4C17.3438 6.5 17.3438 9.53125 15.9062 12C14.4688 14.5 11.8438 16 9 16C6.125 16 3.5 14.5 2.0625 12C0.625 9.53125 0.625 6.5 2.0625 4C3.5 1.53125 6.125 0 9 0ZM10 8C10 8.5625 9.53125 9 9 9C8.4375 9 8 8.5625 8 8C8 7.46875 8.4375 7 9 7C9.53125 7 10 7.46875 10 8ZM12 7C12.5312 7 13 7.46875 13 8C13 8.5625 12.5312 9 12 9C11.4375 9 11 8.5625 11 8C11 7.46875 11.4375 7 12 7ZM7 8C7 8.5625 6.53125 9 6 9C5.4375 9 5 8.5625 5 8C5 7.46875 5.4375 7 6 7C6.53125 7 7 7.46875 7 8Z" fill="currentColor" />
            </svg>
          </Box>
          <Box color="fg.secondary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5.5C9.65625 5.5 7.53125 6.75 6.34375 8.75C5.1875 10.7812 5.1875 13.25 6.34375 15.25C7.53125 17.2812 9.65625 18.5 12 18.5C14.3125 18.5 16.4375 17.2812 17.625 15.25C18.7812 13.25 18.7812 10.7812 17.625 8.75C16.4375 6.75 14.3125 5.5 12 5.5ZM12 20C9.125 20 6.5 18.5 5.0625 16C3.625 13.5312 3.625 10.5 5.0625 8C6.5 5.53125 9.125 4 12 4C14.8438 4 17.4688 5.53125 18.9062 8C20.3438 10.5 20.3438 13.5312 18.9062 16C17.4688 18.5 14.8438 20 12 20ZM11.25 14.75V12.75H9.25C8.8125 12.75 8.5 12.4375 8.5 12C8.5 11.5938 8.8125 11.25 9.25 11.25H11.25V9.25C11.25 8.84375 11.5625 8.5 12 8.5C12.4062 8.5 12.75 8.84375 12.75 9.25V11.25H14.75C15.1562 11.25 15.5 11.5938 15.5 12C15.5 12.4375 15.1562 12.75 14.75 12.75H12.75V14.75C12.75 15.1875 12.4062 15.5 12 15.5C11.5625 15.5 11.25 15.1875 11.25 14.75Z" fill="currentColor" />
            </svg>
          </Box>
        </Box>
      </Box>

      {propsList?.map((prop: any, ind: number) => (
        <Fragment key={ind}>
          {prop.type === "text" && <Input prop={prop} propIndex={ind} onChange={onInputChange} />}
          {prop.type === "checkbox" && (
            <div className="p-6 pr-0 py-2">
              <Checkbox checked={prop.value === "true" ? true : false} onChange={(e: any) => onInputChange(e.currentTarget.checked ? "true" : "false", ind)}>
                {prop.label}
              </Checkbox>
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
