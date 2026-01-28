// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    // hostname: 'http://kojgarment.s3-website-ap-southeast-1.amazonaws.com/',
    // hostname: 'http://171.100.153.76:4200/',
    // hostname: 'http://192.168.1.36:4200/',
    // hostname: 'http://128.199.142.35/',  // ## ocean
    hostname: 'http://localhost:4200/',

    aesP: '25H19e21n89gL8o9v6eP25e31i87x19inmmM',

    // // ## aws s3
    // apiUrl: "http://ec2-3-1-211-143.ap-southeast-1.compute.amazonaws.com:3968/api",
    // SOCKET_ENDPOINT: 'ec2-3-1-211-143.ap-southeast-1.compute.amazonaws.com:3968',

    // // ## oceandigital
    // apiUrl: "http://206.189.86.114:3968/api",
    // SOCKET_ENDPOINT: 'http://206.189.86.114:3968',

    apiUrl: "http://192.168.1.36:3968/api",
    SOCKET_ENDPOINT: 'http://192.168.1.36:3968',

    // apiUrl: "http://192.168.1.66:3968/api",
    // SOCKET_ENDPOINT: 'http://192.168.1.66:3968',


    getIP: 'http://api.ipify.org/?format=json',
    getIP2: 'http://jsonip.com',

    imageRoute: '/user/update/upload/images',// ## /api/user/update/upload/images postUpdateUploadImages
    imageGCSRoute: '/user/update/upload/images/gcs',// ## /api/user/update/upload/images postUpdateUploadImages

    // ## img , log nodejs
    apiImgLogUrl: "http://192.168.151.42:3868/api",

    imageLogRoute: '/user/update/upload/images',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
