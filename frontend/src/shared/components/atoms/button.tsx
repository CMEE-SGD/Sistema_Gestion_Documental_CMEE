import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Printer } from "lucide-react"

import { cn } from "../../utils/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
  {
    variants: {
      variant: {
        // Variante Principal (Botones de Crear/Guardar)
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        // Variante Secundaria (Botones de Cancelar/Atrás)
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm",
        // Variante Destructiva (Botones de Eliminar/Desactivar)
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        // Variante Sutil (Para tablas o acciones rápidas)
        ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-600",
        
        // Mantenemos tus variantes personalizadas para compatibilidad, pero ajustamos estilos
        clasico: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm",
        imprimir: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm",
        submit: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        cancelar: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
  type, 
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  const handleClick = (e: any) => {
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
    if (variant === "imprimir" && !asChild && !children) return <><Printer className="w-4 h-4" /> Imprimir</>;
    if (variant === "submit" && !children && !asChild) return "Guardar";
    if (variant === "cancelar" && !children && !asChild) return "Cancelar";
    return children;
  }

  const buttonType = variant === 'submit' ? 'submit' : (type || 'button');

  return (
    <Comp
      type={buttonType}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    >
      {renderChildren()}
    </Comp>
  )
}

export { Button, buttonVariants }