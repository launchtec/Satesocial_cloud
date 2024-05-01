const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotificationOnNewMessage = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    // Get the notification data
    const notificationData = snapshot.data();
    
    // Get the recipient user ID (User B)
    const recipientUserId = notificationData.recipientUserId;
    
    // Fetch the recipient user's device token from Firestore
    const userDoc = await admin.firestore().collection('users').doc(recipientUserId).get();
    const recipientToken = userDoc.data().fcmToken;
    
    // Define the notification message
    const message = {
      notification: {
        title: notificationData.title,
        body: notificationData.message,
      },
      token: recipientToken,
    };
    
    // Send the push notification
    try {
      const response = await admin.messaging().send(message);
      console.log('Notification sent:', response);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    
    return null;
  });