"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

/*
 * Every kind of layer that can float above a dialog.
 *
 * A popover or a dropdown menu is positioned by Radix's popper and lands in
 * `[data-radix-popper-content-wrapper]`. A select does not: it defaults to
 * `position="item-aligned"`, which skips the popper entirely and portals a bare
 * `role="listbox"` to the end of the body. Matching only the wrapper — as this
 * did — therefore missed every select in the portal, which is most of them.
 */
const LAYERS = [
  "[data-radix-popper-content-wrapper]",
  '[role="listbox"]',
  '[role="menu"]',
  '[data-slot="select-content"]',
].join(",")

/*
 * A select, dropdown or popover opened inside a dialog is portalled to the end
 * of the body, so it sits outside the dialog in the DOM even though it is
 * plainly inside it on screen. Radix would read a click on one as a click
 * outside the dialog and close the whole thing, losing the form. Anything
 * within a popper is therefore treated as inside.
 *
 * The click has to be read from `detail.originalEvent`: these events are
 * dispatched on the dialog, so their own `target` is the dialog every time and
 * would never match.
 */
function isInsidePopper(event: {
  target: EventTarget | null
  detail?: { originalEvent?: Event }
}): boolean {
  const target = event.detail?.originalEvent?.target ?? event.target

  return target instanceof Element && target.closest(LAYERS) !== null
}

/**
 * Was a dropdown open when the pointer went down?
 *
 * The guard above catches a click *on* an open list. It does not catch the
 * commoner gesture: a list is open, and you click somewhere else to get rid of
 * it. That click dismisses the list and then reaches the dialog, which reads it
 * as a click outside itself and closes — taking a half-typed voucher with it.
 *
 * By the time the dialog's handler runs the list has already gone from the DOM,
 * so the question cannot be asked then. This records the answer during the
 * capture phase, which runs before any of Radix's dismissal handling, and the
 * handlers below read what it recorded. One click closes the list; the dialog
 * stays, and the next click outside closes the dialog as usual.
 */
function usePopperWasOpen() {
  const wasOpen = React.useRef(false)

  React.useEffect(() => {
    const record = () => {
      wasOpen.current = document.querySelector(LAYERS) !== null
    }

    document.addEventListener("pointerdown", record, true)
    document.addEventListener("keydown", record, true)

    return () => {
      document.removeEventListener("pointerdown", record, true)
      document.removeEventListener("keydown", record, true)
    }
  }, [])

  return wasOpen
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onPointerDownOutside,
  onInteractOutside,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const popperWasOpen = usePopperWasOpen()

  /** True when this interaction's only job was to dismiss a dropdown. */
  const dismissedAPopper = (event: {
    target: EventTarget | null
    detail?: { originalEvent?: Event }
  }) => isInsidePopper(event) || popperWasOpen.current

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        onPointerDownOutside={(event) => {
          if (dismissedAPopper(event)) {
            event.preventDefault()
            return
          }

          onPointerDownOutside?.(event)
        }}
        onInteractOutside={(event) => {
          if (dismissedAPopper(event)) {
            event.preventDefault()
            return
          }

          onInteractOutside?.(event)
        }}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
            >
              <XIcon
              />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
