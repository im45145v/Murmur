'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function RetroVintageTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('display')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${40 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Retro sunburst lines (simplified) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 1600 * s, height: 2 * s, background: theme.colors.accent + '08', transform: `translate(-50%, -50%) rotate(${i * 15}deg)`, transformOrigin: 'center' }} />
      ))}

      {/* Rounded retro card */}
      <div style={{ background: theme.colors.primary, width: '90%', flex: 1, borderRadius: 40 * s, padding: `${36 * s}px ${44 * s}px`, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {/* Inner border */}
        <div style={{ position: 'absolute', top: 12 * s, left: 12 * s, right: 12 * s, bottom: 12 * s, border: `2px solid rgba(255,255,255,0.15)`, borderRadius: 32 * s }} />

        {header && (
          <div style={{ marginBottom: 24 * s, textAlign: 'center' }}>
            <span style={{ background: theme.colors.accent, color: '#fff', fontSize: 28 * s, fontWeight: 800, padding: `${10 * s}px ${30 * s}px`, borderRadius: 100, fontFamily: font, letterSpacing: 2, textTransform: 'uppercase' }}>{header}</span>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
          <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: '#ffffff', fontFamily: font, fontWeight: 500, textAlign: 'center' }}>{text}</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 * s }}>
          <span style={{ fontSize: 20 * s, color: 'rgba(255,255,255,0.7)', fontFamily: font, fontStyle: 'italic' }}>{signoff ?? footerSignature}</span>
        </div>
      </div>

      {/* Bottom retro badge */}
      <div style={{ marginTop: 16 * s, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 12 * s, color: theme.colors.secondary, fontFamily: font, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>{submission.category}</span>
      </div>
    </div>
  )
}
