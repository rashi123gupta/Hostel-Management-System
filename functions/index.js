const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * A callable Cloud Function to create a new user.
 * This version MANUALLY verifies the auth token.
 */
exports.createNewUser = functions.https.onCall(async (data, context) => {
  
  // 1. Check if the manually passed token exists
  if (!data.idToken) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "No authentication token was provided."
    );
  }

  let decodedToken;
  try {
    // 2. Manually verify the token using the Admin SDK
    decodedToken = await admin.auth().verifyIdToken(data.idToken);
  } catch (error) {
    console.error("Failed to verify ID token:", error);
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The provided authentication token is invalid."
    );
  }
  
  // 3. Get the UID of the *caller* from the verified token
  const callerUid = decodedToken.uid;

  // 4. Manually check the caller's role from Firestore
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  // 5. Perform our security check (This is your REAL security)
  if (!callerDoc.exists || callerDoc.data().role !== 'superuser') {
     throw new functions.https.HttpsError(
      "permission-denied",
      "Permission denied. You must be a superuser to perform this action."
    );
  }
  
  // 6. At this point, the caller is an authenticated superuser.
  // We can now safely proceed with creating the new user.
  const { email, password, name, roleToCreate, hostelNo, roomNo, rollNo } = data.userData;

  let newUserRecord;
  try {
    // 7. Create the new user in Firebase Authentication
    newUserRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });
    
    // 8. Create the user's profile in Firestore
    const userProfileData = {
      name: name,
      email: email,
      role: roleToCreate,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Add student-specific fields only if the role is 'student'
    if (roleToCreate === 'student') {
      userProfileData.rollNo = rollNo;
      userProfileData.hostelNo = hostelNo;
      userProfileData.roomNo = roomNo;
    }

    await admin.firestore().collection("users").doc(newUserRecord.uid).set(userProfileData);

    return { success: true, uid: newUserRecord.uid, message: "User created successfully." };
    
  } catch (error) {
    // If user creation fails, delete the half-created auth user
    if (newUserRecord) {
      await admin.auth().deleteUser(newUserRecord.uid);
    }
    console.error("Error in createNewUser function:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});