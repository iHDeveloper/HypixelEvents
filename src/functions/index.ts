import * as functions from 'firebase-functions';
import { Response, Request } from 'firebase-functions';

export const test = functions.https.onRequest((request: Request, response: Response) => {
    functions.logger.debug("Test");
    response.send("test");
});
