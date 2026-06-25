"use client"

import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  direction,
  orientation,
  ...props
}: ResizablePrimitive.GroupProps & { direction?: "horizontal" | "vertical", orientation?: "horizontal" | "vertical" }) {
  const finalDirection = direction || orientation || "horizontal";
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      direction={finalDirection}
      orientation={finalDirection}
      className={cn(
        "flex h-full w-full",
        finalDirection === "vertical" ? "flex-col" : "",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  direction,
  orientation,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
  direction?: "horizontal" | "vertical";
  orientation?: "horizontal" | "vertical";
}) {
  const isVertical = direction === "vertical" || orientation === "vertical";
  
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        isVertical ? "h-px w-full after:left-0 after:h-1 after:w-full after:translate-x-0 after:-translate-y-1/2" : "",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className={cn("z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border", isVertical ? "rotate-90" : "")} />
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
