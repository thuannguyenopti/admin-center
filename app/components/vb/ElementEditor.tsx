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
    <div className=" pr-0 py-2">
      <Field label={prop.label}>
        <AxiomInput placeholder={prop.placeholder || ""} value={prop.value || ""} onChange={(e: any) => onChange(e.currentTarget.value, propIndex)} />
      </Field>
    </div>
  );
};

export default function ElementEditor({ currentEle, elementType, propsList, onBack, onInputChange }: Props) {
  return (
    <div className="flex-none w-full pt-4">
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
