export type BoqItemStatus = 'pending' | 'ordered' | 'installed' | 'verified';

export interface BoqItem {
  sr: string | number;
  desc: string;
  make: string | number;
  unit: string;
  uom: number | string;
  rate: number | string;
  total: number | string;
  remark: string;
}

export interface BoqCategory {
  num: number;
  name: string;
  total: number | string;
  items: BoqItem[];
}

export interface SiteRequirement {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface SiteLogEntry {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface Site {
  id: string;
  name: string;
  location?: string;
  sanctionedLoad?: string;
  chargerCount?: string;
  discomDivision?: string;
  engineerInCharge?: string;
  targetDate?: string;
  status?: 'Planning' | 'Civil Work' | 'Electrical I&C' | 'Testing & Approvals' | 'Commissioned';
  customSpecs?: Record<string, string>;
  extraRequirements?: SiteRequirement[];
  logs?: SiteLogEntry[];
}

export interface BoqItemState {
  status: BoqItemStatus;
  qty: string;
  notes: string;
  orderRate: string;
  transportation: string;
  installMaterialCost: string;
  labourCharges: string;
}

export interface SiteTrackerState {
  boq: Record<string, BoqItemState>;
  docs: Record<string, boolean>;
  customChecklists?: Record<string, ChecklistItem[]>;
}

export interface ChecklistItem {
  text: string;
  photo?: boolean;
}

export interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}

export type ChecklistData = Record<string, ChecklistGroup>;

export type ActiveView = 'boq' | 'docs' | 'cost' | 'specs' | 'statutory' | 'snags' | 'dossier' | 'map';

export type SnagSeverity = 'critical' | 'major' | 'minor';
export type SnagStatus = 'open' | 'in-progress' | 'resolved';

export interface SiteSnag {
  id: string;
  siteId: string;
  title: string;
  category: 'Civil & Foundation' | 'HT / Transformer' | 'LT Panels & Cabling' | 'EVSE Chargers' | 'Earthing & Lightning' | 'Safety & Signage' | 'Statutory / Quality' | 'Other';
  severity: SnagSeverity;
  status: SnagStatus;
  locationDetails?: string;
  assignedTo?: string;
  assignedToBadge?: string;
  targetDate?: string;
  createdByName?: string;
  createdByBadge?: string;
  createdAt: string;
  photoBefore?: string;
  resolutionNotes?: string;
  photoAfter?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type StatutoryStageKey =
  | 'discom_load_sanction'
  | 'demand_note_payment'
  | 'transformer_fat_delivery'
  | 'ceig_inspection_application'
  | 'ceig_safety_clearance'
  | 'bidirectional_meter_sync';

export interface StatutoryStage {
  key: StatutoryStageKey;
  title: string;
  authority: string;
  status: 'pending' | 'in-progress' | 'submitted' | 'approved' | 'query-raised';
  refNumber?: string;
  appliedDate?: string;
  approvedDate?: string;
  targetDate?: string;
  feeAmount?: string;
  paymentRef?: string;
  officerContact?: string;
  documentUrl?: string;
  notes?: string;
}

export interface SiteStatutoryRecord {
  siteId: string;
  stages: Record<StatutoryStageKey, StatutoryStage>;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DelayAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  severity?: 'critical' | 'major' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  category: string;
  impactDays?: number;
  recommendation?: string;
  suggestedAction?: string;
  relatedView?: 'statutory' | 'snags' | 'boq' | 'docs';
}

export interface SiteHealthAssessment {
  status: 'on-track' | 'minor-risk' | 'delayed';
  score: number; // 0 - 100
  healthScore?: number;
  daysRemaining: number;
  projectedCommissioningDate?: string;
  boqProgress: number;
  docsProgress: number;
  statutoryProgress: number;
  openSnagsCount: number;
  criticalSnagsCount: number;
  breakdown?: {
    boqPct: number;
    docCompliancePct: number;
    statutoryPct: number;
    snagsIntegrityPct: number;
  };
  alerts: DelayAlert[];
}

export type UserRole = 'manager' | 'worker';

export interface UserAccount {
  id: string;
  badgeId: string; // e.g. "VST-CTRL-01" or "VST-WRK-01"
  email: string;
  passwordPin: string;
  name: string;
  role: UserRole; // 'manager' = site controller / supervisor; 'worker' = field worker
  designation: string;
  department?: string;
  assignedSiteId?: string;
  assignedSiteName?: string;
  phone?: string;
}

export interface UserSession extends UserAccount {
  loginTime: string;
}

export interface BoqStats {
  pct: number;
  totalItems: number;
  plannedTotal: number;
  actualTotal: number;
}

export interface CatStats {
  pct: number;
  plannedTotal: number;
  actualTotal: number;
}

export interface DocStats {
  total: number;
  checked: number;
  pct: number;
}

export interface ExportPayload {
  exportedAt: string;
  sitesList: Site[];
  state: Record<string, SiteTrackerState>;
  customBoq: Record<string, BoqCategory[]>;
  photos: Record<string, string>;
}
