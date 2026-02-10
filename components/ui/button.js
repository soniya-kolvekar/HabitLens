import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

const Button = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
    const variants = {
        default: "bg-white text-purple-800 hover:bg-white/90 shadow-lg",
        ghost: "text-white/80 hover:text-white hover:bg-white/10",
    }

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                className
            )}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }
