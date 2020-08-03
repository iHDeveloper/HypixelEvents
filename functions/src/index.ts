import * as FirebaseFunctions from 'firebase-functions';
import { Response, Request } from 'firebase-functions';
import { HypixelAPI } from './api';
import { firestore, initializeApp, credential } from 'firebase-admin';
import { info } from 'console';

let initialized = false;

function init() {
    if (initialized)
        return;
    initialized = true;
    
    info("Initializing the application...");
    initializeApp({
        credential: credential.cert(require('../service-account.json')),
        databaseURL: 'https://ihdeveloper.firebaseio.com'
    });
}

export const updateCalendar = FirebaseFunctions.https.onRequest(async (_: Request, response: Response) => {
    init();

    const data = await HypixelAPI.calendar();
    info("Updating...");
    await firestore().collection('skyblock').doc('calendar').set(data);
    response.status(200).send();
});
