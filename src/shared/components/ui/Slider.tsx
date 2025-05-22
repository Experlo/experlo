"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Inline cn function until utils are properly configured
const cn = (...inputs: any[]) => twMerge(clsx(inputs))

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
      <SliderPrimitive.Range className="absolute h-full bg-indigo-600" />
    </SliderPrimitive.Track>
    {props.value?.map((_, i: number) => (
      <SliderPrimitive.Thumb
        key={i}
        className="block h-4 w-4 rounded-full border border-indigo-600 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
      />
    ))}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
