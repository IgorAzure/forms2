import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNEdE5JgXp6zLOqsW__e232yPCeyir7_A",
  authDomain: "forms-27cd7.firebaseapp.com",
  databaseURL: "https://forms-27cd7-default-rtdb.firebaseio.com/",
  projectId: "forms-27cd7",
  storageBucket: "forms-27cd7.firebasestorage.app",
  messagingSenderId: "S814907710390",
  appId: "1:814907710390:web:998a69a7cee3409a0e3f17",
  measurementId: "G-ZZ23ESRVVG"
};

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
