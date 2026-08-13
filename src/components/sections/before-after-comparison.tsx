"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";

import { Reveal } from "@/components/motion/reveal";
import type { ReferenceProjectContent } from "@/content/types";

interface BeforeAfterComparisonProps {
  afterLabel: string;
  beforeLabel: string;
  index: number;
  project: ReferenceProjectContent;
  valueLabel: string;
}

export function BeforeAfterComparison({
  afterLabel,
  beforeLabel,
  index,
  project,
  valueLabel,
}: BeforeAfterComparisonProps) {
  const [position, setPosition] = useState(50);
  const comparisonStyle = {
    "--comparison-position": `${position}%`,
  } as CSSProperties;

  const updateFromPointer = (
    event: ReactPointerEvent<HTMLInputElement>,
  ) => {
    const input = event.currentTarget;
    const bounds = input.getBoundingClientRect();
    const nextPosition = Math.round(
      ((event.clientX - bounds.left) / bounds.width) * 100,
    );

    setPosition(Math.min(100, Math.max(0, nextPosition)));
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLInputElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLInputElement>,
  ) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      updateFromPointer(event);
    }
  };

  return (
    <Reveal
      as="article"
      className="reference-project"
      delay={index * 90}
      id={`reference-${project.id}`}
      aria-labelledby={`reference-${project.id}-title`}
    >
      <header className="reference-project-header">
        <span aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 id={`reference-${project.id}-title`}>{project.title}</h3>
      </header>

      <div className="before-after-comparison" style={comparisonStyle}>
        <Image
          className="comparison-image"
          src={project.beforeImage.src}
          alt={project.beforeImage.alt}
          fill
          sizes="(max-width: 42rem) calc(100vw - 2.3rem), (max-width: 68.75rem) 30vw, 20vw"
          style={
            project.beforeImage.objectPosition
              ? { objectPosition: project.beforeImage.objectPosition }
              : undefined
          }
        />

        <div className="comparison-after-reveal">
          <Image
            className="comparison-image"
            src={project.afterImage.src}
            alt={project.afterImage.alt}
            fill
            sizes="(max-width: 42rem) calc(100vw - 2.3rem), (max-width: 68.75rem) 30vw, 20vw"
            style={
              project.afterImage.objectPosition
                ? { objectPosition: project.afterImage.objectPosition }
                : undefined
            }
          />
        </div>

        <span className="comparison-label comparison-label-after">
          {afterLabel}
        </span>
        <span className="comparison-label comparison-label-before">
          {beforeLabel}
        </span>

        <input
          className="comparison-range"
          type="range"
          min="0"
          max="100"
          step="1"
          value={position}
          onChange={(event) => setPosition(Number(event.currentTarget.value))}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          aria-label={project.ariaLabel}
          aria-valuetext={`${position}% — ${valueLabel}`}
        />

        <div className="comparison-divider" aria-hidden="true">
          <span className="comparison-handle">
            <svg viewBox="0 0 24 18" width="18" height="14">
              <path d="M8 4 3 9l5 5M16 4l5 5-5 5M4 9h16" />
            </svg>
          </span>
        </div>
      </div>
    </Reveal>
  );
}
