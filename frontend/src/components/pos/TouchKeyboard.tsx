'use client';

import { useState } from 'react';
import { Delete, RotateCcw, X, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Numpad ────────────────────────────────────────────────────────────────────

const NUMPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'backspace'],
];

// ── Alpha (QWERTY) ────────────────────────────────────────────────────────────

const ALPHA_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'backspace'],
  ['space', 'clear'],
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  mode: 'numpad' | 'alpha';
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  className?: string;
}

// ── Shared key button ─────────────────────────────────────────────────────────

function KeyButton({
  label,
  onClick,
  className,
  wide,
  muted,
}: {
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  wide?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        // Prevent the input from losing focus when tapping keyboard keys
        e.preventDefault();
        onClick();
      }}
      className={cn(
        'touch-target select-none rounded-lg border text-foreground transition-colors active:scale-95',
        wide ? 'col-span-2' : '',
        muted
          ? 'border-border bg-muted/60 text-muted-foreground hover:bg-muted'
          : 'border-border bg-card font-semibold hover:bg-muted',
        className,
      )}
    >
      {label}
    </button>
  );
}

// ── Numpad layout ─────────────────────────────────────────────────────────────

function NumpadLayout({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {NUMPAD_ROWS.map((row, ri) =>
        row.map((key, ki) => {
          if (key === '') return <span key={`blank-${ri}-${ki}`} aria-hidden="true" />;
          if (key === 'backspace') {
            return (
              <KeyButton
                key="backspace"
                muted
                label={<Delete size={18} />}
                onClick={() => onChange(value.slice(0, -1))}
              />
            );
          }
          return (
            <KeyButton
              key={key}
              label={key}
              onClick={() => onChange(`${value}${key}`)}
              className="text-xl"
            />
          );
        }),
      )}
      {/* Clear row */}
      <KeyButton
        key="clear"
        wide
        muted
        label={
          <span className="flex items-center justify-center gap-1.5 text-sm">
            <RotateCcw size={14} />
            Clear
          </span>
        }
        onClick={() => onChange('')}
        className="col-span-3"
      />
    </div>
  );
}

// ── Alpha / QWERTY layout ─────────────────────────────────────────────────────

function AlphaLayout({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [shifted, setShifted] = useState(false);

  const handleLetter = (letter: string) => {
    onChange(`${value}${shifted ? letter.toUpperCase() : letter.toLowerCase()}`);
    // Auto-release shift after one letter
    if (shifted) setShifted(false);
  };

  return (
    <div className="space-y-1.5">
      {ALPHA_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1 justify-center">
          {row.map((key) => {
            if (key === 'shift') {
              return (
                <KeyButton
                  key="shift"
                  muted={!shifted}
                  label={<ChevronUp size={16} className={shifted ? 'text-brand' : ''} />}
                  onClick={() => setShifted((s) => !s)}
                  className={cn(
                    'min-w-[2.5rem] flex-shrink-0',
                    shifted && 'border-brand bg-brand/10 text-brand',
                  )}
                />
              );
            }
            if (key === 'backspace') {
              return (
                <KeyButton
                  key="backspace"
                  muted
                  label={<Delete size={16} />}
                  onClick={() => onChange(value.slice(0, -1))}
                  className="min-w-[2.5rem] flex-shrink-0"
                />
              );
            }
            if (key === 'space') {
              return (
                <KeyButton
                  key="space"
                  wide
                  muted
                  label={<span className="text-xs">SPACE</span>}
                  onClick={() => onChange(`${value} `)}
                  className="flex-1"
                />
              );
            }
            if (key === 'clear') {
              return (
                <KeyButton
                  key="clear"
                  muted
                  label={
                    <span className="flex items-center gap-1 text-xs">
                      <RotateCcw size={12} />
                      CLR
                    </span>
                  }
                  onClick={() => onChange('')}
                  className="min-w-[3rem] flex-shrink-0"
                />
              );
            }
            const display = shifted ? key.toUpperCase() : key.toLowerCase();
            return (
              <KeyButton
                key={key}
                label={display}
                onClick={() => handleLetter(key)}
                className="flex-1 min-w-0 text-base"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function TouchKeyboard({ mode, value, onChange, onClose, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card shadow-xl p-2',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-medium text-muted-foreground">
          {mode === 'numpad' ? 'Numpad' : 'Keyboard'}
        </span>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="touch-target rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Close keyboard"
        >
          <X size={16} />
        </button>
      </div>

      {/* Keys */}
      {mode === 'numpad' ? (
        <NumpadLayout value={value} onChange={onChange} />
      ) : (
        <AlphaLayout value={value} onChange={onChange} />
      )}
    </div>
  );
}
