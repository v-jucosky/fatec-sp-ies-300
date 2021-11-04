import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getFirestore();

export { firebaseApp, database };
