"use client";

import {
  Color,
  Mesh,
  Program,
  Renderer,
  Triangle,
} from "ogl";
import { useEffect, useRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";


const CANVAS_PADDING = 20;
const DESKTOP_MEDIA_QUERY = "(min-width: 68.75rem)";
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

const VERTEX_SHADER = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float gaussianLine(float distance, float sigma) {
  float x = distance / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 point = gl_FragCoord.xy - uCenter;
  float distance = sdRoundedRect(point, uHalfSize, uRadius);
  vec2 lightDirection = vec2(cos(uAngle), sin(uAngle));

  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(distance))) * 0.45;
  vec2 normal = normalize(point / (uHalfSize * uHalfSize) + 1e-6);
  float angle = acos(clamp(abs(dot(normal, lightDirection)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(
    uShineSize - uShineFade,
    uShineSize + uShineFade + 1e-4,
    angle
  );
  float line = gaussianLine(distance, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(distance));
  float highlight = line * rim * edgeClamp * uIntensity;

  vec3 color = uBaseColor * base + uLineColor * highlight;
  float alpha = clamp(base + highlight, 0.0, 1.0);
  fragColor = vec4(color, alpha);
}
`;

type SpecularButtonProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "className" | "onClick" | "style"
> & {
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  className?: string;
};

interface SpecularButtonOptions {
  autoAnimate: boolean;
  baseColor: string;
  followMouse: boolean;
  intensity: number;
  lineColor: string;
  proximity: number;
  radius: number;
  shineFade: number;
  shineSize: number;
  speed: number;
  thickness: number;
}

interface SpecularButtonSize {
  height: number;
  width: number;
}

const defaultOptions: SpecularButtonOptions = {
  autoAnimate: true,
  baseColor: "#bc8d3e",
  followMouse: true,
  intensity: 0.8,
  lineColor: "#d0a354",
  proximity: 250,
  radius: 8,
  shineFade: 27,
  shineSize: 11,
  speed: 0.58,
  thickness: 1,
};

function listenToMediaQuery(
  mediaQuery: MediaQueryList,
  listener: () => void,
) {
  mediaQuery.addEventListener("change", listener);
  return () => mediaQuery.removeEventListener("change", listener);
}

function SpecularCanvas({
  button,
  fx,
  optionsRef,
}: {
  button: HTMLElement;
  fx: HTMLSpanElement;
  optionsRef: React.MutableRefObject<SpecularButtonOptions>;
}): (() => void) | null {
  let renderer: Renderer | null = null;
  let canvas: HTMLCanvasElement | null = null;

  try {
    const devicePixelRatio = window.devicePixelRatio || 1;
    renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: devicePixelRatio,
      premultipliedAlpha: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: devicePixelRatio },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [0.32, 0.32, 0.32] },
        uIntensity: { value: 1 },
        uShineSize: { value: 0.17 },
        uShineFade: { value: 0.7 },
        uThickness: { value: 1 },
        uBaseWidth: { value: devicePixelRatio },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    canvas = gl.canvas;
    fx.appendChild(canvas);

    const size: SpecularButtonSize = { height: 1, width: 1 };
    const resize = () => {
      const rect = button.getBoundingClientRect();
      size.width = rect.width;
      size.height = rect.height;
      renderer!.setSize(rect.width + CANVAS_PADDING * 2, rect.height + CANVAS_PADDING * 2);
      program.uniforms.uCenter.value = [
        (CANVAS_PADDING + rect.width / 2) * devicePixelRatio,
        (CANVAS_PADDING + rect.height / 2) * devicePixelRatio,
      ];
      program.uniforms.uHalfSize.value = [
        (rect.width / 2) * devicePixelRatio,
        (rect.height / 2) * devicePixelRatio,
      ];
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(button);
    resize();

    let pointerAngle: number | null = null;
    let proximity = 0;
    const onPointerMove = (event: PointerEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
      const distanceY = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
      const distance = Math.hypot(distanceX, distanceY);

      if (distance === 0) {
        const normalizedX = (event.clientX - centerX) / (rect.width / 2);
        const normalizedY = (centerY - event.clientY) / (rect.height / 2);
        pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + normalizedX * 0.3 + normalizedY * 0.15;
      } else {
        pointerAngle = Math.atan2(centerY - event.clientY, event.clientX - centerX);
      }

      const proximityRatio = Math.max(
        0,
        1 - distance / Math.max(optionsRef.current.proximity, 1),
      );
      proximity = proximityRatio * proximityRatio * (3 - 2 * proximityRatio);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let angle = 2.4;
    let idleAngle = 2.4;
    let brightness = 0;
    let lastTime = performance.now();
    let animationFrame = 0;
    const lineColor = new Color();
    const baseColor = new Color();

    const update = (now: number) => {
      animationFrame = requestAnimationFrame(update);
      const deltaTime = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const options = optionsRef.current;

      idleAngle += options.speed * deltaTime;
      const isFollowingPointer =
        options.followMouse &&
        pointerAngle !== null &&
        (!options.autoAnimate || proximity > 0);
      const targetAngle = isFollowingPointer && pointerAngle !== null ? pointerAngle : idleAngle;
      const difference = ((targetAngle - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      angle += difference * (1 - Math.exp(-deltaTime * 7));

      const brightnessTarget = options.autoAnimate ? 1 : proximity;
      brightness += (brightnessTarget - brightness) * (1 - Math.exp(-deltaTime * 8));

      lineColor.set(options.lineColor);
      baseColor.set(options.baseColor);
      program.uniforms.uAngle.value = angle;
      program.uniforms.uRadius.value = Math.min(
        options.radius,
        Math.min(size.width, size.height) / 2,
      ) * devicePixelRatio;
      program.uniforms.uLineColor.value = [lineColor.r, lineColor.g, lineColor.b];
      program.uniforms.uBaseColor.value = [baseColor.r, baseColor.g, baseColor.b];
      program.uniforms.uIntensity.value = options.intensity * brightness;
      program.uniforms.uShineSize.value = (options.shineSize * Math.PI) / 180;
      program.uniforms.uShineFade.value = (options.shineFade * Math.PI) / 180;
      program.uniforms.uThickness.value = options.thickness * devicePixelRatio;
      renderer!.render({ scene: mesh });
    };

    animationFrame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (gl.canvas.parentNode === fx) {
        fx.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  } catch {
    if (canvas?.parentNode === fx) {
      fx.removeChild(canvas);
    }
    renderer?.gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
}

export function SpecularButton({
  autoAnimate = defaultOptions.autoAnimate,
  baseColor = defaultOptions.baseColor,
  blur = 0,
  children = "Get Started",
  className = "",
  disabled = false,
  followMouse = defaultOptions.followMouse,
  href,
  intensity = defaultOptions.intensity,
  lineColor = defaultOptions.lineColor,
  onClick,
  proximity = defaultOptions.proximity,
  radius = defaultOptions.radius,
  rel,
  shineFade = defaultOptions.shineFade,
  shineSize = defaultOptions.shineSize,
  size = "lg",
  speed = defaultOptions.speed,
  target,
  textColor = "#f5f5f5",
  thickness = defaultOptions.thickness,
  tint = "#380b0b",
  tintOpacity = 0,
  type = "button",
  ...rest
}: SpecularButtonProps) {
  const buttonRef = useRef<HTMLElement>(null);
  const fxRef = useRef<HTMLSpanElement>(null);
  const optionsRef = useRef<SpecularButtonOptions>({
    autoAnimate,
    baseColor,
    followMouse,
    intensity,
    lineColor,
    proximity,
    radius,
    shineFade,
    shineSize,
    speed,
    thickness,
  });

  useEffect(() => {
    optionsRef.current = {
      autoAnimate,
      baseColor,
      followMouse,
      intensity,
      lineColor,
      proximity,
      radius,
      shineFade,
      shineSize,
      speed,
      thickness,
    };
  }, [
    autoAnimate,
    baseColor,
    followMouse,
    intensity,
    lineColor,
    proximity,
    radius,
    shineFade,
    shineSize,
    speed,
    thickness,
  ]);

  useEffect(() => {
    const button = buttonRef.current;
    const fx = fxRef.current;
    if (!button || !fx) {
      return;
    }

    const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const motionQuery = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
    let destroyCanvas: (() => void) | null = null;

    const updateCanvas = () => {
      destroyCanvas?.();
      destroyCanvas = null;
      if (desktopQuery.matches && !motionQuery.matches) {
        destroyCanvas = SpecularCanvas({ button, fx, optionsRef });
      }
    };

    const removeDesktopListener = listenToMediaQuery(desktopQuery, updateCanvas);
    const removeMotionListener = listenToMediaQuery(motionQuery, updateCanvas);
    updateCanvas();

    return () => {
      removeDesktopListener();
      removeMotionListener();
      destroyCanvas?.();
    };
  }, []);

  const style = {
    "--sb-blur": `${blur}px`,
    "--sb-radius": `${radius}px`,
    "--sb-text-color": textColor,
    "--sb-tint": tint,
    "--sb-tint-opacity": tintOpacity,
  } as CSSProperties;
  const buttonClassName = [
    "specular-button",
    `specular-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span ref={fxRef} className="specular-button__fx" aria-hidden="true" />
      <span className="specular-button__label">{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        {...rest}
        ref={buttonRef as React.Ref<HTMLAnchorElement>}
        className={buttonClassName}
        href={href}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        rel={rel}
        style={style}
        target={target}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...rest}
      ref={buttonRef as React.Ref<HTMLButtonElement>}
      className={buttonClassName}
      disabled={disabled}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      style={style}
      type={type}
    >
      {content}
    </button>
  );
}

export default SpecularButton;
