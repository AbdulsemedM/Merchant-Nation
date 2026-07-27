export const SECTION_IDS = [
  "operation",
  "terminal",
  "command",
  "advancement",
  "deploy",
] as const;

export type LandingSectionId = (typeof SECTION_IDS)[number];

export const NAV_SECTIONS: {
  href: `#${LandingSectionId}`;
  label: string;
  id: LandingSectionId;
}[] = [
  { href: "#operation", label: "Operation", id: "operation" },
  { href: "#terminal", label: "Field Terminal", id: "terminal" },
  { href: "#command", label: "Roles", id: "command" },
  { href: "#advancement", label: "Ranks", id: "advancement" },
];

export const MARQUEE_PHRASES = [
  "Scout zones",
  "+20 XP",
  "Induct merchants",
  "+100 XP",
  "Execute missions",
  "Capture territory",
  "Rank up",
  "Field ops live",
] as const;

export const HERO_STATS = [
  { value: 128, label: "Zones captured" },
  { value: 94, label: "Merchants active" },
  { value: 612, label: "Recon reports" },
  { value: 37, label: "Missions live" },
] as const;

export type CycleStep = {
  index: string;
  op: string;
  title: string;
  copy: string;
  xp: string;
  xpGhost?: boolean;
};

export const CYCLE_STEPS: CycleStep[] = [
  {
    index: "01",
    op: "Recon",
    title: "Scout",
    copy: "Tap a cell on the live territory map and file a recon report — business name, category, daily volume, a photo. Thirty seconds in the field.",
    xp: "+20 XP",
  },
  {
    index: "02",
    op: "Onboard",
    title: "Induct",
    copy: "Convert a scouted lead into a registered merchant through a three-step wizard: verify, KYC and products, oath.",
    xp: "+100 XP",
  },
  {
    index: "03",
    op: "Deploy",
    title: "Execute",
    copy: "Accept missions and tasks from your branch manager, then work them from Pending through Submitted to Approved.",
    xp: "Branch goals",
    xpGhost: true,
  },
  {
    index: "04",
    op: "Advance",
    title: "Grow",
    copy: "Every action earns XP. Climb the rank ladder, build a streak, and see exactly where you stand on the leaderboard.",
    xp: "Rank up",
    xpGhost: true,
  },
];

export const TERMINAL_SCREENS = [
  {
    src: "/images/landing/img-0.png",
    alt: "Live territory dashboard",
    title: "The whole territory, live",
    copy: "Every branch gets a map of its operating area, split into cells that shift colour as they are scouted and captured.",
  },
  {
    src: "/images/landing/img-1.png",
    alt: "Cell drawer with Scout Zone and Induct Merchant actions",
    title: "Tap a cell, choose your move",
    copy: "Scout Zone or Induct Merchant, straight from the map. No menu diving, no separate tool to open.",
  },
  {
    src: "/images/landing/img-2.png",
    alt: "Recon report form",
    title: "OP-01: Recon Report",
    copy: "Category, daily volume, competing services, and a storefront photo — filed in under a minute on a phone.",
  },
  {
    src: "/images/landing/img-3.png",
    alt: "Branch territory editing",
    title: "Draw the territory",
    copy: "Branch managers define the operating area in a few taps, and every officer on the team sees it instantly.",
  },
  {
    src: "/images/landing/img-4.png",
    alt: "Activity streak and notification settings",
    title: "Streaks and alerts",
    copy: "Telegram, WhatsApp, and web push keep the operation moving, alongside a live activity streak.",
  },
  {
    src: "/images/landing/img-5.png",
    alt: "Contribution heatmap and leaderboard",
    title: "Heatmap and leaderboard",
    copy: "A full year of activity at a glance, and exactly where every officer ranks inside the branch.",
  },
] as const;

export const ROLES = [
  {
    tag: "Field Officer",
    title: "Player",
    sub: "Sales officers and scouts",
    featured: false,
    items: [
      "Scout and induct merchants",
      "Accept and complete tasks",
      "Submit daily field reports",
      "Track XP, rank, and streak",
    ],
  },
  {
    tag: "Field Command",
    title: "Branch Manager",
    sub: "Middle management",
    featured: true,
    items: [
      "Everything a Player does",
      "Define branch territory",
      "Assign, approve, and delegate",
      "Manage users and teams",
    ],
  },
  {
    tag: "Headquarters",
    title: "Administrator",
    sub: "Head office and IT",
    featured: false,
    items: [
      "Configure the whole system",
      "Manage every branch",
      "Set ranks and categories",
      "Org-wide reporting",
    ],
  },
] as const;

export const RANKS = [
  { code: "R1", name: "Cadet", xp: "0 – 500 XP" },
  { code: "R2", name: "Officer", xp: "500 – 2,000 XP" },
  { code: "R3", name: "Captain", xp: "2,000 – 3,000 XP" },
  { code: "R4", name: "General", xp: "3,000+ XP" },
] as const;

/** Where the illustrative "you are here" marker sits on the rank ladder. */
export const LADDER_POSITION = "58%";

export const DEPLOY_URL = "merchant-nation-2omx.vercel.app";
