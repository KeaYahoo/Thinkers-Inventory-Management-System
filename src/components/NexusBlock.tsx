import { ElementType, ReactNode } from "react";

type NexusBlockProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function NexusBlock<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...rest
}: NexusBlockProps<T>) {
  const Component = as ?? "div";
  return (
    <Component className={`nexus-block ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
}

