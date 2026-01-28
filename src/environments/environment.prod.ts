export const environment = {
    production: true,

    hostname: 'http://kojgarment.s3-website-ap-southeast-1.amazonaws.com/',
    aesP: '25H19e21n89gL8o9v6eP25e31i87x19inmmM',

    // // 128.199.142.35 oceandigital
    // hostname: 'http://128.199.142.35/',
    // aesP: '25H19e21n89gL8o9v6eP25e31i87x19inmmM',

    //   apiUrl: "http://192.168.1.102:3968/api",
    //   SOCKET_ENDPOINT: 'http://192.168.1.102:3968',

    // ## oceandigital
    apiUrl: "http://206.189.86.114:3968/api",
    SOCKET_ENDPOINT: 'http://206.189.86.114:3968',

    // // ## aws ec2
    // apiUrl: "http://ec2-3-1-211-143.ap-southeast-1.compute.amazonaws.com:3968/api",
    // SOCKET_ENDPOINT: 'ec2-3-1-211-143.ap-southeast-1.compute.amazonaws.com:3968',


    getIP: 'http://api.ipify.org/?format=json',
    getIP2: 'http://jsonip.com',



    imageRoute: '/user/update/upload/images',// ## /api/user/update/upload/images postUpdateUploadImages
    imageGCSRoute: '/user/update/upload/images/gcs',// ## /api/user/update/upload/images postUpdateUploadImages

    // ## img , log nodejs
    apiImgLogUrl: "http://192.168.151.42:3868/api",
    imageLogRoute: '/user/update/upload/images',
};
