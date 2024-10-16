import admin from 'firebase-admin';
import { readFile } from 'fs/promises'; // ESM compatible way to read the service account JSON

let isFirebaseInitialized = false; // Flag to ensure app isn't used before initialization

// Function to initialize Firebase Admin SDK
async function initializeFirebase() {
  if (!isFirebaseInitialized) {
    try {
      const serviceAccount = JSON.parse(
        await readFile(new URL('firebase.json', import.meta.url))
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://workshop-social-network.firebaseio.com', // Replace with your project ID
      });

      console.log('Firebase initialized');
      isFirebaseInitialized = true;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw new Error('Failed to initialize Firebase');
    }
  }
}

// Function to return Firestore instance only after initialization
const db = () => {
  if (!isFirebaseInitialized) {
    throw new Error('Firebase has not been initialized yet');
  }
  return admin.firestore();
};

// Function to get images data from Firestore
export async function getImagesData() {
  try {
    // Initialize Firebase if it hasn't been initialized yet
    await initializeFirebase();

    const imagesCollection = db().collection('images');
    const snapshot = await imagesCollection.get();

    if (snapshot.empty) {
      console.log('No images found in the collection.');
      return [];
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting images data:', error);
    throw new Error('Failed to get images data');
  }
}

export { db }; // Export db function
