import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { Customer } from 'src/app/models/order.model';
import { CustomerService } from 'src/app/services/customer.service';
import { UserService } from 'src/app/services/user.service';

import { UploadImageComponent } from 'src/app/shared/components/general/upload-image/upload-image.component';
import { GBC } from 'src/app/global/const-global';

@Component({
  selector: 'app-uc-customer-edit',
  templateUrl: './uc-customer-edit.component.html',
  styleUrls: ['./uc-customer-edit.component.scss'],
  providers: [DialogService, MessageService],
})
export class UcCustomerEditComponent implements OnInit, OnDestroy {
    formActive = 'customerEdit';
    formName = 'customerEditImageProfile';
    data: any;
    modeView = false; // ## for view only cannot edit , cannot update
    customerImageProfileGCSPath = GBC.customerImageProfileGCSPath;  // ## google storage path

    isAuthenticated = false; // ## logged in ?
    screenSize = 'sm';

    customer: Customer = GBC.clrCustomer();

    mode = 'card'; // ## profile, password, card
    modeCus = '';


    private dataAroundAppSub: Subscription = new Subscription();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        public dialogService: DialogService,
        public messageService: MessageService,
        private userService: UserService,
        private custService: CustomerService,
    ) {}

    ngOnInit(): void {
        this.screenSize = this.userService.screenSize;
        // console.log(this.config.data);
        this.data = this.config.data;
        this.modeView = this.data.modeView;
        // console.log(this.data);
        this.modeCus = this.data.id;
        this.customer = this.custService.getCustomer();
        if (this.modeView) {
            this.customer = this.data.customer;
        }


        // ## get DataAroundApp
        // ## user auth  isAuthenticated / dataAroundApp
        this.isAuthenticated = this.userService.getIsAuth();
        this.dataAroundAppSub = this.userService
            .getDataAroundAppStatusListener()
            .subscribe((dataAroundApp) => {
                // ## declare initial variable from service user
                this.isAuthenticated = dataAroundApp.isAuthenticated;
                this.customer = dataAroundApp.customer;

                // console.log('screenSizeInfo : ' , this.screenSize);
                // console.log('isAuthenticated : ' , this.isAuthenticated);
                if (this.isAuthenticated) {
                    // ## user logged in already
                } else {
                    // ## user no login
                }
            });
    }

    showFileUploadModal(multiple: boolean) {
        const ref = this.dialogService.open(UploadImageComponent, {
            data: {
                id: 'fileUpload',
                companyID: this.userService.getCompany()?.companyID,
                multiple: multiple, // ## allow upload multiple file
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                customerID: this.customer.customerID,
                subfolder: 'imageProfile/',  // ## in google storage store in subfolder
            },
            header: 'image upload',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    closeDialog() {
        this.ref.close('button close dialog from user edit');
    }

    changeMode(mode: string) {
        this.mode = mode;
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.customerImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    ngOnDestroy(): void {
        if (this.dataAroundAppSub) { this.dataAroundAppSub.unsubscribe(); }
        // if (this.sockio) { this.sockio.unsubscribe(); }
        // if (this.errSub) { this.errSub.unsubscribe(); }
        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
