
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 md:h-11 w-full rounded-lg border-2 border-gray-300 bg-background px-4 py-3 text-base md:text-sm font-medium ring-offset-background placeholder:text-muted-foreground focus:border-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 active:border-orange-500 transition-all duration-150 shadow-sm hover:bg-amber-50/60 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
