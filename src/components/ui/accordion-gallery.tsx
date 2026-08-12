"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";

import "./accordion-gallery.css";

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items: readonly AccordionGalleryItem[];
  ariaLabel: string;
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

export function AccordionGallery({
  items,
  ariaLabel,
  defaultIndex = 0,
  accentColor = "#bc8d3e",
  overlayColor = "#080909",
  textColor = "#f5f5f5",
  height = 420,
  gap = 8,
  radius = 3,
  expandRatio = 0.5,
  orientation = "horizontal",
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.25,
  tilt = 3,
  stagger = 0.06,
  trigger = "hover",
  showLabels = true,
  grayscale = false,
  className = "",
}: AccordionGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);
  const [prefersReduced, setPrefersReduced] = useState(false);

  const vertical = orientation === "vertical";
  const count = items.length;
  const initialIndex = count
    ? Math.min(Math.max(defaultIndex, 0), count - 1)
    : 0;
  const [active, setActive] = useState(initialIndex);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReduced(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length || !count) return;

      const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = (ratio * (count - 1)) / (1 - ratio);
      const mediaSize = mediaSizeRef.current;
      const effectiveTilt = prefersReduced ? 0 : tilt;
      const effectiveParallax = prefersReduced ? 0 : parallax;

      timelineRef.current?.kill();

      const timeline = gsap.timeline();
      const animationDuration = animate && !prefersReduced ? duration : 0;

      panels.forEach((panel, index) => {
        if (!panel) return;

        const isActive = index === active;
        const media = mediaRefs.current[index];
        const bar = barRefs.current[index];
        const text = textRefs.current[index];
        const rotation = isActive
          ? 0
          : index < active
            ? effectiveTilt
            : -effectiveTilt;
        const rotationProperties = vertical
          ? { rotateX: -rotation }
          : { rotateY: rotation };

        timeline.to(
          panel,
          {
            flexGrow: isActive ? grow : 1,
            ...rotationProperties,
            duration: animationDuration,
            ease,
          },
          0,
        );

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - index));
          const shift = drift * effectiveParallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;

          timeline.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              "--ag-gray": gray,
              "--ag-dim": isActive ? 0 : 0.14,
              duration: animationDuration,
              ease,
            },
            0,
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            timeline.to(
              [bar, text],
              {
                opacity: 1,
                x: 0,
                duration: animationDuration,
                ease,
                stagger: prefersReduced ? 0 : stagger,
              },
              0,
            );
          } else {
            timeline.to(
              [bar, text],
              {
                opacity: 0,
                x: -14,
                duration: animationDuration * 0.6,
                ease,
              },
              0,
            );
          }
        }
      });

      timelineRef.current = timeline;
    },
    [
      active,
      count,
      duration,
      ease,
      expandRatio,
      grayscale,
      parallax,
      prefersReduced,
      showLabels,
      stagger,
      tilt,
      vertical,
    ],
  );

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(
        140,
        usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22,
      );

      mediaSizeRef.current = size;
      element.style.setProperty("--ag-media-size", `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [applyLayout, count, expandRatio, gap, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
    },
    [],
  );

  const handleEnter = (index: number) => {
    if (trigger === "hover") setActive(index);
  };

  const handleClick = (index: number, event: MouseEvent<HTMLElement>) => {
    if (index !== active) {
      event.preventDefault();
      setActive(index);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLElement>) => {
    if (!count) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index + 1) % count);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index - 1 + count) % count);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActive(index);
    }
  };

  const rootStyle = {
    "--ag-accent": accentColor,
    "--ag-overlay": overlayColor,
    "--ag-text": textColor,
    "--ag-gap": `${gap}px`,
    "--ag-radius": `${radius}px`,
    height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? " accordion-gallery--vertical" : ""}${className ? ` ${className}` : ""}`}
      style={rootStyle}
      role="list"
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const isActive = index === active;
        const panelProps = {
          ref: (element: HTMLElement | null) => {
            panelRefs.current[index] = element;
          },
          className: `ag-panel${isActive ? " ag-panel--active" : ""}`,
          style: { borderRadius: `${radius}px` },
          onClick: (event: MouseEvent<HTMLElement>) =>
            handleClick(index, event),
          onMouseEnter: () => handleEnter(index),
          onFocus: () => setActive(index),
          onKeyDown: (event: KeyboardEvent<HTMLElement>) =>
            handleKeyDown(index, event),
          role: "listitem" as const,
          tabIndex: 0,
          "aria-current": isActive ? true : undefined,
          "aria-label": item.label,
        };
        const panelContent = (
          <>
            <span className="ag-panel__frame">
              <span
                className="ag-panel__media"
                ref={(element: HTMLElement | null) => {
                  mediaRefs.current[index] = element;
                }}
              >
                <Image
                  src={item.image}
                  alt={item.alt ?? item.label ?? ""}
                  fill
                  sizes="(max-width: 520px) 100vw, 25vw"
                  draggable={false}
                />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {showLabels && (
              <span className="ag-panel__label" aria-hidden="true">
                <span
                  className="ag-panel__bar"
                  ref={(element: HTMLElement | null) => {
                    barRefs.current[index] = element;
                  }}
                />
                <span
                  className="ag-panel__text"
                  ref={(element: HTMLElement | null) => {
                    textRefs.current[index] = element;
                  }}
                >
                  {item.label}
                </span>
              </span>
            )}
          </>
        );

        return item.link ? (
          <a {...panelProps} key={item.image} href={item.link}>
            {panelContent}
          </a>
        ) : (
          <div {...panelProps} key={item.image}>
            {panelContent}
          </div>
        );
      })}
    </div>
  );
}
