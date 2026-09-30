import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("brand-gradient-subtle animate-pulse rounded-md border border-white/5 bg-white/5", className)}
      {...props}
    />
  )
}

export { Skeleton }
