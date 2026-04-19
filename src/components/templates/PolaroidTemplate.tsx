'use client'
import React from 'react'
import { type BaseTemplateProps, buildHeaderLabel, buildSignoff } from './BaseTemplate'
import { getTextFit } from '@/lib/text-fitting'
import { getFontFamily } from '@/lib/fonts'

export function PolaroidTemplate({ submission, theme, previewMode = false, footerSignature = '— Murmur', fontFamily: fontFamilyProp }: BaseTemplateProps) {
  const text = submission.editedText || submission.bodyText
  const fit = getTextFit(text)
  const s = previewMode ? 0.35 : 1
  const header = buildHeaderLabel(submission)
  const signoff = buildSignoff(submission)
  const font = fontFamilyProp || getFontFamily('cursive')

  return (
    <div style={{ width: 1080 * s, height: 1080 * s, background: theme.colors.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${32 * s}px`, position: 'relative', overflow: 'hidden' }}>
      {/* Subtle texture */}
      <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(0deg, ${theme.colors.secondary}06 0px, transparent 1px, transparent 24px)` }} />

      {/* Polaroid card */}
      <div style={{ background: '#ffffff', boxShadow: `0 ${8 * s}px ${32 * s}px rgba(0,0,0,0.14)`, padding: `${24 * s}px ${24 * s}px ${60 * s}px`, width: '90%', height: '92%', borderRadius: 4 * s, transform: 'rotate(1deg)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Inner content area */}
        <div style={{ background: `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.accent}15)`, borderRadius: 4 * s, padding: `${28 * s}px ${32 * s}px`, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {header && (
            <div style={{ marginBottom: 20 * s }}>
              <span style={{ background: theme.colors.primary, color: '#fff', fontSize: 24 * s, fontWeight: 700, padding: `${6 * s}px ${20 * s}px`, borderRadius: 8 * s, fontFamily: font }}>{header}</span>
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
            <p style={{ fontSize: fit.fontSize * s, lineHeight: fit.lineHeight, color: theme.colors.text, fontFamily: font, fontWeight: 500 }}>{text}</p>
          </div>
          <div style={{ textAlign: 'right', marginTop: 12 * s }}>
            <span style={{ fontSize: 20 * s, color: theme.colors.secondary, fontFamily: font, fontStyle: 'italic' }}>{signoff ?? footerSignature}</span>
          </div>
        </div>

        {/* Bottom polaroid caption area */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 12 * s }}>
          <span style={{ fontSize: 18 * s, color: theme.colors.primary, fontFamily: font, fontWeight: 600 }}>{footerSignature}</span>
        </div>
      </div>

      {/* Pin */}
      <div style={{ position: 'absolute', top: 20 * s, left: '51%', transform: 'translateX(-50%)', width: 22 * s, height: 22 * s, background: theme.colors.accent, borderRadius: '50%', boxShadow: `0 ${2 * s}px ${6 * s}px rgba(0,0,0,0.25)`, zIndex: 2 }} />
    </div>
  )
}
