import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyC3fjOk-Xs7vN4eqbPbvgKzmhTCjo9DOQM",
  authDomain: "console-iot.firebaseapp.com",
  projectId: "console-iot",
  storageBucket: "console-iot.firebasestorage.app",
  messagingSenderId: "22321226754",
  appId: "1:22321226754:web:52ae57d5b1b40d8e36b31b"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export { database, ref, onValue, set }
