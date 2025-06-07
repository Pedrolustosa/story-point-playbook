
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:mt-1",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:rounded group-[.toast]:text-sm group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted/80 group-[.toast]:px-3 group-[.toast]:py-1 group-[.toast]:rounded group-[.toast]:text-sm",
          success: 
            "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200 group-[.toaster]:text-green-800 dark:group-[.toaster]:bg-green-950 dark:group-[.toaster]:border-green-800 dark:group-[.toaster]:text-green-100",
          error: 
            "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200 group-[.toaster]:text-red-800 dark:group-[.toaster]:bg-red-950 dark:group-[.toaster]:border-red-800 dark:group-[.toaster]:text-red-100",
          warning: 
            "group-[.toaster]:bg-yellow-50 group-[.toaster]:border-yellow-200 group-[.toaster]:text-yellow-800 dark:group-[.toaster]:bg-yellow-950 dark:group-[.toaster]:border-yellow-800 dark:group-[.toaster]:text-yellow-100",
          info: 
            "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-800 dark:group-[.toaster]:bg-blue-950 dark:group-[.toaster]:border-blue-800 dark:group-[.toaster]:text-blue-100"
        },
      }}
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      {...props}
    />
  )
}

export { Toaster, toast }
