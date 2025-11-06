// Import the Firebase SDK (use the CDN imports in the Service Worker)
importScripts(
  "https://www.gstatic.com/firebasejs/9.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.1.0/firebase-messaging-compat.js"
);

// Replace with your actual Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyCpnuKm2c3d2HwLuFct_a9i3tii_WSlLjw",
  projectId: "inboxguard-2b71a",
  messagingSenderId: "349315151933",
  appId: "1:349315151933:web:b55c84b7f1de82007f1254",
};

// Initialize the Firebase app
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Listen for background messages
// When your site is NOT active, FCM intercepts the message here.
// Since your backend sends a 'notification' payload, the SDK automatically
// displays the browser's native notification pop-up using your title/body.
messaging.onBackgroundMessage((payload) => {
  // The payload.data will contain { emailId: '...' }
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png", // Path to your app's icon
    data: payload.data, // Include custom data for when the user clicks the notification
  };

  // Manually display the notification using the browser's native API
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Optional: Handle notification clicks when the app is closed
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const emailId = event.notification.data.emailId;

  // Open a new tab or focus the existing one to the email page
  const urlToOpen = new URL(`/email/${emailId}`, self.location.origin).href;
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        let client = clientList.find((c) => c.url === urlToOpen);
        if (client) {
          return client.focus();
        } else {
          return client.openWindow(urlToOpen);
        }
      })
  );
});
