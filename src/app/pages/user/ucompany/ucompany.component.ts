import { Factory } from './../../../models/app.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
// import { TranslateService } from '@ngx-translate/core';
import { NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';

import { ExportAsService, ExportAsConfig, SupportedExtensions } from 'ngx-export-as';

import { CompanyNewComponent } from 'src/app/shared/components/user/company-new/company-new.component';
import { CompanyJoinComponent } from 'src/app/shared/components/user/company-join/company-join.component';
// import { UploadImageComponent } from 'src/app/shared/components/general/upload-image/upload-image.component';

import { Company } from 'src/app/models/app.model';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-ucompany',
    templateUrl: './ucompany.component.html',
    styleUrls: ['./ucompany.component.scss'],
    providers: [DialogService, MessageService],
})
export class UcompanyComponent implements OnInit, OnDestroy {
    formActive = 'ucompany';
    companyFactoryImageProfileGCSPath = GBC.companyFactoryImageProfileGCSPath;  // ## google storage path company image profile
    page = 1;
    limit = 10;
    errID: string = '';
    lang: string = '';

    errIDJoinMember = '';
    errIDJoinMemberText = '';

    user: User = GBC.clrUser();
    companies: Company[] = [];
    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();


    display: boolean = false;
    isAdmin: boolean = false;


    rows = Array(20).fill(0).map((x, i) => i);

    config: ExportAsConfig = {
        type: 'pdf',
        elementIdOrContent: 'mytable',
        options: {
        jsPDF: {
            orientation: 'landscape'
        },
        pdfCallbackFn: this.pdfCallbackFn // to add header and footer
        }
    };

    private langSub: Subscription = new Subscription();
    private errSub: Subscription = new Subscription();

    private getUserCompanySub: Subscription = new Subscription();
    private userJoinedCompanySub: Subscription = new Subscription();



    constructor(
        // public translate: TranslateService,
        public dialogService: DialogService,
        public messageService: MessageService,
        private router: Router,
        private location: Location,

        public userService: UserService,
        private orderService: OrderService,

        private exportAsService: ExportAsService
    ) // private route: ActivatedRoute
    {}


    refreshPage() {
        window.location.reload();
        // location.reload();
    }

    exportAsString(type: SupportedExtensions, opt?: string) {
        this.config.elementIdOrContent = '<div> test string </div>';
        this.exportAs(type, opt);
        setTimeout(() => {
            this.config.elementIdOrContent = 'mytable';
        }, 1000);
    }

    exportAs(type: SupportedExtensions, opt?: string) {
        this.config.type = type;
        if (opt) {
            this.config.options.jsPDF.orientation = opt;
        }
        this.exportAsService.save(this.config, 'myFile').subscribe(() => {
            // save started
        });
        // this.exportAsService.get(this.config).subscribe(content => {
        //   const link = document.createElement('a');
        //   const fileName = 'export.pdf';

        //   link.href = content;
        //   link.download = fileName;
        //   link.click();
        //   console.log(content);
        // });
    }

    pdfCallbackFn(pdf: any) {
        // example to add page number as footer to every page of pdf
        const noOfPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= noOfPages; i++) {
            pdf.setPage(i);
            pdf.text('' + i + ' / ' + noOfPages, pdf.internal.pageSize.getWidth() - 20, pdf.internal.pageSize.getHeight() - 5);
        }
    }



    async ngOnInit() {
        this.isAdmin = this.userService.isAdmin();
        // console.log(this.isAdmin);
        // const  qrcode = {a: "123", b: "123"};
        // const jsonQR = JSON.stringify(qrcode);
        // const body1 = [
        //     [
        //         { qr: jsonQR, fit: '25' },
        //         { text: 'XL', style: 'list3' },
        //     ],
        //     [
        //         { text: 'This list1', style: 'list1' },
        //         { text: 'This list2', style: 'list2' },
        //         { text: '##########', style: 'list3' },
        //     ],
        //     '',
        //     { qr: jsonQR, fit: '25' },
        //     [
        //         { text: 'This list1', style: 'list1' },
        //         { text: 'This list2', style: 'list2' },
        //         { text: '##########', style: 'list3' },
        //     ],
        //     '',
        //     { text: '', border: [true, false, true, false] },  // ## center blank zone
        //     { text: '', border: [true, false, true, false] }, // ## center blank zone

        // ];
        // console.log(body1);


        this.location.replaceState('/'); // ## hide loocation
        this.userService.setFormActive(this.formActive);
        this.user = this.userService.getUser();
        this.companies = [];

        // ## get current lang and set app language
        this.langSub = this.userService.getLang.subscribe((langu) => {
            if (langu) {
                this.setLang(langu);
                this.lang = langu;
            }
        });
        const langg = await this.userService.getLangCurrent();
        if (langg !== '' || langg != null) {
            this.setLang(langg);
            this.lang = langg;
        } else {
            this.setLang('en');
            this.lang = 'en';
        }

        this.errIDJoinMember = '';
        this.errIDJoinMemberText = '';

        // ## observ err
        this.errID = '';
        this.errSub = this.userService
            .getErrorStatusListener()
            .subscribe((errObj) => {
                this.errID = errObj.messageID;
            });

        // ## get user company
        this.getUserCompany();
        this.userService.getUserCompany(
            '',
            this.userService.getUserID(),
            this.page,
            this.limit
        );
        this.company = GBC.clrCompany();
        this.userService.setCompany(this.company);
        this.userService.setFactory(this.factory);
    }

    selectCompany(company: Company) {
        // this.refreshPage();
        this.userService.factoryMode = 'select';  // ## 'select'=normal step , 'selectForOrderQueue'=for order queue ,
        this.company = company;
        this.userService.setCompany(company);
        // this.orderService.getOrders(company.companyID, 1, 100);
        // getOrders(companyID: string, page: number, limit: number)
        this.goto('/user/ufactory');
    }

    selectCompanySetting(company: Company) {
        this.company = company;
        this.userService.setCompany(this.company);
        const params: NavigationExtras = {
            queryParams: { companyID: company.companyID },
        };
        // console.log(company);
        this.router.navigate(['/user/ucompany/setting'], params);
    }

    getUserCompany() {
        if (this.getUserCompanySub) { this.getUserCompanySub.unsubscribe(); }
        this.getUserCompanySub = this.userService
            .getUserCompanyUpdatedListener().subscribe((data) => {
                this.companies = data.company;
                // console.log(this.companies);
                this.user = this.userService.getUser();
            });
    }

    putUserJoinCompany(companyIDSelected: string) {
        this.errIDJoinMember = '';
        this.errIDJoinMemberText = '';
        // putUserJoinCompany(companyID: string, page: number, limit: number)
        this.userService.putUserJoinCompany(companyIDSelected, this.page, this.limit);
        if (this.userJoinedCompanySub) { this.userJoinedCompanySub.unsubscribe(); }
        this.userJoinedCompanySub = this.userService
            .getJoinedMemberUpdatedListener().subscribe((data) => {
                this.user = this.userService.getUser();
                // console.log(this.user);
                if (data.success) {
                    this.messageService.add({
                        severity:'success',
                        summary:'Joined member company',
                        detail:'completed',
                        sticky: true
                    });
                } else {
                    this.errIDJoinMember = data.message.messageID;
                    if (data.message.messageID === 'erru007') {
                        // console.log(data.message.messageID);
                        this.errIDJoinMemberText = data.message.value;
                        this.messageService.add({
                            severity:'error',
                            summary:'Error [ ' +data.message.messageID+ ' ]',
                            detail: data.message.value,
                            sticky: true
                        });
                    }
                }
            });
    }

    getUserCompanyState(companyID: string) {
        const state = this.userService.getUserCompanyState(this.user.uCompany, companyID);
        return state;
    }

    showJoinCompanyModal() {
        const ref = this.dialogService.open(CompanyJoinComponent, {
            data: {
                id: '8888',
            },
            header: 'Join Company',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    showCreateCompanyModal() {
        const ref = this.dialogService.open(CompanyNewComponent, {
            data: {
                id: '51gF3',
            },
            header: 'Company Information',
            width: '50%',
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            // if (car) {
            //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
            // }
        });
    }

    showDialog() {
        this.display = true;
    }

    // showFileUploadModal() {
    //     const ref = this.dialogService.open(UploadImageComponent, {
    //         data: {
    //             id: 'fileUpload',
    //             multiple: true, // ## allow upload multiple file
    //         },
    //         header: 'image upload',
    //         width: '50%',
    //     });

    //     ref.onClose.subscribe((data: any) => {
    //         console.log(data);
    //         // if (car) {
    //         //     this.messageService.add({severity:'info', summary: 'Car Selected', detail:'Vin:' + car.vin});
    //         // }
    //     });
    // }

    setLang(lang: string) {
        // console.log('SetLang = ' ,lang);
        // this.translate.use(lang);
    }

    goto(path: string) {
        const params: NavigationExtras = {
            queryParams: { companyID: this.company.companyID },
        };
        this.router.navigate([path], params);
    }

    genImagePath(imgPath: string) {
        if (imgPath) {
            if (imgPath.length > 0) {
                return this.companyFactoryImageProfileGCSPath + imgPath;
            }
        }

        return GBC.nulltGCSPath;
    }

    translateCode(lType: string, lID: string) {
        const languageDataText = this.userService.translateCode(lType, lID);
        return languageDataText;
    }

    ngOnDestroy(): void {
        if (this.langSub) { this.langSub.unsubscribe(); }
        if (this.errSub) { this.errSub.unsubscribe(); }
        if (this.getUserCompanySub) { this.getUserCompanySub.unsubscribe(); }
        if (this.userJoinedCompanySub) { this.userJoinedCompanySub.unsubscribe(); }
        // if (this.filenameListsSub) { this.filenameListsSub.unsubscribe(); }

        // if (this.errSub) { this.errSub.unsubscribe(); }


    }
}
