import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Printer } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-200",
        clasico:
          "px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm text-gray-800",
        imprimir: 
          "px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-300 rounded hover:bg-gray-100 shadow-sm text-gray-800 gap-1",
        
        // 👇 NUEVA VARIANTE: SUBMIT / ACEPTAR
        submit: 
          "bg-[#006699] text-white px-4 py-1.5 rounded text-[11px] hover:bg-blue-800 font-bold disabled:opacity-50 shadow-sm",
        
        // 👇 NUEVA VARIANTE: CANCELAR
        cancelar: 
          "bg-white border border-gray-400 px-4 py-1.5 rounded text-[11px] hover:bg-gray-100 text-gray-800 shadow-sm",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  onClick,
  children,
  type, // Extraemos type para manejar submits
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  const handleClick = (e: any) => {
    // Lógica para Imprimir
    if (variant === "imprimir") {
      window.print();
    }
    

    if (variant === "cancelar") {

      e.preventDefault(); 

      window.history.back(); 
    }

    if (onClick) {
      onClick(e);
    }
  }

  const renderChildren = () => {
    if (variant === "imprimir" && !asChild) {
      return (
        <>
          {children || "Imprimir"}
        </>
      )
    }
    // Si es submit y no tiene hijos, por defecto dirá "Aceptar"
    if (variant === "submit" && !children && !asChild) {
      return "Aceptar";
    }
    // Si es cancelar y no tiene hijos, por defecto dirá "Cancelar"
    if (variant === "cancelar" && !children && !asChild) {
      return "Cancelar";
    }
    
    return children;
  }

  // Si la variante es 'submit', forzamos el type html a 'submit'
  const buttonType = variant === 'submit' ? 'submit' : (type || 'button');

  return (
    <Comp
      type={buttonType}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    >
      {renderChildren()}
    </Comp>
  )
}

export { Button, buttonVariants }