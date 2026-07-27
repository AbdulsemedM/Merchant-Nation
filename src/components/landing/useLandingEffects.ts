"use client";

import { useEffect } from "react";
import { SECTION_IDS } from "./landing-content";

const GRID_COLS = 16;
const GRID_ROWS = 9;
const PULSE_INTERVAL_MS = 180;
/** How many cells light up each tick. */
const PULSE_BATCH = 4;
/** Ticks a cell stays hot before cooling to captured. */
const HOT_TICKS = 4;
/** Extra ticks before a captured cell fades out entirely. */
const COOL_TICKS = 14;

export function useLandingEffects() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".landing-page");
    if (!root) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    /* ---------------------------------------------------------------- nav */

    const nav = document.getElementById("nav");
    const onNavScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onNavScroll, { passive: true });
    onNavScroll();
    cleanups.push(() => window.removeEventListener("scroll", onNavScroll));

    /* ------------------------------------------- 1. territory capture sweep */

    const grid = document.getElementById("heroGrid");
    if (grid) {
      grid.style.setProperty("--grid-cols", String(GRID_COLS));
      grid.style.setProperty("--grid-rows", String(GRID_ROWS));

      if (grid.childElementCount === 0) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
          const cell = document.createElement("div");
          cell.className = "cell";
          frag.appendChild(cell);
        }
        grid.appendChild(frag);
      }

      const cells = Array.from(grid.children) as HTMLElement[];

      if (prefersReduced) {
        // Static claimed pattern instead of an animated conquest.
        cells.forEach((cell, i) => {
          if ((i * 7) % 11 < 3) cell.classList.add("captured");
        });
      } else {
        // Random cells light up like territory being claimed across the map.
        type Lit = { cell: HTMLElement; age: number };
        const lit: Lit[] = [];

        const timer = window.setInterval(() => {
          // Age existing lit cells: hot → captured → fade out.
          for (let i = lit.length - 1; i >= 0; i--) {
            const entry = lit[i];
            entry.age++;
            if (entry.age === HOT_TICKS) {
              entry.cell.classList.remove("captured-hot");
            } else if (entry.age >= COOL_TICKS) {
              entry.cell.classList.remove("captured");
              lit.splice(i, 1);
            }
          }

          // Light a random batch that aren't already lit.
          const free = cells.filter((c) => !c.classList.contains("captured"));
          for (let n = 0; n < PULSE_BATCH && free.length > 0; n++) {
            const pick = Math.floor(Math.random() * free.length);
            const cell = free.splice(pick, 1)[0];
            cell.classList.add("captured", "captured-hot");
            lit.push({ cell, age: 0 });
          }
        }, PULSE_INTERVAL_MS);

        cleanups.push(() => window.clearInterval(timer));
      }
    }

    /* ------------------------------------------------- 2. stat counter roll */

    const countUp = (el: HTMLElement) => {
      const target = parseInt(el.dataset.count ?? "0", 10);
      const duration = 1500;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const statStrip = document.getElementById("heroStats");
    if (statStrip) {
      const stats = Array.from(statStrip.querySelectorAll<HTMLElement>(".n"));
      if (prefersReduced) {
        stats.forEach((el) => {
          el.textContent = parseInt(el.dataset.count ?? "0", 10).toLocaleString();
        });
      } else {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              stats.forEach(countUp);
              observer.disconnect();
            }
          },
          { threshold: 0.4 }
        );
        observer.observe(statStrip);
        cleanups.push(() => observer.disconnect());
      }
    }

    /* -------------------------------------------------- 3. cycle rail fill */

    const cycle = document.getElementById("cycle");
    const railFill = document.getElementById("cycleRailFill");
    if (cycle && railFill && !prefersReduced) {
      const steps = Array.from(cycle.querySelectorAll<HTMLElement>(".cycle-step"));

      const onCycleScroll = () => {
        const rect = cycle.getBoundingClientRect();
        const span = rect.height + window.innerHeight * 0.5;
        const travelled = window.innerHeight * 0.8 - rect.top;
        const progress = Math.max(0, Math.min(1, travelled / span));

        railFill.style.setProperty("--progress", progress.toFixed(3));
        steps.forEach((step, i) => {
          step.classList.toggle("active", progress >= (i + 0.35) / steps.length);
        });
      };

      window.addEventListener("scroll", onCycleScroll, { passive: true });
      window.addEventListener("resize", onCycleScroll);
      onCycleScroll();
      cleanups.push(() => {
        window.removeEventListener("scroll", onCycleScroll);
        window.removeEventListener("resize", onCycleScroll);
      });
    } else if (cycle) {
      cycle.querySelectorAll(".cycle-step").forEach((s) => s.classList.add("active"));
    }

    /* --------------------------------------------- 4. sticky screen swapper */

    const showcase = document.getElementById("termShowcase");
    if (showcase) {
      const stepEls = Array.from(showcase.querySelectorAll<HTMLElement>(".term-step"));
      const screenEls = Array.from(showcase.querySelectorAll<HTMLElement>(".term-screen"));
      const counter = document.getElementById("termCurrent");
      let current = -1;

      const activate = (index: number) => {
        if (index === current) return;
        current = index;
        stepEls.forEach((el, i) => el.classList.toggle("active", i === index));
        screenEls.forEach((el, i) => el.classList.toggle("active", i === index));
        if (counter) counter.textContent = String(index + 1).padStart(2, "0");
      };

      const observer = new IntersectionObserver(
        (entries) => {
          // Pick the entry closest to the middle of the viewport.
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible) return;
          const index = Number((visible.target as HTMLElement).dataset.step ?? 0);
          activate(index);
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );

      stepEls.forEach((el) => observer.observe(el));
      cleanups.push(() => observer.disconnect());
    }

    /* ------------------------------------------------- baseline: reveals */

    const revealTargets = root.querySelectorAll<HTMLElement>(".reveal");
    if (prefersReduced) {
      revealTargets.forEach((el) => el.classList.add("in"));
    } else {
      revealTargets.forEach((el) => {
        if (!el.classList.contains("reveal-stagger")) return;
        Array.from(el.children).forEach((child, i) => {
          (child as HTMLElement).style.setProperty("--i", String(i));
        });
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("in");
            observer.unobserve(e.target);
          });
        },
        { threshold: 0.12 }
      );
      revealTargets.forEach((el) => observer.observe(el));
      cleanups.push(() => observer.disconnect());
    }

    /* ------------------------------------- baseline: in-page anchor scroll */

    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      const id = anchor?.getAttribute("href")?.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    };
    root.addEventListener("click", onAnchorClick);
    cleanups.push(() => root.removeEventListener("click", onAnchorClick));

    /* ---------------------------------------------- baseline: scroll spy */

    const navLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".landing-page .nav-links a")
    );
    if (navLinks.length > 0) {
      // Geometry rather than IntersectionObserver, so the highlight also clears
      // while the hero or footer occupies the reference line.
      const onSpy = () => {
        const line = window.innerHeight * 0.42;
        const currentId = SECTION_IDS.find((id) => {
          const rect = document.getElementById(id)?.getBoundingClientRect();
          return rect ? rect.top <= line && rect.bottom > line : false;
        });
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            currentId !== undefined && link.getAttribute("href") === `#${currentId}`
          );
        });
      };
      window.addEventListener("scroll", onSpy, { passive: true });
      window.addEventListener("resize", onSpy);
      onSpy();
      cleanups.push(() => {
        window.removeEventListener("scroll", onSpy);
        window.removeEventListener("resize", onSpy);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
}
