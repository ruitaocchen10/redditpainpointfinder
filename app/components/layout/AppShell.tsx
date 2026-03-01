"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

const DESKTOP_WIDTH_DEFAULT = 224;
const DESKTOP_WIDTH_MIN = 160;
const DESKTOP_WIDTH_MAX = 480;
const COMPACT_WIDTH = 64;

const WIDTH_STORAGE_KEY = "ui.sidebar.width";
const COMPACT_STORAGE_KEY = "ui.sidebar.compact";

function clampWidth(width: number) {
  return Math.max(DESKTOP_WIDTH_MIN, Math.min(DESKTOP_WIDTH_MAX, width));
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarWidth, setSidebarWidth] = useState(DESKTOP_WIDTH_DEFAULT);
  const [isCompact, setIsCompact] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const resizeCleanupRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    try {
      const storedWidth = window.localStorage.getItem(WIDTH_STORAGE_KEY);
      if (storedWidth) {
        const parsed = Number(storedWidth);
        if (Number.isFinite(parsed)) {
          window.requestAnimationFrame(() => setSidebarWidth(clampWidth(parsed)));
        }
      }

      const storedCompact = window.localStorage.getItem(COMPACT_STORAGE_KEY);
      if (storedCompact === "true") {
        window.requestAnimationFrame(() => setIsCompact(true));
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(WIDTH_STORAGE_KEY, String(sidebarWidth));
    } catch {
      // ignore localStorage errors
    }
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COMPACT_STORAGE_KEY, String(isCompact));
    } catch {
      // ignore localStorage errors
    }
  }, [isCompact]);

  useEffect(() => {
    return () => {
      if (resizeCleanupRef.current) {
        resizeCleanupRef.current();
      }
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-resizing", isDragging);
    return () => {
      document.body.classList.remove("sidebar-resizing");
    };
  }, [isDragging]);

  useEffect(() => {
    if (!isMobileDrawerOpen) {
      document.body.classList.remove("drawer-open");
      return;
    }

    document.body.classList.add("drawer-open");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileDrawerOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("drawer-open");
    };
  }, [isMobileDrawerOpen]);

  const desktopWidth = useMemo(() => {
    return isCompact ? COMPACT_WIDTH : sidebarWidth;
  }, [isCompact, sidebarWidth]);

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const onMove = (moveEvent: PointerEvent) => {
      setSidebarWidth(clampWidth(startWidth + (moveEvent.clientX - startX)));
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setIsDragging(false);
      resizeCleanupRef.current = null;
    };

    if (resizeCleanupRef.current) {
      resizeCleanupRef.current();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    resizeCleanupRef.current = onUp;

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  return (
    <div className="flex min-h-screen">
      <div className="sidebar-container hidden md:flex relative shrink-0" data-resizing={isDragging} style={{ width: `${desktopWidth}px` }}>
        <Sidebar
          compact={isCompact}
          onToggleCompact={() => setIsCompact((value) => !value)}
          className="w-full"
        />

        {!isCompact ? (
          <button
            type="button"
            className={`sidebar-resizer ${isDragging ? "is-active" : ""}`}
            aria-label="Resize sidebar"
            title="Drag to resize sidebar"
            onPointerDown={startResize}
          >
            <span className="sidebar-resizer-dots" aria-hidden="true"><span /></span>
          </button>
        ) : null}
      </div>

      <div className="md:hidden fixed top-0 left-0 right-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur px-3 h-14 flex items-center gap-2">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="h-9 w-9 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">RedditPains</span>
      </div>

      <div
        className={
          "md:hidden fixed inset-0 z-40 transition-opacity " +
          (isMobileDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
        aria-hidden={!isMobileDrawerOpen}
      >
        <button
          type="button"
          aria-label="Close sidebar"
          className="absolute inset-0 bg-zinc-950/40"
          onClick={() => setIsMobileDrawerOpen(false)}
        />

        <div
          className={
            "absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] transition-transform duration-200 " +
            (isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full")
          }
        >
          <Sidebar
            compact={false}
            onToggleCompact={() => undefined}
            isMobile
            onNavigate={() => setIsMobileDrawerOpen(false)}
            className="w-full"
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto main-bg pt-14 md:pt-0">{children}</main>
    </div>
  );
}
