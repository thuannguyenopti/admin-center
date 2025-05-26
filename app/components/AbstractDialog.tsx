'use client';

import { 
  DialogContent,
  DialogBody,
  DialogFooter,
  Dialog,
  DialogHeader,
  DialogClose,
  AlertDialog,
  AlertDialogBody,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  } from "@optiaxiom/react"

import { ReactNode } from "react"

export default function AbstractDialog({
  isAlert,
  title, 
  description, 
  open, 
  setOpen, 
  children, 
  size = "sm", 
  footerPrimaryText = "Close",  
  footerPrimaryAction = () => setOpen(false),
  footerAppearance,
  footerSecondaryText = "Cancel"
}: {
  isAlert?: boolean,
  size?: "sm" | "md" | "lg" | undefined, 
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
    <>
    {isAlert ?
    <AlertDialog
    open={open}
    onOpenChange={setOpen}>
      <AlertDialogContent 
        size={size}>
      <AlertDialogHeader>{title}</AlertDialogHeader>
      <AlertDialogBody>
        {description}
      </AlertDialogBody>
      <AlertDialogFooter>
        <AlertDialogCancel />
        <AlertDialogAction onClick={() => footerPrimaryAction()}>
          {footerPrimaryText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
    : 
    <Dialog
      open={open}
      onOpenChange={setOpen}>
        <DialogContent 
          size={size}>
        <DialogHeader>
          <DialogHeader description={description}>{title}</DialogHeader>
        </DialogHeader>
        <DialogBody>
          {children}
        </DialogBody>
        <DialogFooter>
          {footerSecondaryText && <DialogClose size="lg">{footerSecondaryText}</DialogClose>}
          {footerPrimaryText && <DialogClose onClick={() => footerPrimaryAction()} appearance={footerAppearance} size="lg">{footerPrimaryText}</DialogClose>}
        </DialogFooter>
      </DialogContent>
    </Dialog>}
    </>
  );
}
