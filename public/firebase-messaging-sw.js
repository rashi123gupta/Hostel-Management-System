/* public/firebase-messaging-sw.js */
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyA4xxnv2F1z--V5gVuML_hbijDaTYv0y5k",
  authDomain: "hostel-management-system-fde00.firebaseapp.com",
  projectId: "hostel-management-system-fde00",
  messagingSenderId: "990603426370",
  appId: "1:990603426370:web:99dfcc021a4d9548a00bdb",
});

// Messaging instance
const messaging = firebase.messaging();

// ✅ Background notifications (when app closed)
messaging.onBackgroundMessage((payload) => {
  // ✅ Only show notifications if page is NOT visible
  if (self.clients) {
    self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
      const isVisible = clients.some(c => c.visibilityState === "visible");
      if (isVisible) return; // ✅ don't show duplicate
      const n = payload.notification || {};
      self.registration.showNotification(n.title || "Update", {
        body: n.body || "",
        icon: "/logo192.png"
      });
    });
  }
});


self.addEventListener("push", (event) => {
  console.log("📩 Push event received", event);

  if (!event.data) return;

  const data = event.data.json();
  const n = data.notification || {};

  self.registration.showNotification(n.title || "Update", {
    body: n.body || "",
    icon: "/logo192.png",
  });
});
