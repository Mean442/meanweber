import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// 🚀 PRODUCTION DATABASE ARCHITECTURE (Firebase Firestore)
// To activate real production storage, replace the keys below with your values from Firebase Console (firebase.google.com)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123:web:456"
};

let db = null;

// Initialize Firebase safely
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.warn("⚠️ Firebase keys not configured. Falling back to Local Storage mode.");
}

// Global interface for app.js to interact with the database
window.saveContactMessageToDB = async (email, message) => {
    // If Firebase is configured properly, save to Cloud Database
    if (db && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        try {
            await addDoc(collection(db, "contact_messages"), {
                email: email,
                message: message,
                timestamp: new Date()
            });
            console.log("✅ Message saved to Firebase Firestore successfully.");
            return true;
        } catch (e) {
            console.error("❌ Error writing to database: ", e);
            return false;
        }
    } else {
        // 🧪 Development Fallback Mode (Local Database)
        // If no keys, store the data inside the browser's persistent local storage safely
        const localDB = JSON.parse(localStorage.getItem('meanweber_database') || '[]');
        localDB.push({ 
            table: "contact_messages", 
            email: email, 
            message: message, 
            timestamp: new Date().toISOString() 
        });
        localStorage.setItem('meanweber_database', JSON.stringify(localDB));
        console.log("✅ Message saved to Local DB Fallback.", localDB);
        return true; // Simulate success
    }
};
