import type { LucideIcon } from "lucide-react";
import { Building2, CreditCard, QrCode, Smartphone, User } from "lucide-react";

export const INDUCTION_PRODUCT_KEYS = [
  "INDIVIDUAL",
  "CORPORATE",
  "QR_CODE",
  "POS_MACHINE",
  "MICHU",
] as const;

export type InductionProductKey = (typeof INDUCTION_PRODUCT_KEYS)[number];

export type InductionProduct = {
  key: InductionProductKey;
  label: string;
  icon: LucideIcon;
  registrationUrl: string;
};

const COOP_BANK_INDIVIDUAL_URL = "https://my.coopbankoromiasc.com/individualaccount";
const COOP_BANK_CORPORATE_URL = "https://my.coopbankoromiasc.com/oraganization";

export const INDUCTION_PRODUCTS: InductionProduct[] = [
  {
    key: "INDIVIDUAL",
    label: "Individual account",
    icon: User,
    registrationUrl: COOP_BANK_INDIVIDUAL_URL,
  },
  {
    key: "CORPORATE",
    label: "Corporate account",
    icon: Building2,
    registrationUrl: COOP_BANK_CORPORATE_URL,
  },
  {
    key: "QR_CODE",
    label: "QR-code",
    icon: QrCode,
    registrationUrl: "https://google.com",
  },
  {
    key: "POS_MACHINE",
    label: "POS Machine",
    icon: CreditCard,
    registrationUrl: "https://google.com",
  },
  {
    key: "MICHU",
    label: "Michu",
    icon: Smartphone,
    registrationUrl: "https://google.com",
  },
];

export function isInductionProductKey(value: string): value is InductionProductKey {
  return (INDUCTION_PRODUCT_KEYS as readonly string[]).includes(value);
}
