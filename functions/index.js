// functions/index.js

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
const corsHandler = cors({ origin: true });
const region = "asia-south1";
admin.initializeApp();

// Notification Cloud Messaging
async function sendToTokens(tokens, notification) {
  if (!tokens || tokens.length === 0) return;

  await admin.messaging().sendEachForMulticast({
  tokens,
  notification: {
    title: "Leave Status Updated",
    body: `Your leave has been ${after.status}.`,
  },
  webpush: {
    notification: {
      title: "Leave Status Updated",
      body: `Your leave has been ${after.status}.`,
      icon: "/logo192.png",
    }
  }
});
}
  exports.onLeaveUpdate = onDocumentUpdated(
  {
    region: "asia-south1",
    document: "leaves/{leaveId}",
  },
  async (event) => {
    console.log("🔥 Leave Trigger Fired");
    const before = event.data.before.data();
    const after = event.data.after.data();

    console.log("Before:", before);
    console.log("After:", after);

    if (before.status === after.status) {
      console.log("❌ Status unchanged. No notification.");
      return;
    }
    console.log("✅ Status changed!");

    const studentId = after.studentId;
    console.log("Student ID:", studentId);
    if (!studentId) return;

    const userSnap = await admin.firestore()
      .collection("users")
      .doc(studentId)
      .get();

    if (!userSnap.exists) {
      console.log("❌ Student not found");
      return;
    }

    const tokens = userSnap.data().deviceTokens || [];
    console.log("Tokens:", tokens);

    if (tokens.length === 0) {
      console.log("❌ No device tokens found");
      return;
    }

    await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title: "Leave Updated",
      body: "Your leave has been updated by the warden.",
    },
    webpush: {
      notification: {
        title: "Leave Updated",
        body: "Your leave has been updated by the warden.",
        icon: "/logo192.png",
      }
    }    
  });
  console.log("✅ Notification sent successfully!");
  }
  );
  exports.onComplaintUpdate = onDocumentUpdated(
  {
    region: "asia-south1",
    document: "complaints/{complaintId}",
  },
  async (event) => {
    console.log("🔥 Complaint Trigger Fired");

    const before = event.data.before.data();
    const after = event.data.after.data();

    // ✅ Trigger only when status changes
    if (before.status === after.status) {
      console.log("❌ Status unchanged. No notification.");
      return;
    }

    console.log("✅ Complaint status changed!");
    console.log("Before:", before);
    console.log("After:", after);

    const studentId = after.studentId;
    console.log("StudentID:", studentId);

    // ✅ Correct way to access Firestore in Cloud Functions
    const userSnap = await admin.firestore()
      .collection("users")
      .doc(studentId)
      .get();

    if (!userSnap.exists) {
      console.log("❌ Student profile not found");
      return;
    }

    const tokens = userSnap.data().deviceTokens || [];
    console.log("Tokens:", tokens);

    if (tokens.length === 0) {
      console.log("❌ No device tokens for student.");
      return;
    }

    const message = {
      tokens,
      notification: {
        title: "Complaint Updated",
        body: `Your complaint was updated to: ${after.status}`,
      },
      webpush: {
        notification: {
          title: "Complaint Updated",
          body: `Your complaint was updated to: ${after.status}`,
          icon: "/logo192.png"
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log("✅ Complaint Notification sent:", response);
  }
);




/**
 * A standard HTTP Cloud Function to create a new user and trigger a welcome email.
 */
exports.createNewUser = functions.https.onRequest((req, res) => {
  // This runs cors *first* and then runs our async function
  corsHandler(req, res, async () => {
    
    try {
      // 2. Check for the auth token
      if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        throw new functions.https.HttpsError("unauthenticated", "No authentication token was provided.");
      }
      const idToken = req.headers.authorization.split('Bearer ')[1];
      
      // 3. Verify the token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const callerUid = decodedToken.uid;
      const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
      
      if (!callerDoc.exists) {
        throw new functions.https.HttpsError("permission-denied", "Caller profile not found.");
      }
      const callerRole = callerDoc.data().role;

      // 4. Extract data (password is removed)
      const { email, name, roleToCreate, rollNo, hostelNo, roomNo } = req.body.data;

      // 5. Check permissions
      let isAllowed = false;
      if (callerRole === 'superuser' && roleToCreate === 'warden') { isAllowed = true; }
      if (callerRole === 'warden' && roleToCreate === 'student') { isAllowed = true; }
      
      if (!isAllowed) {
        throw new functions.https.HttpsError("permission-denied", `A ${callerRole} cannot create a ${roleToCreate}.`);
      }

      // 6. Create Auth user (no password)
      const userRecord = await admin.auth().createUser({
        email: email,
        emailVerified: false,
        displayName: name,
      });

      // 7. Create Firestore doc
      await admin.firestore().collection('users').doc(userRecord.uid).set({
        email: email,
        role: roleToCreate,
        name: name,
        rollNo: rollNo || null,
        hostelNo: hostelNo || null,
        roomNo: roomNo || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "active",
      });

      // 8. Generate link and trigger email
      const passwordResetLink = await admin.auth().generatePasswordResetLink(email);
      
      await admin.firestore().collection("mail").add({
        to: email,
        template: {
          name: "welcome", // The name of the template you will create
          data: {
            name: name,
            action_url: passwordResetLink,
            role: roleToCreate,
          },
        },
      });

      // 9. Send success response
      res.status(200).send({ data: { success: true, uid: userRecord.uid } });

    } catch (error) {
      console.error("Error in createNewUser:", error);
      const code = error.code || 'internal';
      if (error.code === 'auth/email-already-exists') {
        res.status(400).send({ error: { message: "This email address is already in use.", code: "auth/email-already-exists" } });
      } else {
        res.status(400).send({ error: { message: error.message, code: code } });
      }
    }
  }); 
});