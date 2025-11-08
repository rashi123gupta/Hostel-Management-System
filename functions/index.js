const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

/**
 * A standard HTTP Cloud Function to create a new user.
 * NOW with logic for both Superusers and Wardens.
 */
exports.createNewUser = functions.https.onRequest((req, res) => {
  // 1. Handle CORS
  cors(req, res, async () => {
    
    // 2. Verify the user's ID token
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      console.error("No authorization token found.");
      res.status(403).send("Unauthorized");
      return;
    }

    const idToken = req.headers.authorization.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error("Failed to verify ID token:", error);
      res.status(403).send("Unauthorized");
      return;
    }

    // 3. Get the CALLER'S role from Firestore
    const callerUid = decodedToken.uid;
    const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();

    if (!callerDoc.exists) {
      res.status(403).send("Permission denied. Caller profile not found.");
      return;
    }
    
    const callerRole = callerDoc.data().role;
    
    // 4. Get the TARGET role from the request data
    const { email, password, name, roleToCreate, hostelNo, roomNo, rollNo } = req.body.data;

    // 5. *** NEW PERMISSION LOGIC ***
    let isAllowed = false;

    // Case 1: A superuser is trying to create a warden
    if (callerRole === 'superuser' && roleToCreate === 'warden') {
      isAllowed = true;
    }

    // Case 2: A warden is trying to create a student
    if (callerRole === 'warden' && roleToCreate === 'student') {
      isAllowed = true;
    }
    
    // 6. Check the final decision
    if (!isAllowed) {
      res.status(403).send(`Permission denied. A ${callerRole} cannot create a ${roleToCreate}.`);
      return;
    }

    // 7. Logic is successful, proceed to create the user.
    let newUserRecord;
    try {
      newUserRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
      });
      
      const userProfileData = {
        name: name,
        email: email,
        role: roleToCreate,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "active" // Default status for all new users is 'active'
      };
      
      if (roleToCreate === 'student') {
        userProfileData.rollNo = rollNo;
        userProfileData.hostelNo = hostelNo;
        userProfileData.roomNo = roomNo;
      }

      await admin.firestore().collection("users").doc(newUserRecord.uid).set(userProfileData);

      // 8. Send a 200 OK response
      res.status(200).send({ data: { success: true, uid: newUserRecord.uid } });

    } catch (error) {
      if (newUserRecord) {
        await admin.auth().deleteUser(newUserRecord.uid);
      }
      console.error("Error in createNewUser function:", error);
      res.status(500).send({ error: error.message });
    }
  });
});