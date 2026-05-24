export function hexToRgb(hex) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return { r, g, b }
}

export function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  const toLinear = c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function isLight(hex) {
  return getLuminance(hex) > 0.35
}

export function mixColors(hex1, hex2, ratio = 0.5) {
  const c1 = hexToRgb(hex1)
  const c2 = hexToRgb(hex2)
  const r = Math.round(c1.r * (1 - ratio) + c2.r * ratio)
  const g = Math.round(c1.g * (1 - ratio) + c2.g * ratio)
  const b = Math.round(c1.b * (1 - ratio) + c2.b * ratio)
  const clamp = v => Math.max(0, Math.min(255, v))
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`
}

export function adjustBrightness(hex, amount) {
  const { r, g, b } = hexToRgb(hex)
  const clamp = v => Math.max(0, Math.min(255, v))
  const nr = clamp(r + amount)
  const ng = clamp(g + amount)
  const nb = clamp(b + amount)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

export function generateTheme(bgColor) {
  const light = isLight(bgColor)
  const luminance = getLuminance(bgColor)

  let textPrimary = light ? '#0a0a0a' : '#f5f5f5'
  if (getContrastRatio(bgColor, textPrimary) < 4.5) {
    textPrimary = luminance > 0.5 ? '#0a0a0a' : '#ffffff'
  }

  const textSecondary = light
    ? mixColors(bgColor, '#000000', 0.55)
    : mixColors(bgColor, '#ffffff', 0.55)

  const textTertiary = light
    ? mixColors(bgColor, '#000000', 0.35)
    : mixColors(bgColor, '#ffffff', 0.35)

  const surface = light
    ? adjustBrightness(bgColor, -15)
    : adjustBrightness(bgColor, 25)

  const surfaceElevated = light
    ? adjustBrightness(bgColor, -30)
    : adjustBrightness(bgColor, 45)

  const border = light
    ? 'rgba(0,0,0,0.1)'
    : 'rgba(255,255,255,0.08)'

  let accent
  if (luminance > 0.5) {
    accent = adjustBrightness(bgColor, -120)
  } else if (luminance > 0.15) {
    accent = light
      ? adjustBrightness(bgColor, -100)
      : adjustBrightness(bgColor, +100)
  } else {
    const { r, g, b } = hexToRgb(bgColor)
    const maxC = Math.max(r, g, b)
    if (maxC === r) accent = `#${(255).toString(16).padStart(2,'0')}${Math.min(255, g + 60).toString(16).padStart(2, '0')}${Math.min(255, b + 60).toString(16).padStart(2, '0')}`
    else if (maxC === g) accent = `#${Math.min(255, r + 60).toString(16).padStart(2, '0')}${(255).toString(16).padStart(2,'0')}${Math.min(255, b + 60).toString(16).padStart(2, '0')}`
    else accent = `#${Math.min(255, r + 60).toString(16).padStart(2, '0')}${Math.min(255, g + 60).toString(16).padStart(2, '0')}${(255).toString(16).padStart(2,'0')}`
  }

  const accentText = isLight(accent) ? '#0a0a0a' : '#ffffff'
  const accentHover = adjustBrightness(accent, light ? -20 : 20)

  const { r: nr, g: ng, b: nb } = hexToRgb(bgColor)
  const navBg = light
    ? `rgba(${nr},${ng},${nb},0.95)`
    : `rgba(${nr},${ng},${nb},0.88)`

  const inputBg = light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)'
  const shadow = light
    ? '0 4px 24px rgba(0,0,0,0.12)'
    : '0 4px 24px rgba(0,0,0,0.5)'

  const overlayBg = light
    ? 'rgba(255,255,255,0.5)'
    : 'rgba(0,0,0,0.5)'

  return {
    '--bg-primary': bgColor,
    '--bg-secondary': surface,
    '--bg-surface': surface,
    '--bg-elevated': surfaceElevated,
    '--text-primary': textPrimary,
    '--text-secondary': textSecondary,
    '--text-tertiary': textTertiary,
    '--accent': accent,
    '--accent-text': accentText,
    '--accent-hover': accentHover,
    '--border-color': border,
    '--nav-bg': navBg,
    '--input-bg': inputBg,
    '--shadow': shadow,
    '--canvas-bg': bgColor,
    '--bg-input': inputBg,
    '--overlay-bg': overlayBg,
    '--shadow-color': light ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.5)',
  }
}

export function applyTheme(bgHex) {
  const root = document.documentElement
  const { r, g, b } = hexToRgb(bgHex)

  const toLinear = c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  const isLightBg = lum > 0.35

  const textPrimary = isLightBg ? '#0a0a0a' : '#f5f5f5'
  const textSecondary = isLightBg ? '#3a3a3a' : '#b0b0b0'
  const textTertiary = isLightBg ? '#666666' : '#707070'

  const mix = (hex, ratio) => {
    const c = hexToRgb(hex)
    const white = isLightBg
      ? { r: 0, g: 0, b: 0 }
      : { r: 255, g: 255, b: 255 }
    return `rgb(${Math.round(c.r * (1 - ratio) + white.r * ratio)},${Math.round(c.g * (1 - ratio) + white.g * ratio)},${Math.round(c.b * (1 - ratio) + white.b * ratio)})`
  }

  const surface = mix(bgHex, 0.12)
  const elevated = mix(bgHex, 0.22)

  const dominant = Math.max(r, g, b)
  let accent, accentText
  if (dominant === r && r > 150) {
    accent = isLightBg ? '#0066cc' : '#66bbff'
    accentText = isLightBg ? '#ffffff' : '#001a33'
  } else if (dominant === g && g > 150) {
    accent = isLightBg ? '#7700cc' : '#cc88ff'
    accentText = '#ffffff'
  } else if (dominant === b && b > 150) {
    accent = isLightBg ? '#cc5500' : '#ffaa44'
    accentText = isLightBg ? '#ffffff' : '#1a0a00'
  } else {
    accent = isLightBg ? '#006655' : '#14b8a6'
    accentText = '#ffffff'
  }

  if (lum < 0.05 || lum > 0.85) {
    accent = '#14b8a6'
    accentText = '#ffffff'
  }

  const vars = {
    '--bg-primary': bgHex,
    '--bg-secondary': surface,
    '--bg-surface': surface,
    '--bg-elevated': elevated,
    '--bg-input': isLightBg ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
    '--text-primary': textPrimary,
    '--text-secondary': textSecondary,
    '--text-tertiary': textTertiary,
    '--accent': accent,
    '--accent-text': accentText,
    '--accent-hover': accent,
    '--border-color': isLightBg ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)',
    '--shadow': isLightBg ? '0 4px 24px rgba(0,0,0,0.10)' : '0 4px 24px rgba(0,0,0,0.40)',
    '--nav-bg': `rgba(${r},${g},${b},${isLightBg ? 0.96 : 0.90})`,
    '--canvas-bg': bgHex,
    '--overlay': isLightBg ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    '--input-bg': isLightBg ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
    '--overlay-bg': isLightBg ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
    '--shadow-color': isLightBg ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.5)',
  }

  Object.entries(vars).forEach(([k, v]) => {
    root.style.setProperty(k, v)
  })

  root.classList.add('theme-active')
  document.body.setAttribute('data-theme', bgHex)

  localStorage.setItem('centrova-bg-color', bgHex)

  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { bgHex, isLight: isLightBg } }))
}

export function loadSavedTheme() {
  const saved = localStorage.getItem('centrova-bg-color')
  if (saved) applyTheme(saved)
}

export function clearTheme() {
  const root = document.documentElement
  const props = [
    '--bg-primary', '--bg-secondary', '--bg-surface', '--bg-elevated',
    '--text-primary', '--text-secondary', '--text-tertiary',
    '--accent', '--accent-text', '--accent-hover',
    '--border-color', '--nav-bg', '--input-bg', '--shadow',
    '--canvas-bg', '--bg-input', '--overlay-bg', '--shadow-color',
    '--overlay',
  ]
  props.forEach(p => root.style.removeProperty(p))
  root.classList.remove('theme-active')
  document.body.removeAttribute('data-theme')
  localStorage.removeItem('centrova-bg-color')
}
