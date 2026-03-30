/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOAM RACING — Type Definitions
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface TeamMember {
  name: string;
  role: "Piloto" | "Copiloto";
  carNumber: number;
  bio: string;
  initials: string;
}

export interface Car {
  number: number;
  year: number;
  model: string;
  crew: string[];
  preparationPercent: number;
  nickname?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SponsorZone {
  id: string;
  view: "lateral" | "frontal" | "trasera";
  label: string;
  tier: "premium" | "standard" | "basic";
  description: string;
  size: string;
  svgPath: string;
}

export interface SponsorTier {
  name: string;
  price: string;
  color: string;
  zones: string[];
  perks: string[];
  highlight?: boolean;
}

export interface CounterItem {
  target: number;
  suffix: string;
  label: string;
}

export interface GalleryItem {
  placeholder: string;
  caption: string;
  aspect: "square" | "portrait" | "landscape";
}

export interface CommunicationCard {
  title: string;
  excerpt: string;
  date: string;
  tag: string;
}

export interface SponsorshipState {
  activeView: "lateral" | "frontal" | "trasera";
  selectedZones: Set<string>;
  hoveredZone: string | null;
  companyName: string;
  logoUrl: string | null;
  logoScale: number;
  showContactModal: boolean;
}

export type SponsorshipAction =
  | { type: "SET_VIEW"; view: SponsorshipState["activeView"] }
  | { type: "TOGGLE_ZONE"; zoneId: string }
  | { type: "REMOVE_ZONE"; zoneId: string }
  | { type: "SET_HOVERED"; zoneId: string | null }
  | { type: "SET_COMPANY_NAME"; name: string }
  | { type: "SET_LOGO"; url: string | null }
  | { type: "SET_LOGO_SCALE"; scale: number }
  | { type: "TOGGLE_MODAL" }
  | { type: "RESET" };
