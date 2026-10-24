import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Pause, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HANDOVER_TOUR } from "./tour-steps";

const findTarget = (name: string) => document.querySelector<HTMLElement>(`[data-tour="${name}"]`) ?? document.querySelector<HTMLElement>('[data-tour="panel"]');

type Rect = { top: number; left: number; width: number; height: number };

export function HandoverTour({ step, onStep, onClose }: { step: number; onStep: (step: number) => void; onClose: () => void }) {
  const current = HANDOVER_TOUR[step];
  const dialog = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const previous = document.activeElement;
    const workspace = document.querySelector<HTMLElement>("[data-tour-workspace]");
    workspace?.setAttribute("inert", "");
    dialog.current?.focus();
    return () => {
      workspace?.removeAttribute("inert");
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);

  useEffect(() => {
    if (!current) return;
    if (dialog.current) dialog.current.scrollTop = 0;
    const exact = () => document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`);
    let observed: HTMLElement | null = null;
    const observer = new ResizeObserver(() => measure());
    const scrollTo = (el: HTMLElement) => window.scrollTo({ top: Math.max(0, window.scrollY + el.getBoundingClientRect().top - 86), behavior: "instant" });
    const measure = () => {
      const el = exact() ?? findTarget(current.target);
      if (el && el !== observed) {
        if (observed) observer.unobserve(observed);
        observer.observe(el); observed = el; scrollTo(el);
      }
      const popup = dialog.current?.getBoundingClientRect();
      if (!el || !popup) { setRect(null); return; }
      const bounds = el.getBoundingClientRect();
      const narrow = window.innerWidth < 640;
      const top = Math.max(72, bounds.top - 5);
      let left = Math.max(8, bounds.left - 5);
      let right = Math.min(window.innerWidth - 8, bounds.right + 5);
      let bottom = Math.min(window.innerHeight - 12, bounds.bottom + 5);
      const overlaps = right > popup.left - 12 && left < popup.right + 12 && bottom > popup.top - 12;
      if (overlaps) {
        // Prefer trimming beside the popup when that keeps more of the target visible than trimming above it.
        const sideRight = popup.left - 12;
        const aboveArea = (right - left) * Math.max(0, popup.top - 12 - top);
        const sideArea = (sideRight - left) * (bottom - top);
        if (!narrow && sideRight - left > 200 && sideArea > aboveArea) right = sideRight;
        else {
          const limit = Math.min(bottom, popup.top - 12);
          // Snap to the last row that fits fully so the outline never slices through text or icons.
          let snapped = 0;
          el.querySelectorAll<HTMLElement>("li, section, h2, p, button, form").forEach((child) => {
            const b = child.getBoundingClientRect().bottom + 5;
            if (b <= limit && b > top + 24 && b > snapped) snapped = b;
          });
          bottom = snapped || limit;
        }
      }
      left = Math.min(left, right);
      setRect(bottom > top && right > left ? { top, left, width: right - left, height: bottom - top } : null);
    };
    const frame = requestAnimationFrame(measure);
    // Lazily rendered targets (such as the visual map) appear after the step starts.
    const poll = window.setInterval(() => { if (exact() !== observed) measure(); }, 150);
    const stopPoll = window.setTimeout(() => window.clearInterval(poll), 3000);
    if (dialog.current) observer.observe(dialog.current);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => { cancelAnimationFrame(frame); window.clearInterval(poll); window.clearTimeout(stopPoll); observer.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true); };
  }, [current]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (step < HANDOVER_TOUR.length - 1) onStep(step + 1);
      else setPlaying(false);
    }, 14000);
    return () => window.clearTimeout(timer);
  }, [playing, step, onStep]);

  if (!current) return null;
  const last = step === HANDOVER_TOUR.length - 1;
  return createPortal(<div className="handover-tour" onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); onClose(); }
    if (event.key === "Tab") {
      const controls = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
      const first = controls[0]; const end = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); end?.focus(); }
      else if (!event.shiftKey && (document.activeElement === end || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus(); }
    }
  }}>
    {rect ? <>
      <div className="tour-dim" style={{ top: 0, left: 0, right: 0, height: rect.top }} />
      <div className="tour-dim" style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }} />
      <div className="tour-dim" style={{ top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }} />
      <div className="tour-dim" style={{ top: rect.top + rect.height, bottom: 0, left: 0, right: 0 }} />
      <div data-testid="tour-highlight" className="tour-highlight" style={rect} />
    </> : <div className="tour-dim fixed inset-0" />}
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body" tabIndex={-1} className="tour-popup bg-popover text-popover-foreground">
      <div className="flex items-center justify-between gap-2">
        <p className="editorial-label" aria-live="polite">Step {step + 1} of {HANDOVER_TOUR.length} · {current.label}</p>
        <Button variant="ghost" size="icon" aria-label="Close walkthrough" onClick={onClose}><X /></Button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <h2 id="tour-title" className="mt-2 text-2xl">{current.title}</h2>
        <p id="tour-body" className="mt-3 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
        <div className="mt-4 border-l-2 border-foreground pl-3"><p className="editorial-label">Why it matters</p><p className="mt-1 text-sm font-medium">{current.value}</p></div>
      </div>
      <div className="mt-5 flex gap-1.5" aria-hidden="true">{HANDOVER_TOUR.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-sm ${i <= step ? "bg-primary" : "bg-border"}`} />)}</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Previous step" disabled={step === 0} onClick={() => { setPlaying(false); onStep(step - 1); }}><ArrowLeft /></Button>
          <Button size="sm" onClick={() => { setPlaying(false); if (last) onClose(); else onStep(step + 1); }}>{last ? "Finish" : "Next"}{last ? <Check /> : <ArrowRight />}</Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" aria-pressed={playing} onClick={() => setPlaying(p => !p)}>{playing ? <Pause /> : <Play />}{playing ? "Pause" : "Auto-play"}</Button>
          <Button variant="ghost" size="sm" onClick={onClose}>Skip</Button>
        </div>
      </div>
    </div>
  </div>, document.body);
}