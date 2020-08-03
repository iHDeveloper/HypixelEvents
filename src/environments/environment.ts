// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  version: '0.1.2-BETA',
  firebase: {
    apiKey: "AIzaSyC7Dhf1uOqqN2kWYqjw8A5-FlTwh9fXnXw",
    authDomain: "ihdeveloper.firebaseapp.com",
    databaseURL: "https://ihdeveloper.firebaseio.com",
    projectId: "ihdeveloper",
    storageBucket: "ihdeveloper.appspot.com",
    messagingSenderId: "791354586060",
    appId: "1:791354586060:web:412a16174ab392a4486369",
    measurementId: "G-HHYM4MMTS3",
    emulator: {
      host: 'localhost:8080',
      ssl: false
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
