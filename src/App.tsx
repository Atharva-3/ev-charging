import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Site,
  SiteTrackerState,
  BoqCategory,
  BoqItem,
  ActiveView,
  BoqItemStatus,
  ExportPayload,
  ChecklistItem,
  UserSession,
  SiteSnag,
  SiteStatutoryRecord,
  SiteHealthAssessment
} from './types';
import {
  loadSavedSites,
  saveSites,
  loadSavedState,
  saveTrackerState,
  loadCustomBoqs,
  saveCustomBoqs,
  getCategoriesForSite,
  getPhoto,
  setPhoto,
  deletePhoto,
  exportAllData,
  importAllData,
  loadUserSession,
  saveUserSession,
  loadSavedSnags,
  saveSnags,
  loadSavedStatutoryRecords,
  saveStatutoryRecords,
  loadUserDatabase
} from './utils/storage';
import { getBoqStats, getDocStats, getDefaultItemState, fmtMoney } from './utils/formatters';
import { calculateSiteHealth } from './utils/predictions';
import {
  testFirestoreConnection,
  seedCloudDatabaseIfEmpty,
  subscribeToSites,
  saveSiteToCloud,
  deleteSiteFromCloud,
  subscribeToAllTrackers,
  saveTrackerStateToCloud,
  subscribeToCustomBoqs,
  saveCustomBoqToCloud,
  subscribeToSitePhotos,
  savePhotoToCloud,
  deletePhotoFromCloud,
  subscribeToSnags,
  saveSnagToCloud,
  deleteSnagFromCloud,
  subscribeToStatutoryRecords,
  saveStatutoryToCloud
} from './services/firebase';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { SiteSelector } from './components/SiteSelector';
import { SiteDirectoryView } from './components/SiteDirectoryView';
import { ViewTabs } from './components/ViewTabs';
import { StatsRow } from './components/StatsRow';
import { BoqView } from './components/BoqView';
import { DocsView } from './components/DocsView';
import { CostAnalysisView } from './components/CostAnalysisView';
import { SiteSpecsView } from './components/SiteSpecsView';
import { SiteMapView } from './components/SiteMapView';
import { PrintReport } from './components/PrintReport';
import { SiteModal } from './components/SiteModal';
import { BoqItemModal } from './components/BoqItemModal';
import { StatutoryView } from './components/StatutoryView';
import { SnagListView } from './components/SnagListView';
import { CommissioningDossierView } from './components/CommissioningDossierView';
import { QrCodePlacardModal } from './components/QrCodePlacardModal';
import { DelayAlertsModal } from './components/DelayAlertsModal';
import { DOC_CHECKLIST } from './data/initialData';

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(() => loadUserSession());
  const [usersList, setUsersList] = useState(() => loadUserDatabase());
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<string>('');
  const [pageMode, setPageMode] = useState<'directory' | 'site'>('directory');
  const [activeView, setActiveView] = useState<ActiveView>('boq');
  const [allState, setAllState] = useState<Record<string, SiteTrackerState>>({});
  const [customBoqs, setCustomBoqs] = useState<Record<string, BoqCategory[]>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [snags, setSnags] = useState<SiteSnag[]>(() => loadSavedSnags());
  const [statutoryRecords, setStatutoryRecords] = useState<Record<string, SiteStatutoryRecord>>(() => loadSavedStatutoryRecords());
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [openBoqCatNum, setOpenBoqCatNum] = useState<number | null>(1);
  const [openCostCatNum, setOpenCostCatNum] = useState<number | null>(1);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const [boqModalState, setBoqModalState] = useState<{
    isOpen: boolean;
    mode: 'add-item' | 'edit-item' | 'add-category';
    targetCatNum: number | null;
    targetItem?: { item: BoqItem; itemIndex: number } | null;
  }>({
    isOpen: false,
    mode: 'add-item',
    targetCatNum: null
  });

  // URL Hash Sync for individual site pages & back navigation
  const syncFromHash = useCallback((loadedSites: Site[]) => {
    const hash = window.location.hash;
    if (hash.startsWith('#/site/')) {
      const id = hash.replace('#/site/', '').split('/')[0];
      const match = loadedSites.find((s) => s.id === id);
      if (match) {
        setActiveSiteId(match.id);
        setPageMode('site');
        return;
      }
    } else if (hash === '#/sites') {
      setPageMode('directory');
      return;
    }

    // Default to first site if valid or directory
    if (loadedSites.length > 0) {
      setActiveSiteId(loadedSites[0].id);
      // If direct access with no hash, default to directory for overview
      setPageMode('directory');
    }
  }, []);

  // Initialize data on mount and connect real-time Cloud Firestore sync
  useEffect(() => {
    const loadedSites = loadSavedSites();
    const loadedState = loadSavedState();
    const loadedCustomBoqs = loadCustomBoqs();

    setSites(loadedSites);
    setAllState(loadedState);
    setCustomBoqs(loadedCustomBoqs);
    syncFromHash(loadedSites);
    setIsLoaded(true);

    const handleHashChange = () => {
      syncFromHash(loadedSites);
    };
    window.addEventListener('hashchange', handleHashChange);

    // Test Firestore connection & seed cloud if empty
    testFirestoreConnection().then(() => {
      seedCloudDatabaseIfEmpty();
    });

    // Real-time Cloud Firestore listeners
    const unsubscribeSites = subscribeToSites((cloudSites) => {
      if (cloudSites && cloudSites.length > 0) {
        setSites(cloudSites);
        saveSites(cloudSites);
      }
    });

    const unsubscribeTrackers = subscribeToAllTrackers((cloudTrackers) => {
      if (cloudTrackers && Object.keys(cloudTrackers).length > 0) {
        setAllState((prev) => {
          const merged = { ...prev, ...cloudTrackers };
          saveTrackerState(merged);
          return merged;
        });
      }
    });

    const unsubscribeBoqs = subscribeToCustomBoqs((cloudBoqs) => {
      if (cloudBoqs && Object.keys(cloudBoqs).length > 0) {
        setCustomBoqs((prev) => {
          const merged = { ...prev, ...cloudBoqs };
          saveCustomBoqs(merged);
          return merged;
        });
      }
    });

    const unsubscribeSnags = subscribeToSnags((cloudSnags) => {
      if (cloudSnags && cloudSnags.length > 0) {
        setSnags(cloudSnags);
        saveSnags(cloudSnags);
      }
    });

    const unsubscribeStatutory = subscribeToStatutoryRecords((cloudStat) => {
      if (cloudStat && Object.keys(cloudStat).length > 0) {
        setStatutoryRecords((prev) => {
          const merged = { ...prev, ...cloudStat };
          saveStatutoryRecords(merged);
          return merged;
        });
      }
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      unsubscribeSites();
      unsubscribeTrackers();
      unsubscribeBoqs();
      unsubscribeSnags();
      unsubscribeStatutory();
    };
  }, [syncFromHash]);

  // Reload photos when active site changes + real-time cloud photo sync
  const loadPhotosForSite = useCallback((siteId: string) => {
    const sitePhotos: Record<string, string> = {};
    Object.entries(DOC_CHECKLIST).forEach(([gk, group]) => {
      group.items.forEach((item, i) => {
        if (item.photo) {
          const docKey = `${gk}::${i}`;
          const p = getPhoto(siteId, docKey);
          if (p) sitePhotos[docKey] = p;
        }
      });
    });
    setPhotos(sitePhotos);
  }, []);

  useEffect(() => {
    if (!activeSiteId) return;
    loadPhotosForSite(activeSiteId);

    // Subscribe to real-time cloud photos for this active site
    const unsubscribePhotos = subscribeToSitePhotos(activeSiteId, (cloudPhotos) => {
      if (cloudPhotos && Object.keys(cloudPhotos).length > 0) {
        setPhotos((prev) => {
          const merged = { ...prev, ...cloudPhotos };
          Object.entries(cloudPhotos).forEach(([docKey, dataUrl]) => {
            setPhoto(activeSiteId, docKey, dataUrl);
          });
          return merged;
        });
      }
    });

    return () => {
      unsubscribePhotos();
    };
  }, [activeSiteId, loadPhotosForSite]);

  const activeCategories = activeSiteId ? getCategoriesForSite(activeSiteId, customBoqs) : [];
  const currentSiteState = activeSiteId ? allState[activeSiteId] : undefined;
  const currentSite = sites.find((s) => s.id === activeSiteId) || sites[0];

  const currentBoqStats = getBoqStats(activeCategories, currentSiteState);
  const currentDocStats = getDocStats(currentSiteState);

  const currentStatutory = statutoryRecords[activeSiteId] || {
    siteId: activeSiteId,
    stages: {},
    updatedAt: new Date().toISOString()
  };

  const currentHealth = useMemo(() => {
    return calculateSiteHealth(currentSite, activeCategories, currentSiteState, currentStatutory, snags);
  }, [currentSite, activeCategories, currentSiteState, currentStatutory, snags]);

  const openSnagsCount = useMemo(() => {
    return snags.filter((s) => s.siteId === activeSiteId && s.status !== 'resolved').length;
  }, [snags, activeSiteId]);

  // Navigation handlers
  const navigateToSite = (siteId: string) => {
    setActiveSiteId(siteId);
    setPageMode('site');
    window.location.hash = `#/site/${siteId}`;
  };

  const navigateToDirectory = () => {
    setPageMode('directory');
    window.location.hash = '#/sites';
  };

  // --- Site Management Handlers ---
  const handleAddSite = (siteData: Partial<Site>, templateChoice = 'standard') => {
    const newId = `site_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newSite: Site = {
      id: newId,
      name: siteData.name || 'New EV Charging Site',
      location: siteData.location || '',
      sanctionedLoad: siteData.sanctionedLoad || '120 kW',
      chargerCount: siteData.chargerCount || '1x 60kW DC + 1x 22kW AC',
      discomDivision: siteData.discomDivision || 'DISCOM Sub-Division',
      engineerInCharge: siteData.engineerInCharge || '',
      targetDate: siteData.targetDate || '',
      status: siteData.status || 'Planning',
      customSpecs: {
        'Sanctioned Load': siteData.sanctionedLoad || '120 kW',
        'DISCOM Division': siteData.discomDivision || '',
        'Target Commissioning': siteData.targetDate || '2026-11-30'
      },
      extraRequirements: [],
      logs: [
        {
          id: `log_init_${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: siteData.engineerInCharge || 'Site In-Charge',
          text: `Site workspace initialized with ${siteData.sanctionedLoad || '120 kW'} load configuration.`
        }
      ]
    };

    const updatedSites = [...sites, newSite];

    // Determine initial BOQ
    let initialBoq: BoqCategory[] = [];
    if (templateChoice === 'blank') {
      initialBoq = [];
    } else if (templateChoice.startsWith('clone:')) {
      const sourceId = templateChoice.replace('clone:', '');
      initialBoq = JSON.parse(JSON.stringify(getCategoriesForSite(sourceId, customBoqs)));
    } else {
      // standard template
      initialBoq = JSON.parse(JSON.stringify(getCategoriesForSite('vst-joatwara', customBoqs)));
    }

    const updatedCustomBoqs = {
      ...customBoqs,
      [newId]: initialBoq
    };

    setSites(updatedSites);
    saveSites(updatedSites);
    setCustomBoqs(updatedCustomBoqs);
    saveCustomBoqs(updatedCustomBoqs);

    // Sync new site and its BOQ to cloud Firestore
    saveSiteToCloud(newSite);
    saveCustomBoqToCloud(newId, initialBoq);

    // Navigate to this newly created site's individual page!
    navigateToSite(newId);
  };

  const handleEditSite = (id: string, siteData: Partial<Site>) => {
    const updatedSites = sites.map((s) => (s.id === id ? { ...s, ...siteData } : s));
    setSites(updatedSites);
    saveSites(updatedSites);
    const updated = updatedSites.find((s) => s.id === id);
    if (updated) {
      saveSiteToCloud(updated);
    }
  };

  const handleUpdateSiteFull = (updatedSite: Site) => {
    const updatedSites = sites.map((s) => (s.id === updatedSite.id ? updatedSite : s));
    setSites(updatedSites);
    saveSites(updatedSites);
    saveSiteToCloud(updatedSite);
  };

  const handleDeleteSite = (id: string) => {
    if (sites.length <= 1) return;
    const updatedSites = sites.filter((s) => s.id !== id);
    const updatedState = { ...allState };
    delete updatedState[id];

    const updatedCustomBoqs = { ...customBoqs };
    delete updatedCustomBoqs[id];

    setSites(updatedSites);
    saveSites(updatedSites);
    setAllState(updatedState);
    saveTrackerState(updatedState);
    setCustomBoqs(updatedCustomBoqs);
    saveCustomBoqs(updatedCustomBoqs);

    // Delete from cloud Firestore
    deleteSiteFromCloud(id);

    if (activeSiteId === id) {
      const fallbackId = updatedSites[0].id;
      setActiveSiteId(fallbackId);
      navigateToDirectory();
    }
  };

  // --- BOQ Customization Handlers (Add Item, Category, Edit, Delete) ---
  const handleSaveBoqItem = (catNum: number, item: BoqItem, itemIndex?: number) => {
    if (!activeSiteId) return;
    const currentCats = JSON.parse(JSON.stringify(getCategoriesForSite(activeSiteId, customBoqs))) as BoqCategory[];
    const cat = currentCats.find((c) => c.num === catNum);
    if (!cat) return;

    if (itemIndex !== undefined && itemIndex >= 0 && itemIndex < cat.items.length) {
      cat.items[itemIndex] = item;
    } else {
      cat.items.push(item);
    }

    // Recalculate category total
    cat.total = cat.items.reduce((sum, it) => sum + (typeof it.total === 'number' ? it.total : parseFloat(String(it.total)) || 0), 0);

    const updated = {
      ...customBoqs,
      [activeSiteId]: currentCats
    };
    setCustomBoqs(updated);
    saveCustomBoqs(updated);
    saveCustomBoqToCloud(activeSiteId, currentCats);
  };

  const handleSaveBoqCategory = (newCategory: BoqCategory) => {
    if (!activeSiteId) return;
    const currentCats = JSON.parse(JSON.stringify(getCategoriesForSite(activeSiteId, customBoqs))) as BoqCategory[];
    currentCats.push(newCategory);
    currentCats.sort((a, b) => a.num - b.num);

    const updated = {
      ...customBoqs,
      [activeSiteId]: currentCats
    };
    setCustomBoqs(updated);
    saveCustomBoqs(updated);
    saveCustomBoqToCloud(activeSiteId, currentCats);
  };

  const handleDeleteBoqItem = (catNum: number, itemIndex: number) => {
    if (!activeSiteId) return;
    const currentCats = JSON.parse(JSON.stringify(getCategoriesForSite(activeSiteId, customBoqs))) as BoqCategory[];
    const cat = currentCats.find((c) => c.num === catNum);
    if (!cat) return;

    cat.items.splice(itemIndex, 1);
    cat.total = cat.items.reduce((sum, it) => sum + (typeof it.total === 'number' ? it.total : parseFloat(String(it.total)) || 0), 0);

    const updated = {
      ...customBoqs,
      [activeSiteId]: currentCats
    };
    setCustomBoqs(updated);
    saveCustomBoqs(updated);
    saveCustomBoqToCloud(activeSiteId, currentCats);
  };

  const handleDeleteBoqCategory = (catNum: number) => {
    if (!activeSiteId) return;
    const currentCats = (JSON.parse(JSON.stringify(getCategoriesForSite(activeSiteId, customBoqs))) as BoqCategory[])
      .filter((c) => c.num !== catNum);

    const updated = {
      ...customBoqs,
      [activeSiteId]: currentCats
    };
    setCustomBoqs(updated);
    saveCustomBoqs(updated);
    saveCustomBoqToCloud(activeSiteId, currentCats);
  };

  // --- Document & Photo Customization ---
  const handleAddChecklistItem = (groupKey: string, text: string, photo: boolean) => {
    if (!activeSiteId) return;

    setAllState((prev) => {
      const siteS = prev[activeSiteId] || { boq: {}, docs: {}, customChecklists: {} };
      const currentList: ChecklistItem[] = siteS.customChecklists?.[groupKey] || [];
      const updatedList = [...currentList, { text, photo }];

      const updatedSiteState: SiteTrackerState = {
        ...siteS,
        customChecklists: {
          ...(siteS.customChecklists || {}),
          [groupKey]: updatedList
        }
      };

      const nextAll = {
        ...prev,
        [activeSiteId]: updatedSiteState
      };
      saveTrackerState(nextAll);
      saveTrackerStateToCloud(activeSiteId, updatedSiteState);
      return nextAll;
    });
  };

  const handleDeleteChecklistItem = (groupKey: string, customItemIndex: number) => {
    if (!activeSiteId) return;

    setAllState((prev) => {
      const siteS = prev[activeSiteId] || { boq: {}, docs: {}, customChecklists: {} };
      const currentList: ChecklistItem[] = [...(siteS.customChecklists?.[groupKey] || [])];
      currentList.splice(customItemIndex, 1);

      const updatedSiteState: SiteTrackerState = {
        ...siteS,
        customChecklists: {
          ...(siteS.customChecklists || {}),
          [groupKey]: currentList
        }
      };

      const nextAll = {
        ...prev,
        [activeSiteId]: updatedSiteState
      };
      saveTrackerState(nextAll);
      saveTrackerStateToCloud(activeSiteId, updatedSiteState);
      return nextAll;
    });
  };

  // --- BOQ Updates ---
  const handleUpdateBoqStatus = (itemKeyStr: string, status: BoqItemStatus) => {
    if (!activeSiteId) return;

    setAllState((prev) => {
      const siteS = prev[activeSiteId] || { boq: {}, docs: {} };
      const currentItem = siteS.boq[itemKeyStr] || getDefaultItemState();

      const updatedSiteState: SiteTrackerState = {
        ...siteS,
        boq: {
          ...siteS.boq,
          [itemKeyStr]: {
            ...currentItem,
            status
          }
        }
      };

      const nextAll = {
        ...prev,
        [activeSiteId]: updatedSiteState
      };
      saveTrackerState(nextAll);
      saveTrackerStateToCloud(activeSiteId, updatedSiteState);
      return nextAll;
    });
  };

  const handleUpdateBoqField = (itemKeyStr: string, field: 'qty' | 'notes', value: string) => {
    if (!activeSiteId) return;

    setAllState((prev) => {
      const siteS = prev[activeSiteId] || { boq: {}, docs: {} };
      const currentItem = siteS.boq[itemKeyStr] || getDefaultItemState();

      const updatedSiteState: SiteTrackerState = {
        ...siteS,
        boq: {
          ...siteS.boq,
          [itemKeyStr]: {
            ...currentItem,
            [field]: value
          }
        }
      };

      const nextAll = {
        ...prev,
        [activeSiteId]: updatedSiteState
      };
      saveTrackerState(nextAll);
      saveTrackerStateToCloud(activeSiteId, updatedSiteState);
      return nextAll;
    });
  };

  const handleUpdateCostField = (
    itemKeyStr: string,
    field: 'orderRate' | 'qty' | 'transportation' | 'installMaterialCost' | 'labourCharges',
    value: string
  ) => {
    if (!activeSiteId) return;

    setAllState((prev) => {
      const siteS = prev[activeSiteId] || { boq: {}, docs: {} };
      const currentItem = siteS.boq[itemKeyStr] || getDefaultItemState();

      const updatedSiteState: SiteTrackerState = {
        ...siteS,
        boq: {
          ...siteS.boq,
          [itemKeyStr]: {
            ...currentItem,
            [field]: value
          }
        }
      };

      const nextAll = {
        ...prev,
        [activeSiteId]: updatedSiteState
      };
      saveTrackerState(nextAll);
      saveTrackerStateToCloud(activeSiteId, updatedSiteState);
      return nextAll;
    });
  };

  // --- Document & Photo Updates ---
  const handleToggleDoc = (docKey: string) => {
    if (!activeSiteId) return;

    setAllState((prev) => {
      const siteS = prev[activeSiteId] || { boq: {}, docs: {} };
      const currentVal = Boolean(siteS.docs[docKey]);

      const updatedSiteState: SiteTrackerState = {
        ...siteS,
        docs: {
          ...siteS.docs,
          [docKey]: !currentVal
        }
      };

      const nextAll = {
        ...prev,
        [activeSiteId]: updatedSiteState
      };
      saveTrackerState(nextAll);
      saveTrackerStateToCloud(activeSiteId, updatedSiteState);
      return nextAll;
    });
  };

  const handleSavePhoto = (docKey: string, dataUrl: string) => {
    if (!activeSiteId) return;
    setPhoto(activeSiteId, docKey, dataUrl);
    setPhotos((prev) => ({ ...prev, [docKey]: dataUrl }));
    savePhotoToCloud(activeSiteId, docKey, dataUrl, userSession?.name);
  };

  const handleDeletePhoto = (docKey: string) => {
    if (!activeSiteId) return;
    deletePhoto(activeSiteId, docKey);
    setPhotos((prev) => {
      const copy = { ...prev };
      delete copy[docKey];
      return copy;
    });
    deletePhotoFromCloud(activeSiteId, docKey);
  };

  // --- Snag List Actions ---
  const handleAddSnag = (newSnag: SiteSnag) => {
    setSnags((prev) => {
      const next = [newSnag, ...prev];
      saveSnags(next);
      saveSnagToCloud(newSnag);
      return next;
    });
  };

  const handleUpdateSnag = (updatedSnag: SiteSnag) => {
    setSnags((prev) => {
      const next = prev.map((s) => (s.id === updatedSnag.id ? updatedSnag : s));
      saveSnags(next);
      saveSnagToCloud(updatedSnag);
      return next;
    });
  };

  const handleDeleteSnag = (snagId: string) => {
    setSnags((prev) => {
      const next = prev.filter((s) => s.id !== snagId);
      saveSnags(next);
      deleteSnagFromCloud(snagId);
      return next;
    });
  };

  // --- Statutory Compliance Actions ---
  const handleSaveStatutory = (record: SiteStatutoryRecord) => {
    setStatutoryRecords((prev) => {
      const next = { ...prev, [record.siteId]: record };
      saveStatutoryRecords(next);
      saveStatutoryToCloud(record);
      return next;
    });
  };

  // --- Backup & Report Actions ---
  const handleExport = () => {
    exportAllData(sites, allState, customBoqs);
  };

  const handleImport = (payload: ExportPayload) => {
    const success = importAllData(payload);
    if (success) {
      setSites(loadSavedSites());
      setAllState(loadSavedState());
      setCustomBoqs(loadCustomBoqs());
      if (payload.sitesList?.[0]?.id) {
        setActiveSiteId(payload.sitesList[0].id);
        loadPhotosForSite(payload.sitesList[0].id);
      }
      alert('Data restored successfully!');
    } else {
      alert('Failed to restore data from backup.');
    }
  };

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    saveUserSession(session);
    if (session.role === 'worker') {
      // Automatically route field worker directly to their assigned site workspace
      const targetSiteId = session.assignedSiteId || sites[0]?.id || '';
      if (targetSiteId) {
        navigateToSite(targetSiteId);
      }
      setActiveView('docs');
    } else {
      // Automatically route site controller to multi-site supervisory directory
      navigateToDirectory();
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    saveUserSession(null);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-medium text-[var(--steel)]">
        Loading tracker...
      </div>
    );
  }

  if (!userSession) {
    return <LoginPage sites={sites} onLogin={handleLogin} />;
  }

  return (
    <div className="w-full">
      {/* Main Screen Container */}
      <div className="no-print max-w-[1140px] mx-auto bg-[var(--paper)] rounded-xl border border-[var(--steel-line)] shadow-sm overflow-hidden my-2">
        <Header
          pageMode={pageMode}
          userSession={userSession}
          healthAssessment={pageMode === 'site' ? currentHealth : undefined}
          onOpenAlerts={() => setIsAlertsModalOpen(true)}
          onOpenQrPlacard={pageMode === 'site' ? () => setIsQrModalOpen(true) : undefined}
          onLogout={handleLogout}
          onNavigateDirectory={navigateToDirectory}
          onExport={handleExport}
          onImport={handleImport}
          onPrint={handlePrint}
        />

        {pageMode === 'directory' ? (
          /* Portfolio / All Sites Directory Page */
          <main className="p-6">
            <SiteDirectoryView
              sites={sites}
              allState={allState}
              customBoqs={customBoqs}
              userRole={userSession.role}
              getCategories={(id) => getCategoriesForSite(id, customBoqs)}
              onOpenSitePage={navigateToSite}
              onAddNewSite={() => {
                setEditingSite(null);
                setIsSiteModalOpen(true);
              }}
              onEditSite={(site) => {
                setEditingSite(site);
                setIsSiteModalOpen(true);
              }}
              onDeleteSite={handleDeleteSite}
            />
          </main>
        ) : (
          /* Individual Site Page */
          <>
            <SiteSelector
              sites={sites}
              activeSiteId={activeSiteId}
              userRole={userSession.role}
              onSelectSite={handleSelectSiteOnly => navigateToSite(handleSelectSiteOnly)}
              onBackToDirectory={navigateToDirectory}
              onAddSite={handleAddSite}
              onEditSite={handleEditSite}
              onDeleteSite={handleDeleteSite}
            />

            <ViewTabs
              activeView={activeView}
              onViewChange={setActiveView}
              userRole={userSession.role}
              openSnagsCount={openSnagsCount}
            />

            <StatsRow
              boqStats={currentBoqStats}
              docStats={currentDocStats}
              activeView={activeView}
            />

            {/* Main Content Area for Individual Site */}
            <main className="px-6 pt-3 pb-6">
              {activeView === 'boq' && (
                <BoqView
                  categories={activeCategories}
                  siteState={currentSiteState}
                  openCatNum={openBoqCatNum}
                  userRole={userSession.role}
                  onToggleCat={(num) =>
                    setOpenBoqCatNum((prev) => (prev === num ? null : num))
                  }
                  onUpdateStatus={handleUpdateBoqStatus}
                  onUpdateField={handleUpdateBoqField}
                  onAddItemClick={(catNum) => {
                    setBoqModalState({
                      isOpen: true,
                      mode: 'add-item',
                      targetCatNum: catNum || activeCategories[0]?.num || 1,
                      targetItem: null
                    });
                  }}
                  onAddCategoryClick={() => {
                    setBoqModalState({
                      isOpen: true,
                      mode: 'add-category',
                      targetCatNum: null,
                      targetItem: null
                    });
                  }}
                  onEditItemClick={(catNum, item, itemIndex) => {
                    setBoqModalState({
                      isOpen: true,
                      mode: 'edit-item',
                      targetCatNum: catNum,
                      targetItem: { item, itemIndex }
                    });
                  }}
                  onDeleteItem={handleDeleteBoqItem}
                  onDeleteCategory={handleDeleteBoqCategory}
                />
              )}

              {activeView === 'docs' && (
                <DocsView
                  siteId={activeSiteId}
                  site={currentSite}
                  siteState={currentSiteState}
                  photos={photos}
                  userRole={userSession.role}
                  userSession={userSession}
                  onToggleDoc={handleToggleDoc}
                  onSavePhoto={handleSavePhoto}
                  onDeletePhoto={handleDeletePhoto}
                  onAddChecklistItem={handleAddChecklistItem}
                  onDeleteChecklistItem={handleDeleteChecklistItem}
                />
              )}

              {activeView === 'statutory' && (
                <StatutoryView
                  site={currentSite}
                  statutoryRecord={currentStatutory}
                  userSession={userSession}
                  onSaveStatutory={handleSaveStatutory}
                />
              )}

              {activeView === 'snags' && (
                <SnagListView
                  site={currentSite}
                  snags={snags}
                  userSession={userSession}
                  usersList={usersList}
                  onAddSnag={handleAddSnag}
                  onUpdateSnag={handleUpdateSnag}
                  onDeleteSnag={handleDeleteSnag}
                />
              )}

              {activeView === 'dossier' && (
                <CommissioningDossierView
                  site={currentSite}
                  categories={activeCategories}
                  siteState={currentSiteState}
                  photos={photos}
                  statutory={currentStatutory}
                  snags={snags}
                  userSession={userSession}
                />
              )}

              {activeView === 'cost' && (
                <CostAnalysisView
                  categories={activeCategories}
                  siteState={currentSiteState}
                  openCatNum={openCostCatNum}
                  onToggleCat={(num) =>
                    setOpenCostCatNum((prev) => (prev === num ? null : num))
                  }
                  onUpdateCostField={handleUpdateCostField}
                />
              )}

              {activeView === 'specs' && (
                <SiteSpecsView
                  site={currentSite}
                  userRole={userSession.role}
                  onUpdateSite={handleUpdateSiteFull}
                />
              )}

              {activeView === 'map' && (
                <SiteMapView sites={sites} activeSiteId={activeSiteId} />
              )}
            </main>
          </>
        )}
      </div>

      {/* Weatherproof Site QR Placard Modal */}
      <QrCodePlacardModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        site={currentSite}
      />

      {/* Critical Milestone Alerts & Delay Predictor Modal */}
      <DelayAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        site={currentSite}
        health={currentHealth}
        onNavigateToView={(v) => setActiveView(v)}
      />

      {/* Global Site Modal (for Add / Edit Site from Directory or Top Bar) */}
      <SiteModal
        isOpen={isSiteModalOpen}
        site={editingSite}
        existingSites={sites}
        onClose={() => {
          setIsSiteModalOpen(false);
          setEditingSite(null);
        }}
        onSave={(siteData, templateChoice) => {
          if (editingSite) {
            handleEditSite(editingSite.id, siteData);
          } else {
            handleAddSite(siteData, templateChoice);
          }
          setIsSiteModalOpen(false);
          setEditingSite(null);
        }}
      />

      {/* Global BOQ Item / Category Modal */}
      <BoqItemModal
        isOpen={boqModalState.isOpen}
        mode={boqModalState.mode}
        categories={activeCategories}
        targetCatNum={boqModalState.targetCatNum}
        targetItem={boqModalState.targetItem}
        onClose={() => setBoqModalState((prev) => ({ ...prev, isOpen: false }))}
        onSaveItem={handleSaveBoqItem}
        onSaveCategory={handleSaveBoqCategory}
      />

      {/* Hidden Print Layout */}
      <PrintReport
        sites={sites}
        customBoqs={customBoqs}
        allState={allState}
        getCategories={(id) => getCategoriesForSite(id, customBoqs)}
      />
    </div>
  );
}
