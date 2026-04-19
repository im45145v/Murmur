'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function NeonGlowTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('sans')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${40 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow circles */}
      <div style={{ position: 'absolute', top: -120 * s, left: -80 * s, width: 450 * s, height: 450 * s, borderRadius: '50%', background: theme.colors.accent + '12', filter: `blur(${80 * s}px)` }} />
      <div style={{ position: 'absolute', bottom: -100 * s, right: -60 * s, width: 380 * s, height: 380 * s, borderRadius: '50%', background: theme.colors.primary + '15', filter: `blur(${60 * s}px)` }} />

      {/* Neon border frame */}
      <div style={{ position: 'absolute', top: 40 * s, left: 40 * s, right: 40 * s, bottom: 40 * s, border: `1.5px solid ${theme.colors.accent}40`, borderRadius: 16 * s }} />

      {/* Top glow bar */}
      <div style={{ position: 'absolute', top: 40 * s, left: 100 * s, right: 100 * s, height: 2 * s, background: `linear-gradient(90deg, transparent, ${theme.colors.accent}, transparent)`, boxShadow: `0 0 ${12 * s}px ${theme.colors.accent}80` }} />

      {/* Inner content area */}
      <div style={{ width: '88%', flex: 1, display: 'flex', flexDirection: 'column', padding: `${36 * s}px ${32 * s}px`, position: 'relative', zIndex: 1 }}>
        {header && (
          <div style={{ marginBottom: 24 * s }}>
            <span style={{ background: theme.colors.accent + '30', border: `1px solid ${theme.colors.accent}60`, color: theme.colors.accent, fontSize: 24 * s, fontWeight: 700, padding: `${8 * s}px ${22 * s}px`, borderRadius: 100, fontFamily: 'system-ui, sans-serif', letterSpacing: 1, boxShadow: `0 0 ${16 * s}px ${theme.colors.accent}20` }}>{header}</span>
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
          <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: 'system-ui, sans-serif', fontWeight: 300 }}>{text}</p>
        </div>
        <div style={{ textAlign: 'right', marginTop: 12 * s }}>
          <span style={{ fontSize: 22 * s, color: theme.colors.secondary, fontFamily: 'system-ui, sans-serif', letterSpacing: 2 }}>{signoff ?? footerSignature}</span>
        </div>
      </div>

      {/* Bottom glow bar */}
      <div style={{ position: 'absolute', bottom: 40 * s, left: 100 * s, right: 100 * s, height: 2 * s, background: `linear-gradient(90deg, transparent, ${theme.colors.primary}, transparent)`, boxShadow: `0 0 ${12 * s}px ${theme.colors.primary}60` }} />
    </div>
  )
}
