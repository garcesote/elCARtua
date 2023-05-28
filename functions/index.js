/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.sendNotificationToTopic = functions.https.onRequest(async (request, response) => {
    const { title, body, topic } = request.body;
  
    const message = {
      notification: {
        title: title,
        body: body,
      },
      topic: topic,
    };
  
    try {
      const result = await admin.messaging().send(message);
      console.log('Mensaje enviado exitosamente:', result);
      response.send('Notificación enviada al tema.');
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      response.status(500).send('Error al enviar la notificación.');
    }
  });