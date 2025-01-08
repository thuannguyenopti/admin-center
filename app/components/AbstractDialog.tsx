'use client';

import { 
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Dialog,
  DialogHeader,
  DialogClose,
  DialogDescription,
  } from "@optiaxiom/react"

import { ReactNode } from "react"

export default function AbstractDialog({
  title, 
  description, 
  open, 
  setOpen, 
  children, 
  size = "sm", 
  footerPrimaryText = "Close",  
  footerPrimaryAction = () => setOpen(false),
  footerAppearance,
  footerSecondaryText
}: {
  size?: "sm" | "md" | "lg" | "fullscreen" | undefined, 
  title: string, 
  description: string, 
  open: boolean, 
  setOpen: any, 
  children?: ReactNode, 
  footerPrimaryText?: string, 
  footerPrimaryAction?: () => void,
  footerAppearance?: "default" | "danger" | "primary" | "subtle" | "inverse" | "danger-outline" | undefined,
  footerSecondaryText?: string}) {

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
        <DialogContent 
          size={size}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          {children}
        </DialogBody>
        <DialogFooter>
          {footerSecondaryText && <DialogClose size="lg">{footerSecondaryText}</DialogClose>}
          {footerPrimaryText && <DialogClose onClick={() => footerPrimaryAction()} appearance={footerAppearance} size="lg">{footerPrimaryText}</DialogClose>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
