// configuration
const firebaseConfig = {
    // We need to get these details from the user or the firebase init output.
    // For now, I will use placeholders and ask the user to fill them or try to find them.
    // Actually, since we used `firebase init`, we should use the /__/firebase/init.js auto-configuration for hosting,
    // BUT that only works if we use the specific hosting URLs.
    // Since we are using CDNs, we need the config object.

    // waiting for user to provide config or extracting from previous steps?
    // I will try to read it from the project settings if I can, but I can't via CLI easily without `firebase apps:sdkconfig`.
};

// However, usually for these hosted apps, we can just use the standard import.
// Let's rely on the window.firebaseModules defined in HTML for imports.

const { initializeApp, getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, getFirestore, collection, addDoc, serverTimestamp } = window.firebaseModules;

// Placeholder Config - REPLACEME
// I will need to get the real config from the user or run `firebase apps:sdkconfig`
let app, auth, db;

async function initFirebase() {
    try {
        const response = await fetch('/__/firebase/init.json');
        const config = await response.json();
        app = initializeApp(config);
        auth = getAuth(app);
        db = getFirestore(app);

        console.log("Firebase Initialized");
        setupAuthListener();
    } catch (e) {
        console.error("Could not auto-load config (local serve?), getting fallback...", e);
        // Fallback or alert user
    }
}

function setupAuthListener() {
    onAuthStateChanged(auth, (user) => {
        const loginBtn = document.getElementById('login-btn');
        const userDisplay = document.getElementById('user-display');

        if (user) {
            console.log("User logged in:", user.displayName);
            if (loginBtn) loginBtn.style.display = 'none';
            if (userDisplay) {
                userDisplay.innerHTML = `<img src="${user.photoURL}" class="user-avatar" style="width:30px;border-radius:50%;vertical-align:middle;margin-right:5px;"> ${user.displayName}`;
                userDisplay.style.display = 'inline-block';
            }

            // Log visit
            logVisit(user);
        } else {
            console.log("User logged out");
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (userDisplay) userDisplay.style.display = 'none';
        }
    });
}

async function logVisit(user) {
    try {
        await addDoc(collection(db, "visitors"), {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            last_seen: serverTimestamp(),
            uid: user.uid
        });
        console.log("Visitor logged to Firestore");
    } catch (e) {
        console.error("Error logging visit:", e);
    }
}

window.loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed: " + error.message);
    }
};

window.logout = () => {
    signOut(auth);
};

// Start
initFirebase();
