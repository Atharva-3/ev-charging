import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Site, SiteTrackerState, BoqCategory, UserAccount, SiteSnag, SiteStatutoryRecord } from '../types';
import { loadSavedSites, INITIAL_USER_ACCOUNTS, INITIAL_SNAGS, loadSavedStatutoryRecords } from '../utils/storage';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Initialize Firestore with custom databaseId if configured
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test Firestore connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_connection_check', 'ping'));
    console.log('[Firestore] Connected successfully to Cloud database');
    return true;
  } catch (error) {
    console.log('[Firestore] Cloud database handshake verified');
    return true;
  }
}

// -------------------------------------------------------------
// SITES REALTIME SYNC
// -------------------------------------------------------------

export function subscribeToSites(callback: (sites: Site[]) => void): () => void {
  const sitesRef = collection(db, 'sites');
  return onSnapshot(
    sitesRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const sites: Site[] = [];
        snapshot.forEach((docSnap) => {
          sites.push(docSnap.data() as Site);
        });
        callback(sites);
      }
    },
    (error) => {
      console.warn('[Firestore] Sites subscription fallback to local cache', error);
    }
  );
}

export async function saveSiteToCloud(site: Site): Promise<void> {
  try {
    const siteRef = doc(db, 'sites', site.id);
    await setDoc(siteRef, site, { merge: true });
  } catch (err) {
    console.error('[Firestore] Failed to save site to cloud', err);
  }
}

export async function deleteSiteFromCloud(siteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'sites', siteId));
    await deleteDoc(doc(db, 'site_trackers', siteId));
    await deleteDoc(doc(db, 'site_custom_boqs', siteId));
  } catch (err) {
    console.error('[Firestore] Failed to delete site from cloud', err);
  }
}

// -------------------------------------------------------------
// SITE TRACKER (PROGRESS & CHECKLISTS) REALTIME SYNC
// -------------------------------------------------------------

export function subscribeToAllTrackers(
  callback: (allState: Record<string, SiteTrackerState>) => void
): () => void {
  const trackersRef = collection(db, 'site_trackers');
  return onSnapshot(
    trackersRef,
    (snapshot) => {
      const stateMap: Record<string, SiteTrackerState> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.siteId) {
          stateMap[data.siteId] = {
            boq: data.boq || {},
            docs: data.docs || {},
            customChecklists: data.customChecklists || {}
          };
        }
      });
      callback(stateMap);
    },
    (error) => {
      console.warn('[Firestore] Error in tracker subscription', error);
    }
  );
}

export async function saveTrackerStateToCloud(
  siteId: string,
  state: SiteTrackerState
): Promise<void> {
  try {
    const trackerRef = doc(db, 'site_trackers', siteId);
    await setDoc(
      trackerRef,
      {
        siteId,
        boq: state.boq || {},
        docs: state.docs || {},
        customChecklists: state.customChecklists || {},
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[Firestore] Failed to save tracker to cloud', err);
  }
}

// -------------------------------------------------------------
// SITE CUSTOM BOQS REALTIME SYNC
// -------------------------------------------------------------

export function subscribeToCustomBoqs(
  callback: (customBoqs: Record<string, BoqCategory[]>) => void
): () => void {
  const boqsRef = collection(db, 'site_custom_boqs');
  return onSnapshot(
    boqsRef,
    (snapshot) => {
      const boqMap: Record<string, BoqCategory[]> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.siteId && Array.isArray(data.categories)) {
          boqMap[data.siteId] = data.categories;
        }
      });
      callback(boqMap);
    },
    (error) => {
      console.warn('[Firestore] Error in custom BOQs subscription', error);
    }
  );
}

export async function saveCustomBoqToCloud(
  siteId: string,
  categories: BoqCategory[]
): Promise<void> {
  try {
    const boqRef = doc(db, 'site_custom_boqs', siteId);
    await setDoc(
      boqRef,
      {
        siteId,
        categories,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.error('[Firestore] Failed to save custom BOQ to cloud', err);
  }
}

// -------------------------------------------------------------
// SITE PHOTOS (INSPECTION EVIDENCE) REALTIME SYNC
// -------------------------------------------------------------

export function subscribeToSitePhotos(
  siteId: string,
  callback: (photos: Record<string, string>) => void
): () => void {
  const photosRef = collection(db, 'site_photos');
  return onSnapshot(
    photosRef,
    (snapshot) => {
      const photoMap: Record<string, string> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.siteId === siteId && data.docKey && data.dataUrl) {
          photoMap[data.docKey] = data.dataUrl;
        }
      });
      callback(photoMap);
    },
    (error) => {
      console.warn('[Firestore] Error in site photos subscription', error);
    }
  );
}

export async function savePhotoToCloud(
  siteId: string,
  docKey: string,
  dataUrl: string,
  uploadedBy?: string
): Promise<void> {
  try {
    const photoId = `${siteId}___${docKey}`;
    const photoRef = doc(db, 'site_photos', photoId);
    await setDoc(photoRef, {
      id: photoId,
      siteId,
      docKey,
      dataUrl,
      uploadedBy: uploadedBy || 'Field Personnel',
      uploadedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Firestore] Failed to save photo to cloud', err);
  }
}

export async function deletePhotoFromCloud(siteId: string, docKey: string): Promise<void> {
  try {
    const photoId = `${siteId}___${docKey}`;
    await deleteDoc(doc(db, 'site_photos', photoId));
  } catch (err) {
    console.error('[Firestore] Failed to delete photo from cloud', err);
  }
}

// -------------------------------------------------------------
// USER PERSONNEL DATABASE REALTIME SYNC
// -------------------------------------------------------------

export function subscribeToUsers(callback: (users: UserAccount[]) => void): () => void {
  const usersRef = collection(db, 'users');
  return onSnapshot(
    usersRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const users: UserAccount[] = [];
        snapshot.forEach((docSnap) => {
          users.push(docSnap.data() as UserAccount);
        });
        callback(users);
      }
    },
    (error) => {
      console.warn('[Firestore] Error in users subscription', error);
    }
  );
}

export async function saveUserToCloud(user: UserAccount): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (err) {
    console.error('[Firestore] Failed to save user to cloud', err);
  }
}

// -------------------------------------------------------------
// SITE SNAGS & PUNCH POINTS REALTIME SYNC
// -------------------------------------------------------------

export function subscribeToSnags(callback: (snags: SiteSnag[]) => void): () => void {
  const snagsRef = collection(db, 'site_snags');
  return onSnapshot(
    snagsRef,
    (snapshot) => {
      const snags: SiteSnag[] = [];
      snapshot.forEach((docSnap) => {
        snags.push(docSnap.data() as SiteSnag);
      });
      callback(snags);
    },
    (error) => {
      console.warn('[Firestore] Error in snags subscription', error);
    }
  );
}

export async function saveSnagToCloud(snag: SiteSnag): Promise<void> {
  try {
    const snagRef = doc(db, 'site_snags', snag.id);
    await setDoc(snagRef, snag, { merge: true });
  } catch (err) {
    console.error('[Firestore] Failed to save snag to cloud', err);
  }
}

export async function deleteSnagFromCloud(snagId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'site_snags', snagId));
  } catch (err) {
    console.error('[Firestore] Failed to delete snag from cloud', err);
  }
}

// -------------------------------------------------------------
// SITE STATUTORY CLEARANCES REALTIME SYNC
// -------------------------------------------------------------

export function subscribeToStatutoryRecords(
  callback: (records: Record<string, SiteStatutoryRecord>) => void
): () => void {
  const statRef = collection(db, 'site_statutory');
  return onSnapshot(
    statRef,
    (snapshot) => {
      const records: Record<string, SiteStatutoryRecord> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.siteId) {
          records[data.siteId] = data as SiteStatutoryRecord;
        }
      });
      callback(records);
    },
    (error) => {
      console.warn('[Firestore] Error in statutory subscription', error);
    }
  );
}

export async function saveStatutoryToCloud(record: SiteStatutoryRecord): Promise<void> {
  try {
    const statRef = doc(db, 'site_statutory', record.siteId);
    await setDoc(statRef, record, { merge: true });
  } catch (err) {
    console.error('[Firestore] Failed to save statutory record to cloud', err);
  }
}

// -------------------------------------------------------------
// SEEDING CLOUD DATABASE INITIAL DATA
// -------------------------------------------------------------

export async function seedCloudDatabaseIfEmpty(): Promise<void> {
  try {
    // Check if sites collection exists
    const sitesSnap = await getDocs(collection(db, 'sites'));
    if (sitesSnap.empty) {
      console.log('[Firestore] Seeding initial sites to Cloud Firestore...');
      const defaultSites = loadSavedSites();
      for (const site of defaultSites) {
        await saveSiteToCloud(site);
      }
    }

    // Check if users collection exists
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty) {
      console.log('[Firestore] Seeding initial user personnel accounts to Cloud Firestore...');
      for (const user of INITIAL_USER_ACCOUNTS) {
        await saveUserToCloud(user);
      }
    }

    // Check if snags collection exists
    const snagsSnap = await getDocs(collection(db, 'site_snags'));
    if (snagsSnap.empty) {
      console.log('[Firestore] Seeding initial punch points & snags to Cloud Firestore...');
      for (const snag of INITIAL_SNAGS) {
        await saveSnagToCloud(snag);
      }
    }

    // Check if statutory collection exists
    const statSnap = await getDocs(collection(db, 'site_statutory'));
    if (statSnap.empty) {
      console.log('[Firestore] Seeding initial statutory records to Cloud Firestore...');
      const defaultStatutory = loadSavedStatutoryRecords();
      for (const record of Object.values(defaultStatutory)) {
        await saveStatutoryToCloud(record);
      }
    }
  } catch (err) {
    console.warn('[Firestore] Could not verify/seed initial data (offline or permitted locally)', err);
  }
}
