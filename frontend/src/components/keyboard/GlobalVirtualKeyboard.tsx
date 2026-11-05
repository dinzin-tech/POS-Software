'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Keyboard,
  ChevronDown,
  Delete,
  CornerDownLeft,
  RotateCcw,
  ArrowUp,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type KeyboardMode = 'alpha' | 'symbols' | 'numpad';

// ── Layout definitions ────────────────────────────────────────────────────────

const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

const ALPHA_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const SYMBOL_ROWS = [
  ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
  ['-', '_', '=', '+', '[', ']', '{', '}', '\\', '|'],
  [';', ':', '\'', '"', ',', '<', '.', '>', '/', '?'],
];

const NUMPAD_GRID = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '00'],
];

// Helper to check if an element is an editable text input
function isEditableInput(el: unknown): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el || typeof el !== 'object' || !('tagName' in el)) return false;
  const element = el as HTMLElement;
  if (element.isContentEditable) return true;
  if (element.tagName === 'TEXTAREA') {
    return !(element as HTMLTextAreaElement).readOnly && !(element as HTMLTextAreaElement).disabled;
  }
  if (element.tagName === 'INPUT') {
    const input = element as HTMLInputElement;
    if (input.readOnly || input.disabled) return false;
    const type = (input.type || 'text').toLowerCase();
    const nonTextTypes = ['checkbox', 'radio', 'file', 'submit', 'reset', 'button', 'range', 'color', 'hidden', 'image'];
    return !nonTextTypes.includes(type);
  }
  return false;
}

// React 19 / DOM synthetic input dispatch helper
function typeIntoInput(
  el: HTMLInputElement | HTMLTextAreaElement,
  action: 'insert' | 'backspace' | 'clear' | 'enter',
  char?: string
) {
  if (action === 'enter') {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));

    if (el.form) {
      try {
        el.form.requestSubmit();
      } catch {
        el.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }
    return;
  }

  const isTextArea = el instanceof HTMLTextAreaElement;
  const proto = isTextArea ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const nativeValueSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const value = el.value ?? '';

  let nextValue = value;
  let nextPos = start;

  if (action === 'clear') {
    nextValue = '';
    nextPos = 0;
  } else if (action === 'backspace') {
    if (start !== end) {
      nextValue = value.slice(0, start) + value.slice(end);
      nextPos = start;
    } else if (start > 0) {
      nextValue = value.slice(0, start - 1) + value.slice(start);
      nextPos = start - 1;
    }
  } else if (action === 'insert' && char !== undefined) {
    nextValue = value.slice(0, start) + char + value.slice(end);
    nextPos = start + char.length;
  }

  if (nativeValueSetter) {
    nativeValueSetter.call(el, nextValue);
  } else {
    el.value = nextValue;
  }

  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));

  try {
    el.setSelectionRange(nextPos, nextPos);
  } catch {}
}

export default function GlobalVirtualKeyboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<KeyboardMode>('alpha');
  const [shift, setShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string>('');
  const [autoShow, setAutoShow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem('dinzin:touch-keyboard-auto');
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {}
    return true;
  });

  const activeElementRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const keyboardContainerRef = useRef<HTMLDivElement | null>(null);
  const repeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleAutoShow = () => {
    setAutoShow((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dinzin:touch-keyboard-auto', String(next));
      } catch {}
      return next;
    });
  };

  const updateActiveInput = useCallback((el: HTMLElement | null) => {
    if (isEditableInput(el)) {
      activeElementRef.current = el;

      // Extract descriptive label for header
      const inputEl = el as HTMLInputElement;
      const placeholder = inputEl.placeholder || '';
      const ariaLabel = inputEl.getAttribute('aria-label') || '';
      const id = inputEl.id;
      let labelText = '';
      if (id) {
        const labelEl = document.querySelector(`label[for="${id}"]`);
        if (labelEl) labelText = labelEl.textContent?.trim() || '';
      }
      const label = labelText || placeholder || ariaLabel || inputEl.name || inputEl.type || 'Input';
      setActiveLabel(label);

      // Automatically switch to numpad for numeric inputs
      const type = inputEl.type?.toLowerCase();
      const inputMode = inputEl.getAttribute('inputmode')?.toLowerCase();
      if (type === 'number' || type === 'tel' || inputMode === 'numeric' || inputMode === 'decimal') {
        setMode('numpad');
      } else {
        setMode('alpha');
      }

      return true;
    }
    return false;
  }, []);

  // Listen globally to focusin events across all routes & components
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (updateActiveInput(target)) {
        if (autoShow) {
          setIsOpen(true);
          // Gently scroll field into view so keyboard doesn't occlude it
          setTimeout(() => {
            if (activeElementRef.current) {
              activeElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 150);
        }
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
    };
  }, [autoShow, updateActiveInput]);

  // Handle external show request
  useEffect(() => {
    const handleShowKeyboard = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: KeyboardMode }>;
      if (customEvent.detail?.mode) setMode(customEvent.detail.mode);
      setIsOpen(true);
    };
    window.addEventListener('dinzin:show-keyboard', handleShowKeyboard as EventListener);
    return () => {
      window.removeEventListener('dinzin:show-keyboard', handleShowKeyboard as EventListener);
    };
  }, []);

  // Key action handler
  const handleKeyAction = (action: 'insert' | 'backspace' | 'clear' | 'enter', char?: string) => {
    let target = activeElementRef.current;

    // If target lost focus or is null, fallback to currently focused element or find first input
    if (!target || !document.contains(target)) {
      const currentActive = document.activeElement;
      if (isEditableInput(currentActive)) {
        target = currentActive;
        activeElementRef.current = currentActive;
      } else {
        const first = document.querySelector('input:not([type="hidden"]):not([disabled]), textarea:not([disabled])');
        if (isEditableInput(first)) {
          target = first;
          activeElementRef.current = first;
          first.focus();
        }
      }
    }

    if (!target) return;

    typeIntoInput(target, action, char);

    // If shift was active (one-shot), turn off shift unless capsLock is enabled
    if (shift && !capsLock && action === 'insert') {
      setShift(false);
    }
  };

  const handleChar = (char: string) => {
    const isUpper = shift || capsLock;
    const finalChar = isUpper ? char.toUpperCase() : char.toLowerCase();
    handleKeyAction('insert', finalChar);
  };

  const startBackspaceRepeat = () => {
    handleKeyAction('backspace');
    repeatTimerRef.current = setTimeout(() => {
      repeatTimerRef.current = setInterval(() => {
        handleKeyAction('backspace');
      }, 70);
    }, 350);
  };

  const stopBackspaceRepeat = () => {
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  const toggleOpen = () => {
    if (!isOpen) {
      // If opening, ensure we have an active input
      if (!activeElementRef.current || !document.contains(activeElementRef.current)) {
        const currentActive = document.activeElement;
        if (isEditableInput(currentActive)) {
          updateActiveInput(currentActive);
        } else {
          const first = document.querySelector('input:not([type="hidden"]):not([disabled]), textarea:not([disabled])');
          if (isEditableInput(first)) {
            updateActiveInput(first);
            first.focus();
          }
        }
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Keyboard Trigger Button (Fixed at bottom right, always accessible on touchscreens) */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          toggleOpen();
        }}
        className={cn(
          'fixed bottom-4 end-4 z-[9990] flex items-center gap-2 rounded-full px-4 py-3 shadow-xl transition-all active:scale-95 border select-none',
          isOpen
            ? 'bg-muted text-foreground border-border'
            : 'bg-primary text-primary-foreground border-primary/20 hover:bg-primary/90 hover:shadow-2xl'
        )}
        title={isOpen ? 'Hide Touch Keyboard' : 'Open Touch Keyboard'}
        aria-label="Toggle Touch Keyboard"
      >
        <Keyboard className="size-5 shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">
          {isOpen ? 'Hide' : 'Keyboard'}
        </span>
      </button>

      {/* Virtual Keyboard Drawer / Floating Bottom Panel */}
      {isOpen && (
        <div
          ref={keyboardContainerRef}
          onPointerDown={(e) => {
            // Crucial: Prevent input from blurring when touching anywhere inside keyboard
            if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="fixed inset-x-0 bottom-0 z-[9995] flex flex-col items-center justify-end pointer-events-none pb-2 px-2 sm:px-4"
        >
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl p-2.5 sm:p-3 text-foreground pointer-events-auto select-none transition-all animate-in slide-in-from-bottom-6 duration-200">
            {/* Header / Info & Controls */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Keyboard className="size-4 text-primary shrink-0" />
                <span className="font-semibold truncate max-w-[200px] sm:max-w-xs text-foreground/90">
                  {activeLabel ? `Typing: ${activeLabel}` : 'Touch Keyboard'}
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  (DinZin POS)
                </span>
              </div>

              {/* Mode Switcher & Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center bg-muted rounded-lg p-0.5 border border-border/50 text-[11px] font-medium">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setMode('alpha');
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-md transition-colors',
                      mode === 'alpha' ? 'bg-background shadow-xs text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    ABC
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setMode('symbols');
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-md transition-colors',
                      mode === 'symbols' ? 'bg-background shadow-xs text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    ?123
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setMode('numpad');
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-md transition-colors flex items-center gap-1',
                      mode === 'numpad' ? 'bg-background shadow-xs text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Hash className="size-3" />
                    Num
                  </button>
                </div>

                {/* Auto-popup preference toggle */}
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    toggleAutoShow();
                  }}
                  className={cn(
                    'px-2 py-1 rounded-md text-[10px] border transition-colors hidden md:inline-flex',
                    autoShow
                      ? 'border-primary/40 bg-primary/10 text-primary font-medium'
                      : 'border-border text-muted-foreground'
                  )}
                  title="Toggle auto-show when tapping fields"
                >
                  Auto: {autoShow ? 'ON' : 'OFF'}
                </button>

                {/* Hide / Dismiss Button */}
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                  }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Hide keyboard"
                  title="Hide keyboard"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>
            </div>

            {/* Layouts */}
            {mode === 'numpad' ? (
              /* ── NUMPAD LAYOUT ── */
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto py-1">
                <div className="col-span-3 grid grid-cols-3 gap-2">
                  {NUMPAD_GRID.map((row) =>
                    row.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleKeyAction('insert', num);
                        }}
                        className="h-13 rounded-xl border border-border bg-card hover:bg-accent font-bold text-xl active:scale-95 transition-all flex items-center justify-center shadow-xs"
                      >
                        {num}
                      </button>
                    ))
                  )}
                </div>

                {/* Action Sidebar for Numpad */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      startBackspaceRepeat();
                    }}
                    onPointerUp={stopBackspaceRepeat}
                    onPointerLeave={stopBackspaceRepeat}
                    className="h-13 rounded-xl border border-border bg-muted/80 hover:bg-muted text-foreground flex items-center justify-center active:scale-95 transition-all shadow-xs"
                    title="Backspace"
                  >
                    <Delete className="size-5" />
                  </button>

                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyAction('clear');
                    }}
                    className="h-13 rounded-xl border border-border bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center text-xs font-semibold active:scale-95 transition-all shadow-xs"
                    title="Clear"
                  >
                    <RotateCcw className="size-4 me-1" /> CLR
                  </button>

                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyAction('enter');
                    }}
                    className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex flex-col items-center justify-center text-sm active:scale-95 transition-all shadow-md"
                  >
                    <CornerDownLeft className="size-5 mb-0.5" />
                    Enter
                  </button>
                </div>
              </div>
            ) : (
              /* ── QWERTY / SYMBOLS LAYOUT ── */
              <div className="space-y-1.5 sm:space-y-2 py-0.5">
                {/* Numbers row (Always visible for fast typing) */}
                <div className="flex gap-1 justify-center">
                  {NUMBER_ROW.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        handleKeyAction('insert', num);
                      }}
                      className="flex-1 min-w-[28px] sm:min-w-[34px] h-10 sm:h-11 rounded-lg border border-border bg-card hover:bg-accent font-semibold text-sm sm:text-base active:scale-95 transition-all flex items-center justify-center shadow-xs"
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Main letter / symbol rows */}
                {(mode === 'symbols' ? SYMBOL_ROWS : ALPHA_ROWS).map((row, ri) => (
                  <div key={ri} className="flex gap-1 justify-center">
                    {/* Shift button on the 3rd row for alpha mode */}
                    {mode === 'alpha' && ri === 2 && (
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          if (shift && !capsLock) {
                            setCapsLock(true);
                          } else if (capsLock) {
                            setCapsLock(false);
                            setShift(false);
                          } else {
                            setShift(true);
                          }
                        }}
                        className={cn(
                          'w-11 sm:w-14 h-10 sm:h-11 rounded-lg border flex items-center justify-center font-bold text-xs active:scale-95 transition-all shadow-xs',
                          capsLock
                            ? 'bg-primary text-primary-foreground border-primary'
                            : shift
                            ? 'bg-primary/20 text-primary border-primary/50'
                            : 'bg-muted/70 text-muted-foreground border-border hover:bg-muted'
                        )}
                        title={capsLock ? 'Caps Lock ON' : shift ? 'Shift ON' : 'Shift'}
                      >
                        <ArrowUp className={cn('size-4', capsLock && 'stroke-[3]')} />
                      </button>
                    )}

                    {row.map((char) => {
                      const display = (shift || capsLock) && mode === 'alpha' ? char.toUpperCase() : char;
                      return (
                        <button
                          key={char}
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            handleChar(char);
                          }}
                          className="flex-1 min-w-[28px] sm:min-w-[34px] h-10 sm:h-11 rounded-lg border border-border bg-card hover:bg-accent font-semibold text-sm sm:text-base active:scale-95 transition-all flex items-center justify-center shadow-xs"
                        >
                          {display}
                        </button>
                      );
                    })}

                    {/* Backspace on 3rd row */}
                    {ri === 2 && (
                      <button
                        type="button"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          startBackspaceRepeat();
                        }}
                        onPointerUp={stopBackspaceRepeat}
                        onPointerLeave={stopBackspaceRepeat}
                        className="w-11 sm:w-14 h-10 sm:h-11 rounded-lg border border-border bg-muted/80 hover:bg-muted text-foreground flex items-center justify-center active:scale-95 transition-all shadow-xs"
                        title="Backspace"
                      >
                        <Delete className="size-4 sm:size-5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Bottom row: symbols toggle, email shortcuts, spacebar, enter */}
                <div className="flex gap-1 justify-center pt-0.5">
                  {/* Mode switch key */}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setMode(mode === 'alpha' ? 'symbols' : 'alpha');
                    }}
                    className="w-12 sm:w-16 h-10 sm:h-11 rounded-lg border border-border bg-muted/80 hover:bg-muted font-bold text-xs text-foreground active:scale-95 transition-all flex items-center justify-center shadow-xs"
                  >
                    {mode === 'alpha' ? '?123' : 'ABC'}
                  </button>

                  {/* Convenient '@' key for email & usernames */}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyAction('insert', '@');
                    }}
                    className="w-9 sm:w-11 h-10 sm:h-11 rounded-lg border border-border bg-card hover:bg-accent font-bold text-sm active:scale-95 transition-all flex items-center justify-center shadow-xs"
                  >
                    @
                  </button>

                  {/* Convenient '.' key */}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyAction('insert', '.');
                    }}
                    className="w-9 sm:w-11 h-10 sm:h-11 rounded-lg border border-border bg-card hover:bg-accent font-bold text-sm active:scale-95 transition-all flex items-center justify-center shadow-xs"
                  >
                    .
                  </button>

                  {/* Convenient '.com' shortcut */}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyAction('insert', '.com');
                    }}
                    className="w-12 sm:w-14 h-10 sm:h-11 rounded-lg border border-border bg-card hover:bg-accent font-semibold text-xs active:scale-95 transition-all flex items-center justify-center shadow-xs text-muted-foreground hover:text-foreground"
                  >
                    .com
                  </button>

                  {/* Space bar */}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyAction('insert', ' ');
                    }}
                    className="flex-1 max-w-[320px] h-10 sm:h-11 rounded-lg border border-border bg-card hover:bg-accent font-semibold text-xs text-muted-foreground active:scale-95 transition-all flex items-center justify-center shadow-xs"
                  >
                    SPACE
                  </button>

                  {/* Clear button */}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyAction('clear');
                    }}
                    className="w-10 sm:w-13 h-10 sm:h-11 rounded-lg border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground font-semibold text-xs active:scale-95 transition-all flex items-center justify-center shadow-xs"
                    title="Clear input"
                  >
                    CLR
                  </button>

                  {/* Enter / Done button */}
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyAction('enter');
                    }}
                    className="w-14 sm:w-20 h-10 sm:h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center justify-center gap-1 shadow-md"
                  >
                    <CornerDownLeft className="size-4" />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
