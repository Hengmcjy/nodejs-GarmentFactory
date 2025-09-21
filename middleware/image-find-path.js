
// ## find path for folder image
// ## change folder path here

const fs = require('fs');
const path = require("path");

// const dir = 'images/user2';  // ## change folder path here
module.exports = (req, res, next) => {
    // console.log('findpath');
    // console.log(req.imageData);
    // console.log(req.session);
    
    const imageTempPath = 'public/temp';
    let mbMainPath = '';
    if (req.imageData.mode == 'updateImageUserProfile') {
        mbMainPath = 'public/image/user';
    } 
    // else if (req.imageData.mode=='updateImageMB') {  //  public/images/mb/motorbike/[_id]
    //     mbMainPath = 'public/images/mb/motorbike/'+req.imageData.name;
    // } else if (req.imageData.mode=='updateImageMBSold') {  //  public/images/mb/motorbike/sold/[_id]
    //     mbMainPath = 'public/images/mb/motorbike/sold/'+req.imageData.name;
    // // } else if (req.imageData.mode=='updateImageMBSold') { // public/images/mb/sparepart/use
    // //     mbMainPath = 'public/images/mb/motorbike/'+req.imageData.__idx;
    // } 

    // updateImageMBSparepartUse
        

    if (!fs.existsSync('./'+mbMainPath+'/')){
        // console.log(req.imageData);
        fs.mkdirSync(mbMainPath, { recursive: true });  // if not exist , then create new folder for
        // fs.mkdirSync(path.join(__dirname, mbMainPath));
        // fs.mkdirSync(path.join(__dirname, './'+mbMainPath), true);
        // fs.mkdirSync(path.join(__dirname,'../public'), true);
    }else
    {
        // console.log("Directory already exist");
    }
    req.imageData.pathImage = mbMainPath;

    // ## creat temp path
    req.imageData.tempPath = imageTempPath;

    // req.session.tempPath = 'images/user2';

    // console.log(req.imageData);
    next();
}