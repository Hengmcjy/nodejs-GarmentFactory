import { Factory } from 'src/app/models/app.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
// import { Subscription } from 'rxjs';

import { UserService } from 'src/app/services/user.service';
import { ProductService } from 'src/app/services/product.service';
import { CustomerService } from 'src/app/services/customer.service';
// import { FileUpload } from 'primeng/fileupload';

const URLUploadFile = environment.apiUrl+ environment.imageRoute;
const URLUploadFileGCS = environment.apiUrl+ environment.imageGCSRoute;


@Component({
    selector: 'app-upload-image',
    templateUrl: './upload-image.component.html',
    styleUrls: ['./upload-image.component.scss'],
})
export class UploadImageComponent implements OnInit {
    // @ViewChild('fileUpload') fileUpload: FileUpload;
    // @ViewChild('fileInput') fileInput:ElementRef;

    uploading: boolean = false;

    multiple: boolean = true;
    maxFileSize = 0;  // ## limit 1 mb
    mydatajson = {
        companyID: '',
        factoryID: '',
        userID: '',
        touserID: '',  // ## set to userID ...
        customerID: '',
        callfrom: '',
        subfolder:'',
        product: {
            productID: ''
        }
    };

    uploadedFiles: any[] = [];

    public previewPath: any
    public previewPaths: any[] = [];
    public previewPathFileName: any[] = [];
    uploader: FileUploader = new FileUploader({
        url: URLUploadFileGCS,
        itemAlias: 'image',
        // headers: [
        //   { name: 'tkimg', value: this.usersService.getToken() },
        //   { name: 'path', value: imageUserPath },
        //   { name: 'name', value: this.usersService.userID },
        //   { name: 'mode', value: 'updateImageUserProfile' },
        // ],
      });

    //   private picSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private messageService: MessageService,
        public sanitizer:DomSanitizer,

        public productService: ProductService,
        private custService: CustomerService,
        public userService: UserService,
    ) {}

    async ngOnInit() {
        // console.log(this.config.data)
        this.maxFileSize = this.userService.maxFileSize;  // ## limit 1 mb

        // ## setting mode before send data to nodejs
        await this.manageMode();


        this.uploader.clearQueue();
        this.uploader.onAfterAddingFile = (file) => {
            if (!this.multiple && this.previewPaths.length>=1) { // ## not multiple files then clear queue everytime
                // console.log('!this.multiple && this.previewPaths.length>=1');
                // await this.clearImages();
                this.previewPaths = [];
                this.previewPathFileName = [];
            }
            if (!this.previewPathFileName.includes(file._file.name)  // ## check duplicate file name
                && file._file.size <= this.maxFileSize) { // limit file size
                // console.log(file._file.name);
                // console.log(file._file);
                file.withCredentials = false;
                this.previewPath = this.sanitizer.bypassSecurityTrustUrl(
                    window.URL.createObjectURL(file._file)
                );
                this.previewPaths.push(this.previewPath); // ## preview image
                this.previewPathFileName.push(file._file.name) // ##  image name
            }
        };
        this.uploader.onCompleteItem = (item: any, status: any) => {
            // console.log('Uploaded File Details:', item);
        };
        this.uploader.onCompleteAll = () => {
            // ## after upload
            this.clearImages();
            this.uploading = false;

            if (this.mydatajson.callfrom === 'productEditImageProfile') {
                // ## get product
                // console.log(this.mydatajson,  this.mydatajson.product.productID);
                this.productService.getProduct1(this.mydatajson.companyID, this.mydatajson.product.productID );
                this.ref.close('close dialog'); // ## close dialog
            } else if (this.mydatajson.callfrom === 'userEditImageProfile') {
                // ## get user after edit image user profile
                this.userService.getuserInfo(this.userService.getUserID(), '');
                this.ref.close('close dialog'); // ## close dialog
            } else if (this.mydatajson.callfrom === 'staffEditImageProfile') {
                this.ref.close('close dialog'); // ## close dialog
            } else if (this.mydatajson.callfrom === 'companyEditImageProfile') {
                this.userService.getCompany1(this.userService.getCompany().companyID);
                this.ref.close('close dialog'); // ## close dialog
            } else if (this.mydatajson.callfrom === 'factoryEditImageProfile') {
                this.userService.getFactory1(
                    this.userService.getCompany().companyID,
                    this.userService.getFactory().factoryID
                );
                this.ref.close('close dialog'); // ## close dialog
            } else if (this.mydatajson.callfrom === 'customerEditImageProfile') {
                this.custService.getCustomer1(
                    this.userService.getCompany().companyID,
                    this.mydatajson.customerID
                );
                this.ref.close('close dialog'); // ## close dialog
            }



        };
    }

    async manageMode() {
        // ## callfrom =  'productEditImageProfile' , 'productEditImagecatalog'

        // ## get config data from dialog
        this.multiple = this.config.data?.multiple;
        this.mydatajson.companyID = this.config.data?.companyID;
        this.mydatajson.callfrom = this.config.data?.callfrom;
        this.mydatajson.subfolder = this.config.data?.subfolder;
        this.mydatajson.userID = this.userService.getUserID();

        if (this.mydatajson.callfrom === 'productEditImageProfile') {
            this.mydatajson.product.productID = this.config.data?.productID;
        } else if (this.mydatajson.callfrom === 'userEditImageProfile') {
            // this.mydatajson.userID = this.userService.getUserID();
            this.mydatajson.touserID = this.config.data?.touserID;
        } else if (this.mydatajson.callfrom === 'staffEditImageProfile') {
            this.mydatajson.touserID = this.config.data?.touserID;
        } else if (this.mydatajson.callfrom === 'companyEditImageProfile') {

        } else if (this.mydatajson.callfrom === 'factoryEditImageProfile') {
            this.mydatajson.factoryID = this.config.data?.factoryID;
        } else if (this.mydatajson.callfrom === 'customerEditImageProfile') {
            this.mydatajson.customerID = this.config.data?.customerID;
        }

        // staffEditImageProfile
    }

    public async clearImages() {
        this.uploader.clearQueue();
        this.previewPaths = [];
        this.previewPathFileName = [];

    }

    deleteImageUser(index: number){
        this.previewPaths.splice(index, 1);
        this.previewPathFileName.splice(index, 1);
    }

    uploadImage() {
        // console.log(this.uploader);
        // const data = { a: 'w', b: 'q', c: ['v','a',0] };
        this.uploading = true;
        const mydatajson = JSON.stringify(this.mydatajson);
        const userID = this.userService?.getUserID();
        // console.log(userID);
        this.uploader.setOptions({
            headers: [
              { name: 'tkimg', value: this.userService.getToken() },
              { name: 'userIDEncrypt', value: this.userService.getUserIDEncrypt() },
              { name: 'uuid5Encrypt', value: this.userService.getUUID5IDEncrypt() },
              { name: 'path', value: URLUploadFileGCS },
              { name: 'userID', value: userID },
              { name: 'mode', value: this.mydatajson.callfrom },
              { name: 'mydatajson', value: mydatajson },
              { name: '__idx', value: ''},
            ]
          });
          this.uploader.uploadAll();
    }



    // uploadFile(event: any) {
    //     console.log(event);
    //     // for(let file of event.files) {
    //     //     this.uploadedFiles.push(file);
    //     // }

    //     // this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
    // }

    // onRemove(event: any) {
    //     console.log(event.files);
    //     //event.files == files to upload
    // }

    // save() {
    //     console.log(this.uploader);
    //     console.log(this.previewPaths);
    //     // this.fileUpload.upload();
    // }
}
