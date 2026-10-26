/**
 * Cloud Firestore Service for NetLab
 * Manages persistent storage of network topologies, user profiles, chat messages, and simulation runs in Cloud Firestore.
 * Automatically falls back to backend REST API when Firebase is not configured.
 */

import {
  db,
  isFirebaseConfigured,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from './firebase';
import { api } from './api';

export const firestoreService = {
  /**
   * Save or update a virtual network topology in Firestore
   */
  async saveNetwork(userId, networkData) {
    if (!isFirebaseConfigured || !db) {
      // Fallback to SQLite backend REST API
      return api.saveNetwork(networkData);
    }

    const netId = networkData.id || `net_${Date.now()}`;
    const netRef = doc(db, 'networks', netId);

    const payload = {
      id: netId,
      userId: userId || 'anonymous',
      name: networkData.name || 'Untitled Network',
      description: networkData.description || '',
      devices: networkData.devices || [],
      links: networkData.links || [],
      updatedAt: serverTimestamp()
    };

    await setDoc(netRef, payload, { merge: true });
    return { success: true, networkId: netId, storage: 'firestore' };
  },

  /**
   * Load all saved networks for a given user from Firestore
   */
  async getUserNetworks(userId) {
    if (!isFirebaseConfigured || !db) {
      const res = await api.getNetworks();
      return res.networks || [];
    }

    try {
      const q = query(
        collection(db, 'networks'),
        where('userId', 'in', [userId || 'anonymous', 'default'])
      );
      const snapshot = await getDocs(q);
      const networks = [];
      snapshot.forEach(docSnap => {
        networks.push({ id: docSnap.id, ...docSnap.data() });
      });
      return networks;
    } catch (err) {
      console.warn('Firestore query failed, loading from local API:', err.message);
      const res = await api.getNetworks();
      return res.networks || [];
    }
  },

  /**
   * Save a chat message to Cloud Firestore
   */
  async saveMessage(messageData) {
    if (!isFirebaseConfigured || !db) return;

    try {
      await addDoc(collection(db, 'messages'), {
        ...messageData,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn('Failed to save message to Firestore:', err.message);
    }
  },

  /**
   * Listen to real-time chat messages from Cloud Firestore
   */
  subscribeToMessages(callback) {
    if (!isFirebaseConfigured || !db) return () => {};

    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach(doc => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      callback(msgs.reverse());
    });
  },

  /**
   * Save simulation results to Firestore for persistent lab records
   */
  async saveSimulation(userId, simulationResult) {
    if (!isFirebaseConfigured || !db) return;

    try {
      await addDoc(collection(db, 'simulations'), {
        userId: userId || 'guest',
        result: simulationResult.result,
        summary: simulationResult.summary,
        explanation: simulationResult.explanation,
        networkLayer: simulationResult.networkLayer,
        metrics: simulationResult.metrics || {},
        hops: simulationResult.hops || [],
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn('Failed to save simulation to Firestore:', err.message);
    }
  }
};
