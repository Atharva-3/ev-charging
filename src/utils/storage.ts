import { Site, SiteTrackerState, BoqCategory, ExportPayload, UserSession, UserAccount } from '../types';
import { INITIAL_BOQ_DATA, DEFAULT_SITE_LOCATION } from '../data/initialData';

const SITES_KEY = 'vst_sites_list_v1';
const STATE_KEY = 'vst_tracker_state_v1';
const CUSTOM_BOQ_KEY = 'vst_custom_boq_v1';
const PHOTO_KEY_PREFIX = 'vst_photo:';
const USER_SESSION_KEY = 'vst_user_session_v1';
const USERS_DATABASE_KEY = 'vst_users_database_v1';

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_ctrl_01',
    badgeId: 'VST-CTRL-01',
    email: 'controller@vstinfra.in',
    passwordPin: '1234',
    name: 'Er. Rakesh Sharma',
    role: 'manager',
    designation: 'Project Director & Chief Site Controller',
    department: 'Supervisory Control & Commissioning',
    phone: '+91 98290 11234'
  },
  {
    id: 'usr_ctrl_02',
    badgeId: 'VST-CTRL-02',
    email: 'priya.deshmukh@vstinfra.in',
    passwordPin: '1234',
    name: 'Er. Priya Deshmukh',
    role: 'manager',
    designation: 'Quality & Safety Audit Controller',
    department: 'Statutory DISCOM & CEIG Compliance',
    phone: '+91 98290 44556'
  },
  {
    id: 'usr_wrk_01',
    badgeId: 'VST-WRK-01',
    email: 'worker@vstinfra.in',
    passwordPin: '1234',
    name: 'Sunil Kumar',
    role: 'worker',
    designation: 'Lead Field Electrical Technician',
    department: 'I&C Field Execution',
    assignedSiteId: 'vst-joatwara',
    assignedSiteName: 'Jhotwara EV Fast Charging Hub',
    phone: '+91 94140 55678'
  },
  {
    id: 'usr_wrk_02',
    badgeId: 'VST-WRK-02',
    email: 'amit.verma@vstinfra.in',
    passwordPin: '1234',
    name: 'Amit Verma',
    role: 'worker',
    designation: 'Civil & Earth Pit Specialist',
    department: 'Civil Works & Foundation',
    assignedSiteId: 'vst-sitapura',
    assignedSiteName: 'Sitapura Industrial EV Hub',
    phone: '+91 94140 88990'
  },
  {
    id: 'usr_wrk_03',
    badgeId: 'VST-WRK-03',
    email: 'vikram.singh@vstinfra.in',
    passwordPin: '1234',
    name: 'Vikram Singh',
    role: 'worker',
    designation: 'HT Substation & Cabling Crew',
    department: 'High Voltage & Metering',
    assignedSiteId: 'vst-mansarovar',
    assignedSiteName: 'Mansarovar Metro EV Hub',
    phone: '+91 94140 22334'
  }
];

export const DEFAULT_MANAGER_USER: UserSession = {
  ...INITIAL_USER_ACCOUNTS[0],
  loginTime: new Date().toISOString()
};

export const DEFAULT_WORKER_USER: UserSession = {
  ...INITIAL_USER_ACCOUNTS[2],
  loginTime: new Date().toISOString()
};

export function loadUserDatabase(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DATABASE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load user database', e);
  }
  // Initialize with predefined accounts
  try {
    localStorage.setItem(USERS_DATABASE_KEY, JSON.stringify(INITIAL_USER_ACCOUNTS));
  } catch (e) {
    console.error('Failed to initialize user database', e);
  }
  return INITIAL_USER_ACCOUNTS;
}

export function saveUserDatabase(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_DATABASE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save user database', e);
  }
}

export function findUserInDatabase(identifier: string): UserAccount | undefined {
  if (!identifier) return undefined;
  const clean = identifier.trim().toLowerCase();
  const users = loadUserDatabase();
  return users.find(u =>
    u.email.toLowerCase() === clean ||
    u.badgeId.toLowerCase() === clean ||
    u.name.toLowerCase() === clean ||
    (u.phone && u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, ''))
  );
}

export function authenticateUser(
  identifier: string,
  pin: string
): { success: boolean; user?: UserSession; error?: string } {
  if (!identifier || !identifier.trim()) {
    return { success: false, error: 'Please enter your Employee Email or Badge ID.' };
  }
  if (!pin || !pin.trim()) {
    return { success: false, error: 'Please enter your 4-digit Security PIN.' };
  }

  const user = findUserInDatabase(identifier);
  if (!user) {
    return {
      success: false,
      error: `Personnel not found in VST database for identifier "${identifier.trim()}". Check spelling or select from registered credentials.`
    };
  }

  if (user.passwordPin !== pin.trim()) {
    return {
      success: false,
      error: `Invalid Security PIN for ${user.name}. (Default PIN is 1234)`
    };
  }

  const session: UserSession = {
    ...user,
    loginTime: new Date().toISOString()
  };

  saveUserSession(session);
  return { success: true, user: session };
}

export function registerNewPersonnel(accountData: Omit<UserAccount, 'id'>): UserAccount {
  const users = loadUserDatabase();
  const newAccount: UserAccount = {
    ...accountData,
    id: `usr_${accountData.role}_${Date.now()}`
  };
  const updated = [...users, newAccount];
  saveUserDatabase(updated);
  return newAccount;
}

export function loadUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load user session', e);
  }
  return null;
}

export function saveUserSession(session: UserSession | null): void {
  try {
    if (session) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save user session', e);
  }
}

export function loadSavedSites(): Site[] {
  try {
    const raw = localStorage.getItem(SITES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s: Site) => ({
          ...s,
          sanctionedLoad: s.sanctionedLoad || '120 kW',
          chargerCount: s.chargerCount || '1x 60kW DC Dual Gun + 1x 22kW AC',
          discomDivision: s.discomDivision || 'DISCOM Sub-Division',
          status: s.status || 'Electrical I&C',
          extraRequirements: s.extraRequirements || [],
          customSpecs: s.customSpecs || {},
          logs: s.logs || []
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load sites from storage', e);
  }
  // Default sites
  const defaults: Site[] = [
    {
      id: 'vst-joatwara',
      name: 'VST Joatwara EV Hub',
      location: DEFAULT_SITE_LOCATION,
      sanctionedLoad: '120 kW',
      chargerCount: '1x 60kW DC CCS2 Dual Gun + 1x 22kW Type 2 AC',
      discomDivision: 'JVVNL / Joatwara Sub-Division',
      engineerInCharge: 'Er. Rakesh Sharma',
      targetDate: '2026-10-30',
      status: 'Electrical I&C',
      customSpecs: {
        'Transformer Rating': '250 kVA (11kV / 433V Level-2)',
        'HT Metering Cubicle': '11 kV Outdoor CT/PT Metering Enclosure',
        'EV Tariff Category': 'LT/HT-EV Charging Tariff',
        'Earth Pit Resistance Target': '< 1.0 Ohm (Chemical Pipe Earthing)',
        'DISCOM Application No': 'JVVNL-EV-2026-0842',
        'Connected Substation': '33/11 kV Joatwara Industrial Feeder'
      },
      extraRequirements: [
        {
          id: 'req-1',
          title: 'Obtain Road Cutting NOC from Municipal Ward Office for HT cable crossing',
          category: 'Civil',
          priority: 'high',
          status: 'completed',
          dueDate: '2026-09-15',
          notes: 'Challan paid and NOC letter issued.'
        },
        {
          id: 'req-2',
          title: 'Coordinate 11kV Feeder Shutdown for HT GOS Structure Tap-Off',
          category: 'DISCOM',
          priority: 'high',
          status: 'in-progress',
          dueDate: '2026-09-25',
          notes: 'Application submitted to DISCOM AEN.'
        },
        {
          id: 'req-3',
          title: 'Supply and Install High-Mast 9m LED Solar Canopy Lighting',
          category: 'Electrical',
          priority: 'medium',
          status: 'pending',
          dueDate: '2026-10-05',
          notes: 'Required for 24/7 commercial EV driver security.'
        }
      ],
      logs: [
        {
          id: 'log-1',
          date: '2026-09-18 16:30',
          author: 'Er. Rakesh Sharma',
          text: 'Inspected 4x chemical earthing pits. Earth tester reading is 0.85 Ohm, well within specification.'
        },
        {
          id: 'log-2',
          date: '2026-09-15 11:00',
          author: 'Civil Contractor',
          text: 'Transformer plinth and RMU foundation curing completed (7 days water cure).'
        }
      ]
    }
  ];
  saveSites(defaults);
  return defaults;
}

export function saveSites(sites: Site[]): void {
  try {
    localStorage.setItem(SITES_KEY, JSON.stringify(sites));
  } catch (e) {
    console.error('Failed to save sites to storage', e);
  }
}

export function loadSavedState(): Record<string, SiteTrackerState> {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load tracker state', e);
  }
  return {};
}

export function saveTrackerState(state: Record<string, SiteTrackerState>): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save tracker state', e);
  }
}

export function loadCustomBoqs(): Record<string, BoqCategory[]> {
  try {
    const raw = localStorage.getItem(CUSTOM_BOQ_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load custom BOQs', e);
  }
  return {};
}

export function saveCustomBoqs(customBoqs: Record<string, BoqCategory[]>): void {
  try {
    localStorage.setItem(CUSTOM_BOQ_KEY, JSON.stringify(customBoqs));
  } catch (e) {
    console.error('Failed to save custom BOQs', e);
  }
}

export function getCategoriesForSite(siteId: string, customBoqs: Record<string, BoqCategory[]>): BoqCategory[] {
  if (customBoqs[siteId] && Array.isArray(customBoqs[siteId]) && customBoqs[siteId].length > 0) {
    return customBoqs[siteId];
  }
  if (INITIAL_BOQ_DATA[siteId]) {
    return INITIAL_BOQ_DATA[siteId];
  }
  // Clone standard template
  const template = INITIAL_BOQ_DATA['vst-joatwara'];
  return JSON.parse(JSON.stringify(template));
}

export function getPhoto(siteId: string, docKey: string): string | null {
  try {
    return localStorage.getItem(`${PHOTO_KEY_PREFIX}${siteId}:${docKey}`);
  } catch (e) {
    return null;
  }
}

export function setPhoto(siteId: string, docKey: string, dataUrl: string): boolean {
  try {
    localStorage.setItem(`${PHOTO_KEY_PREFIX}${siteId}:${docKey}`, dataUrl);
    return true;
  } catch (e) {
    console.warn('Failed to save photo (storage quota may be exceeded)', e);
    return false;
  }
}

export function deletePhoto(siteId: string, docKey: string): void {
  try {
    localStorage.removeItem(`${PHOTO_KEY_PREFIX}${siteId}:${docKey}`);
  } catch (e) {
    console.error('Failed to remove photo', e);
  }
}

export function getAllPhotos(): Record<string, string> {
  const photos: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PHOTO_KEY_PREFIX)) {
        const val = localStorage.getItem(key);
        if (val) photos[key] = val;
      }
    }
  } catch (e) {
    console.error('Error fetching all photos', e);
  }
  return photos;
}

export function exportAllData(
  sites: Site[],
  state: Record<string, SiteTrackerState>,
  customBoqs: Record<string, BoqCategory[]>
): void {
  const photos = getAllPhotos();
  const payload: ExportPayload = {
    exportedAt: new Date().toISOString(),
    sitesList: sites,
    state,
    customBoq: customBoqs,
    photos
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `vst-boq-tracker-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function importAllData(payload: ExportPayload): boolean {
  try {
    if (payload.sitesList && Array.isArray(payload.sitesList)) {
      saveSites(payload.sitesList);
    }
    if (payload.state) {
      saveTrackerState(payload.state);
    }
    if (payload.customBoq) {
      saveCustomBoqs(payload.customBoq);
    }
    if (payload.photos) {
      Object.entries(payload.photos).forEach(([k, v]) => {
        try {
          localStorage.setItem(k, v);
        } catch (e) {
          // ignore individual photo restore quota error
        }
      });
    }
    return true;
  } catch (e) {
    console.error('Failed to import backup data', e);
    return false;
  }
}

export function compressImageFile(file: File, maxDim = 900, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// -------------------------------------------------------------
// SNAG & PUNCH POINT PERSISTENCE
// -------------------------------------------------------------

export const STORAGE_KEY_SNAGS = 'vst_snags_v1';
export const STORAGE_KEY_STATUTORY = 'vst_statutory_v1';

export const INITIAL_SNAGS: import('../types').SiteSnag[] = [
  {
    id: 'snag-001',
    siteId: 'vst-joatwara',
    title: 'Earth pit EP-04 resistance reads 2.45 Ω (CEIG statutory threshold is ≤ 2.0 Ω)',
    category: 'Earthing & Lightning',
    severity: 'critical',
    status: 'open',
    locationDetails: 'Substation Yard South-West Corner (Near 160 kVA Transformer neutral)',
    assignedTo: 'Sunil Kumar',
    assignedToBadge: 'VST-WRK-01',
    targetDate: '2026-09-22',
    createdByName: 'Er. R.K. Sharma',
    createdByBadge: 'VST-CTRL-01',
    createdAt: '2026-09-18T10:30:00Z',
    resolutionNotes: ''
  },
  {
    id: 'snag-002',
    siteId: 'vst-joatwara',
    title: 'DC Fast Charger Gun B holster latch sticking intermittently during docking',
    category: 'EVSE Chargers',
    severity: 'minor',
    status: 'in-progress',
    locationDetails: 'Dispenser Unit 01 (CCS-2 Gun #2)',
    assignedTo: 'Sunil Kumar',
    assignedToBadge: 'VST-WRK-01',
    targetDate: '2026-09-24',
    createdByName: 'Er. Priya Deshmukh',
    createdByBadge: 'VST-CTRL-02',
    createdAt: '2026-09-18T14:15:00Z',
    resolutionNotes: 'OEM technician scheduled for contact alignment'
  },
  {
    id: 'snag-003',
    siteId: 'vst-sitapura',
    title: 'Cable trench missing sand cushioning (100mm) prior to laying 3.5C 300 sq.mm XLPE',
    category: 'LT Panels & Cabling',
    severity: 'major',
    status: 'open',
    locationDetails: 'Trench section between LT Breaker Panel and EVSE Canopy',
    assignedTo: 'Amit Verma',
    assignedToBadge: 'VST-WRK-02',
    targetDate: '2026-09-21',
    createdByName: 'Er. R.K. Sharma',
    createdByBadge: 'VST-CTRL-01',
    createdAt: '2026-09-17T11:00:00Z',
    resolutionNotes: ''
  },
  {
    id: 'snag-004',
    siteId: 'vst-mansarovar',
    title: 'Substation yard gravel spreading pending (150mm thick washed river pebble layer)',
    category: 'Civil & Foundation',
    severity: 'minor',
    status: 'open',
    locationDetails: '11kV Substation Switchyard enclosure',
    assignedTo: 'Vikram Singh',
    assignedToBadge: 'VST-WRK-03',
    targetDate: '2026-09-26',
    createdByName: 'Er. Priya Deshmukh',
    createdByBadge: 'VST-CTRL-02',
    createdAt: '2026-09-18T16:00:00Z',
    resolutionNotes: ''
  }
];

export function loadSavedSnags(): import('../types').SiteSnag[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNAGS);
    if (!raw) {
      saveSnags(INITIAL_SNAGS);
      return INITIAL_SNAGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_SNAGS;
  }
}

export function saveSnags(snags: import('../types').SiteSnag[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SNAGS, JSON.stringify(snags));
  } catch (err) {
    console.error('Failed to save snags', err);
  }
}

export function createInitialStatutoryRecord(siteId: string): import('../types').SiteStatutoryRecord {
  return {
    siteId,
    stages: {
      discom_load_sanction: {
        key: 'discom_load_sanction',
        title: 'DISCOM 11kV Load Sanction & Technical Feasibility',
        authority: 'State Electricity Distribution Company (DISCOM)',
        status: siteId === 'vst-joatwara' ? 'approved' : 'submitted',
        refNumber: siteId === 'vst-joatwara' ? 'DISCOM/JVVNL/COMM/2026/7821' : 'DISCOM/APP/2026/8991',
        appliedDate: '2026-08-10',
        approvedDate: siteId === 'vst-joatwara' ? '2026-08-28' : undefined,
        targetDate: '2026-08-30',
        feeAmount: '₹ 25,000 Application Processing Fee',
        notes: '150 kVA dedicated 11kV feeder bay approved at nearest 33/11kV Substation.'
      },
      demand_note_payment: {
        key: 'demand_note_payment',
        title: 'DISCOM Demand Note & Supervision Charges',
        authority: 'DISCOM Accounts / Revenue Cell',
        status: siteId === 'vst-joatwara' ? 'approved' : 'in-progress',
        refNumber: siteId === 'vst-joatwara' ? 'DN-JVVNL-44910' : 'DN-PENDING-02',
        appliedDate: '2026-08-30',
        approvedDate: siteId === 'vst-joatwara' ? '2026-09-04' : undefined,
        feeAmount: '₹ 4,85,000 Infrastructure & Line Deposit',
        paymentRef: 'RTGS: HDFC0000123-UTR-9812478',
        notes: 'Receipt generated and verified by executive accounts.'
      },
      transformer_fat_delivery: {
        key: 'transformer_fat_delivery',
        title: 'Transformer Factory Acceptance Test (FAT) & Routine Inspection',
        authority: 'Third Party Inspectorate & Manufacturer QA',
        status: siteId === 'vst-joatwara' ? 'approved' : 'approved',
        refNumber: 'FAT-TR-160KVA-2026-90',
        appliedDate: '2026-09-02',
        approvedDate: '2026-09-10',
        notes: 'Oil breakdown voltage (BDV) test passed at 68 kV. Megger insulation test > 2000 MΩ.'
      },
      ceig_inspection_application: {
        key: 'ceig_inspection_application',
        title: 'CEIG Electrical Inspectorate Drawing & Inspection Filing',
        authority: 'Chief Electrical Inspector to Government (CEIG)',
        status: siteId === 'vst-joatwara' ? 'in-progress' : 'submitted',
        refNumber: 'CEIG/RAJ/JAIPUR/2026/E-419',
        appliedDate: '2026-09-12',
        targetDate: '2026-09-24',
        officerContact: 'Dy. Electrical Inspector (Substation Div.)',
        notes: 'Single Line Diagram (SLD), structural earth layout, and equipment test certificates submitted.'
      },
      ceig_safety_clearance: {
        key: 'ceig_safety_clearance',
        title: 'CEIG Final Safety Energization Clearance Certificate',
        authority: 'Chief Electrical Inspector to Government (CEIG)',
        status: 'pending',
        targetDate: '2026-09-28',
        notes: 'Physical site walkdown and earth resistance verification scheduled before issue of energization order.'
      },
      bidirectional_meter_sync: {
        key: 'bidirectional_meter_sync',
        title: 'Bi-directional HT Energy Meter Installation & Grid Sync',
        authority: 'DISCOM Metering & Protection Division',
        status: 'pending',
        targetDate: '2026-09-30',
        notes: 'Secure Apex 0.2s class TOD/ABT meter to be sealed post CEIG energization certificate.'
      }
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'Er. R.K. Sharma (VST-CTRL-01)'
  };
}

export function loadSavedStatutoryRecords(): Record<string, import('../types').SiteStatutoryRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATUTORY);
    if (!raw) {
      const defaults: Record<string, import('../types').SiteStatutoryRecord> = {
        'vst-joatwara': createInitialStatutoryRecord('vst-joatwara'),
        'vst-sitapura': createInitialStatutoryRecord('vst-sitapura'),
        'vst-mansarovar': createInitialStatutoryRecord('vst-mansarovar')
      };
      saveStatutoryRecords(defaults);
      return defaults;
    }
    return JSON.parse(raw);
  } catch (err) {
    return {
      'vst-joatwara': createInitialStatutoryRecord('vst-joatwara')
    };
  }
}

export function saveStatutoryRecords(records: Record<string, import('../types').SiteStatutoryRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATUTORY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save statutory records', err);
  }
}

