"use client"

import { clx } from "@medusajs/ui"
import { Dialog as RadixDialog } from "radix-ui"
import * as React from "react"

/**
 * @prop defaultOpen - Whether the modal is opened by default.
 * @prop open - Whether the modal is opened.
 * @prop onOpenChange - A function to handle when the modal is opened or closed.
 */
interface EditorModalRootProps
  extends React.ComponentPropsWithoutRef<typeof RadixDialog.Root> {}

/**
 * This component is based on the [Radix UI Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) primitives.
 */
const EditorModalRoot = (props: EditorModalRootProps) => {
  return <RadixDialog.Root {...props} />
}
EditorModalRoot.displayName = "EditorModal"

interface EditorModalTriggerProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Trigger> {}

/**
 * This component is used to create the trigger button that opens the modal.
 * It accepts props from the [Radix UI Dialog Trigger](https://www.radix-ui.com/primitives/docs/components/dialog#trigger) component.
 */
const EditorModalTrigger = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Trigger>,
  EditorModalTriggerProps
>((props: EditorModalTriggerProps, ref) => {
  return <RadixDialog.Trigger ref={ref} {...props} />
})
EditorModalTrigger.displayName = "EditorModal.Trigger"

// /**
//  * This component is used to create the close button for the modal.
//  * It accepts props from the [Radix UI Dialog Close](https://www.radix-ui.com/primitives/docs/components/dialog#close) component.
//  */
// const EditorModalClose = RadixDialog.Close
// EditorModalClose.displayName = "EditorModal.Close"

interface EditorModalPortalProps extends RadixDialog.DialogPortalProps {}

/**
 * The `EditorModal.Content` component uses this component to wrap the modal content.
 * It accepts props from the [Radix UI Dialog Portal](https://www.radix-ui.com/primitives/docs/components/dialog#portal) component.
 */
const EditorModalPortal = (props: EditorModalPortalProps) => {
  return (
    <RadixDialog.DialogPortal {...props} />
  )
}
EditorModalPortal.displayName = "EditorModal.Portal"

/**
 * This component is used to create the overlay for the modal.
 * It accepts props from the [Radix UI Dialog Overlay](https://www.radix-ui.com/primitives/docs/components/dialog#overlay) component.
 */
const EditorModalOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <RadixDialog.Overlay
      ref={ref}
      className={clx(
        "bg-ui-bg-overlay fixed inset-0",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
})
EditorModalOverlay.displayName = "EditorModal.Overlay"

/**
 * This component wraps the content of the modal.
 * It accepts props from the [Radix UI Dialog Content](https://www.radix-ui.com/primitives/docs/components/dialog#content) component.
 */
const EditorModalContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
    overlayProps?: React.ComponentPropsWithoutRef<typeof EditorModalOverlay>
    portalProps?: React.ComponentPropsWithoutRef<typeof EditorModalPortal>
  }
>(({ className, overlayProps, portalProps, ...props }, ref) => {
  return (
    <EditorModalPortal {...portalProps}>
      <EditorModalOverlay {...overlayProps} />
      <RadixDialog.Content
        ref={ref}
        className={clx(
          "bg-ui-bg-subtle shadow-elevation-modal fixed inset-2 flex flex-col overflow-hidden rounded-lg border outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-in-from-bottom-2  duration-200",
          className
        )}
        {...props}
      />
    </EditorModalPortal>
  )
})
EditorModalContent.displayName = "EditorModal.Content"

/**
 * This component is used to wrap the header content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const EditorModalHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(
        "border-ui-border-base flex items-center justify-between gap-x-4 border-b",
        className
      )}
      {...props}
    >
      {/* <div className="flex items-center gap-x-2">
        <RadixDialog.Close asChild>
          <IconButton size="small" type="button" variant="transparent">
            <XMark />
          </IconButton>
        </RadixDialog.Close>
      </div> */}
      {children}
    </div>
  )
})
EditorModalHeader.displayName = "EditorModal.Header"

/**
 * This component is used to wrap the footer content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const EditorModalFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(
        "border-ui-border-base flex items-center justify-end gap-x-2 border-t p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
EditorModalFooter.displayName = "EditorModal.Footer"

interface EditorModalTitleProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Title> {}

/**
 * This component adds an accessible title to the modal.
 * It accepts props from the [Radix UI Dialog Title](https://www.radix-ui.com/primitives/docs/components/dialog#title) component.
 */
const EditorModalTitle = React.forwardRef<
  HTMLHeadingElement,
  EditorModalTitleProps
>(({ className, ...props }: EditorModalTitleProps, ref) => {
  return (
    <RadixDialog.Title ref={ref} {...props} />
  )
})
EditorModalTitle.displayName = "EditorModal.Title"

/**
 * This component adds accessible description to the modal.
 * It accepts props from the [Radix UI Dialog Description](https://www.radix-ui.com/primitives/docs/components/dialog#description) component.
 */
const EditorModalDescription = RadixDialog.Description
EditorModalDescription.displayName = "EditorModal.Description"

/**
 * This component is used to wrap the body content of the modal.
 * This component is based on the `div` element and supports all of its props
 */
const EditorModalBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={clx("flex-1", className)} {...props} />
})
EditorModalBody.displayName = "EditorModal.Body"

const EditorModal = Object.assign(EditorModalRoot, {
  Trigger: EditorModalTrigger,
  Title: EditorModalTitle,
  Description: EditorModalDescription,
  Content: EditorModalContent,
  Header: EditorModalHeader,
  Body: EditorModalBody,
  // Close: EditorModalClose,
  Footer: EditorModalFooter,
})

export { EditorModal } 