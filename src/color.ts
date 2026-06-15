import convert from "color-convert";
import type { ColorFormat } from "./types";

interface RGBA {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export function convertColor(rgba: RGBA, format: ColorFormat): string {
  switch (format) {
    case "hex":
      return rgbToHexString(rgba);
    case "rgb":
    case "rgba":
      return rgbToRgbString(rgba);
    case "hsl":
      return rgbToHslString(rgba);
    case "hwb":
      return rgbToHwbString(rgba);
    case "lab":
      return rgbToLabString(rgba);
    case "lch":
      return rgbToLchString(rgba);
    default:
      throw new Error(`Unsupported color format: ${format}`);
  }
}

export function rgbToRgbString(rgba: RGBA): string {
  const { r, g, b, a } = rgba;

  if (a !== undefined) {
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function rgbToHexString(rgba: RGBA): string {
  const hex = convert.rgb.hex(rgba.r, rgba.g, rgba.b);
  // NOTE: `convert.rgb.hex` doesn't support alpha channel so need to add it manually

  if (rgba.a !== undefined) {
    const alphaHex = Math.round(rgba.a * 255)
      .toString(16)
      .padStart(2, "0");
    return `#${hex}${alphaHex}`;
  }

  return `#${hex}`;
}

export function rgbToHslString(rgba: RGBA): string {
  const [h, s, l] = convert.rgb.hsl(rgba.r, rgba.g, rgba.b);

  if (rgba.a !== undefined) {
    return `hsla(${h}, ${s}%, ${l}%, ${rgba.a})`;
  }
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function rgbToHwbString(rgba: RGBA): string {
  const [h, w, b] = convert.rgb.hwb(rgba.r, rgba.g, rgba.b);

  if (rgba.a !== undefined) {
    return `hwb(${h} ${w}% ${b}% / ${rgba.a})`;
  }
  return `hwb(${h} ${w}% ${b}%)`;
}

export function rgbToLabString(rgba: RGBA): string {
  const [l, a, b] = convert.rgb.lab(rgba.r, rgba.g, rgba.b);

  if (rgba.a !== undefined) {
    return `lab(${l}% ${a} ${b} / ${rgba.a})`;
  }
  return `lab(${l}% ${a} ${b})`;
}

export function rgbToLchString(rgba: RGBA): string {
  const [l, c, h] = convert.rgb.lch(rgba.r, rgba.g, rgba.b);

  if (rgba.a !== undefined) {
    return `lch(${l}% ${c} ${h} / ${rgba.a})`;
  }
  return `lch(${l}% ${c} ${h})`;
}
