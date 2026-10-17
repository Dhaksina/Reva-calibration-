/**
 * REVA PHOENIX CALIBRATION — FIREBASE FIRESTORE SYNC CLIENT
 * Dual-sync for Laboratories, Documents, and Images directly to Firebase Cloud Firestore
 */
(function () {
  'use strict';

  let firestoreDb = null;

  function initFirestore() {
    if (typeof firebase === 'undefined') return null;
    if (firestoreDb) return firestoreDb;
    try {
      if (!firebase.apps.length && window.CLOUD_CONFIG && window.CLOUD_CONFIG.firebase) {
        firebase.initializeApp(window.CLOUD_CONFIG.firebase);
      }
      if (typeof firebase.firestore === 'function') {
        firestoreDb = firebase.firestore();
        console.log('[Firebase Firestore] Initialized successfully.');
        return firestoreDb;
      }
    } catch (err) {
      console.warn('[Firebase Firestore] Init warning:', err.message);
    }
    return null;
  }

  const FirebaseFirestore = {
    getDb: initFirestore,

    // Sync all laboratories to Firestore collection 'laboratories'
    async syncLaboratories(labsList) {
      const db = initFirestore();
      if (!db || !Array.isArray(labsList)) return false;
      const batch = db.batch();
      labsList.forEach(lab => {
        const docRef = db.collection('laboratories').doc(String(lab.id));
        batch.set(docRef, {
          ...lab,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
      try {
        await batch.commit();
        console.log(`[Firebase Firestore] Synced ${labsList.length} laboratories.`);
        return true;
      } catch (err) {
        console.warn('[Firebase Firestore] syncLaboratories error:', err.message);
        return false;
      }
    },

    // Sync all documents/brochures to Firestore collection 'documents'
    async syncDocuments(docsList) {
      const db = initFirestore();
      if (!db || !Array.isArray(docsList)) return false;
      const batch = db.batch();
      docsList.forEach(doc => {
        const docRef = db.collection('documents').doc(String(doc.id));
        batch.set(docRef, {
          ...doc,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
      try {
        await batch.commit();
        console.log(`[Firebase Firestore] Synced ${docsList.length} documents.`);
        return true;
      } catch (err) {
        console.warn('[Firebase Firestore] syncDocuments error:', err.message);
        return false;
      }
    },

    // Sync all site images to Firestore collection 'site_images'
    async syncImages(imagesList) {
      const db = initFirestore();
      if (!db || !Array.isArray(imagesList)) return false;
      const batch = db.batch();
      imagesList.forEach(img => {
        const docRef = db.collection('site_images').doc(String(img.id));
        batch.set(docRef, {
          ...img,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      });
      try {
        await batch.commit();
        console.log(`[Firebase Firestore] Synced ${imagesList.length} images.`);
        return true;
      } catch (err) {
        console.warn('[Firebase Firestore] syncImages error:', err.message);
        return false;
      }
    },

    // Sync full database in one operation
    async syncAll(siteDb) {
      if (!siteDb) return false;
      let success = true;
      if (Array.isArray(siteDb.laboratories)) {
        const res = await this.syncLaboratories(siteDb.laboratories);
        if (!res) success = false;
      }
      if (siteDb.content && Array.isArray(siteDb.content.resources)) {
        const res = await this.syncDocuments(siteDb.content.resources);
        if (!res) success = false;
      }
      if (Array.isArray(siteDb.siteImages)) {
        const res = await this.syncImages(siteDb.siteImages);
        if (!res) success = false;
      }
      return success;
    }
  };

  window.FirebaseFirestore = FirebaseFirestore;
})();
