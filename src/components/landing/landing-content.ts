import {
  Bell,
  Building2,
  Compass,
  Flame,
  Map,
  MapPin,
  Radar,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Operations", href: "#operations" },
  { label: "Gameplay", href: "#gameplay" },
  { label: "Roles", href: "#roles" },
  { label: "Field Loop", href: "#loop" },
] as const;

export const HERO_STATS = [
  { value: "1,200+", label: "Zones mapped" },
  { value: "38", label: "Live branches" },
  { value: "94%", label: "Missions cleared" },
] as const;

export const TICKER_ITEMS: { icon: LucideIcon; text: string }[] = [
  { icon: MapPin, text: "Zone Bole-04 CAPTURED" },
  { icon: Trophy, text: "Meron reached Scout Officer" },
  { icon: Radar, text: "New recon: Merkato District" },
  { icon: Flame, text: "Team Adama on a 21-day streak" },
  { icon: ShieldCheck, text: "Q2 Merchant Drive · 94% cleared" },
  { icon: Building2, text: "38 branches synced live" },
];

/** Accent tone for a card icon; maps to the scoped palette in landing.css. */
export type Tone = "primary" | "accent" | "teal";

export const FEATURES: {
  icon: LucideIcon;
  title: string;
  desc: string;
  tone: Tone;
}[] = [
  {
    icon: Map,
    title: "Live territory map",
    desc: "See every zone, branch pin, and merchant lead on one tactical map — colour-coded from UNSEEN to CAPTURED.",
    tone: "primary",
  },
  {
    icon: Radar,
    title: "Scout & recon",
    desc: "Log new businesses in the field with GPS, photos, and category intel. Earn XP on every transmitted report.",
    tone: "accent",
  },
  {
    icon: Compass,
    title: "Guided induction",
    desc: "Turn leads into registered merchants through a three-step KYC wizard — verify, onboard, and take the oath.",
    tone: "teal",
  },
  {
    icon: Target,
    title: "Missions & tasks",
    desc: "Managers launch campaigns and assign targets. Field staff accept, complete, and submit for approval.",
    tone: "primary",
  },
  {
    icon: Trophy,
    title: "Ranks, XP & streaks",
    desc: "Climb from Scout Cadet to Commander. Keep your daily streak alive and top the branch leaderboard.",
    tone: "accent",
  },
  {
    icon: Bell,
    title: "Multi-channel alerts",
    desc: "Push, Telegram, and WhatsApp notifications keep every officer synced to new tasks and achievements.",
    tone: "teal",
  },
];

export const RANKS = [
  { name: "Scout Cadet", active: false },
  { name: "Scout Officer", active: true },
  { name: "Field Captain", active: false },
  { name: "Commander", active: false },
] as const;

export const XP_PROGRESS = {
  rank: "Scout Officer",
  current: 2610,
  target: 3800,
  nextRank: "Field Captain",
} as const;

export const LEADERBOARD = [
  { name: "Meron T.", branch: "Bole", xp: 2840, you: false },
  { name: "You", branch: "Merkato", xp: 2610, you: true },
  { name: "Dawit A.", branch: "Adama", xp: 2480, you: false },
  { name: "Sara K.", branch: "Hawassa", xp: 2210, you: false },
] as const;

export const ROLES: {
  icon: LucideIcon;
  name: string;
  tagline: string;
  points: string[];
  highlight?: boolean;
}[] = [
  {
    icon: User,
    name: "Branch Staff",
    tagline: "Field officers & scouts",
    points: [
      "Scout & induct merchants",
      "Complete assigned tasks",
      "Track XP, rank & streaks",
    ],
  },
  {
    icon: ShieldCheck,
    name: "Branch Manager",
    tagline: "Branch leadership & oversight",
    points: [
      "Define territory boundaries",
      "Create missions & assign tasks",
      "Approve field submissions",
    ],
    highlight: true,
  },
  {
    icon: Settings,
    name: "Administrator",
    tagline: "HQ & organization-wide control",
    points: [
      "Manage all branches & staff users",
      "Configure ranks & categories",
      "View nationwide operational summary",
    ],
  },
];

export const LOOP_STEPS: {
  icon: LucideIcon;
  step: string;
  title: string;
  desc: string;
}[] = [
  {
    icon: Radar,
    step: "01",
    title: "Scout",
    desc: "Discover merchants on the map and transmit recon intel.",
  },
  {
    icon: Compass,
    step: "02",
    title: "Induct",
    desc: "Onboard leads through the guided KYC wizard.",
  },
  {
    icon: Target,
    step: "03",
    title: "Complete",
    desc: "Clear assigned missions and submit for approval.",
  },
  {
    icon: Trophy,
    step: "04",
    title: "Level up",
    desc: "Earn XP, climb ranks, and capture the territory.",
  },
];

export const FOOTER_TAGLINE = "\u201cBank Smarter, Live Better.\u201d — Cooperative Bank of Oromia";
