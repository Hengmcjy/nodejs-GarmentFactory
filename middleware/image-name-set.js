
// ## set name image
const fs = require('fs');

module.exports = (req, res, next) => {

    // console.log('find name image');
    // console.log(req.imageData);

    // ## all mode use this
    req.imageData.imageName = req.imageData.userID + "-" + Date.now();

    // req.session.imageName = 'newname';

    
    next();
}



    // // #####################################################
    // // ## test delete file    ------   method 1
    // const pathDel = './images/user1/newName-1600968885013.jpg';
    // if (fs.existsSync(pathDel)) {
    //     fs.unlinkSync(pathDel);
    // }
    // // ## test delete file    ------   method 1
    // // #####################################################

    // // #####################################################
    // // ## test delete file   ------   method 2
    // try {
    //     fs.unlinkSync(pathDel);  // ## delete image
    // } catch(err) {
    //     // file not exist
    // }
    // // ## test delete file ------   method 2
    // // #####################################################