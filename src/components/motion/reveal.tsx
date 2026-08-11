"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

type RevealElement = "article" | "div" | "footer" | "header" | "li";

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: RevealElement;
  children: ReactNode;
  delay?: number;
}

const callbacks = new Map<Element, () => void>();
let observer: IntersectionObserver | undefined;

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10%", threshold: 0.12 },
  );

  return observer;
}

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  style,
  ...props
}: RevealProps) {
  const elementRef = useRef<HTMLElement>(null);
  const Element = as as ElementType;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      element.dataset.reveal = "visible";
      return;
    }

    element.dataset.reveal = "pending";
    callbacks.set(element, () => {
      element.dataset.reveal = "visible";
    });
    getObserver().observe(element);

    return () => {
      callbacks.delete(element);
      observer?.unobserve(element);
    };
  }, []);

  return (
    <Element
      {...props}
      ref={elementRef}
      className={["motion-reveal", className].filter(Boolean).join(" ")}
      style={
        {
          "--motion-delay": `${delay}ms`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Element>
  );
}
