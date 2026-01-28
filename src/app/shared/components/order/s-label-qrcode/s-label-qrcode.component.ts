import {
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    OnDestroy,
} from '@angular/core';
// import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { Order, OrderProduction } from 'src/app/models/order.model';
import { LabelQRCode, ProductORInfo } from './../../../../models/order.model';
import { SProductFilterComponent } from '../../general/s-product-filter/s-product-filter.component';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ColorS, Company, Factory, SizeS } from 'src/app/models/app.model';
import { CurrentCompanyOrder, CurrentOrderStyle, CurrentProductQtyAllC, OrderStyleColorSize } from 'src/app/models/report.model';
import { ReportService } from 'src/app/services/report.service';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-s-label-qrcode',
    templateUrl: './s-label-qrcode.component.html',
    styleUrls: ['./s-label-qrcode.component.scss'],
})
export class SLabelQrcodeComponent implements OnInit, OnDestroy {
    // @ViewChild('downloadLink') downloadLink: ElementRef;
    // @ViewChild('canvas') canvas: ElementRef;
    @ViewChild('downloadLink') downloadLink!: ElementRef;
    @ViewChild('canvas') canvas!: ElementRef;
    data: any;

    formActive = 'order-qrcode';
    formName = this.formActive;

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    order: Order = GBC.clrOrder();
    productORInfoSelected: ProductORInfo= GBC.clrProductORInfo();
    labelQRCodes: LabelQRCode[] = [];

    colorNameLen = 18;
    shoeLabelHead = true;
    labelCount = 12;
    labelStart = 1;
    maxLabelStart = 99999 - +this.labelCount + 1;
    labelEnd= +this.labelStart + +this.labelCount - 1;
    rangeValues: number[] = [];

    rowSelectedIdx = -1;

    tempFullProductORInfo: ProductORInfo[] = [];
    styleS: string[] = [];
    targetPlaceS: string[] = [];
    colorS: string[] = [];
    sizeS: string[] = [];

    currentProductQtyAllC: CurrentProductQtyAllC[] = [];
    orderStyleColorSize: OrderStyleColorSize[] = [];
    currentCompanyOrder: CurrentCompanyOrder[] = [];
    currentOrderStyle: CurrentOrderStyle[] = [];
    currentCompanyOrderStyleGroup: any[] = [];
    orderProductBundleNos: OrderProduction[] = [];
    sizes: SizeS[] = [];
    colors: ColorS[] = [];
    orderStyleColorSizeF: any;
    setName = '';

    private tokenTimer: any;
    private deleyTimer: any;
    deleyLoop = 3;
    timeOutArr: any[] = [];
    qtyPerBundle = 12;
    startNumber = 0;
    endNumber = 0;
    errBundle = '';
    txtNoRunning = '';
    qrcodeLostQty = 1;

    yarnLotID1 = '';
    yarnLotID2 = '';
    txtData:any = "fdsf,fsf,sf,sf,s,fs,fs,df \n";

    qrcodeTextArr: string[] = [];
    qrcodeLostTextArr: string[] = [];
    labelStart1 = 1;
    labelEnd1 = 1;
    fileName = 'myFile-12.txt';
    qrLostfileName = 'myQRLostFile-12.txt';

    private repCompanyOrderSub: Subscription = new Subscription();
    private orderProductBundleNosSub: Subscription = new Subscription();

    constructor(
        public dialogService: DialogService,
        public messageService: MessageService,

        public userService: UserService,
        public orderService: OrderService,
        private repService: ReportService,
        ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.order = this.orderService.getOrder();
        this.sizes = this.userService.sizes;
        this.colors = this.userService.colors;
        // this.data = this.config.data;
        // console.log(this.data);
        if (this.order.orderColor.length > 0) {
            this.setName = this.order.orderColor[0].setName;
        }

        this.order = this.orderService.getOrder();
        this.tempFullProductORInfo = [...this.order.productOR.productORInfo];
        // console.log(this.order);
        this.getRepCompanyOrder();
    }

    checkBundle() {
        const round = +this.labelEnd1  - +this.labelStart1 + 1;
        if ( round % this.labelCount ===0) {
            return true;
        }
        return false;
    }

    // checkBundleNo() {
    //     if (this.bundleNoArr.length > 0) {

    //     }
    //     else {
    //         return false;
    //     }
    // }

    // getCodeColorNameByColorCode(colorCode: string) {
    //     if (colorCode==='') {return ''}
    //     const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode));
    //     return this.colors[idx].color.colorCode;
    // }

    // getColorNameByColorCode(colorCode: string) {
    //     if (colorCode==='') {return ''}
    //     const idx = this.colors.findIndex( fi =>(fi.color.colorID === colorCode));
    //     return this.colors[idx].color.colorName;
    // }



    getBundleNoBeforeExportText() {
        const productBarcode = this.userService.genProductBarcode(this.order.productOR.productID, this.orderService.qZone, '-----',
            this.userService.getInfoFromorder(this.order, 'year'),
            this.userService.strReplaceAll(this.orderService.qColor,',',''),
            this.orderService.qSize,
            this.userService.getInfoFromorder(this.order, 'sex'));
        this.orderService.getOrderProductBundleNos(this.company.companyID, productBarcode, this.labelStart1, this.labelEnd1);
        if (this.orderProductBundleNosSub) { this.orderProductBundleNosSub.unsubscribe(); }
        this.orderProductBundleNosSub = this.orderService.getOrderProductBundleNosUpdatedListener().subscribe((data) => {
            // console.log(data.orderProductionBundleNos);
            this.orderProductBundleNos = data.orderProductionBundleNos;
            // console.log(this.orderProductBundleNos);
            this.exportText();
        });

    }

    exportLostQRCodeReplace() {
        // console.log(this.order.productOR.productID);
        // console.log(this.userService.returnYYYYMMDDHHMMSS());
        const yyyymmddhhmmss = this.userService.returnYYYYMMDDHHMMSS();
        const style = this.order.productOR.productID.trim();
        const qtyBundle = 12;
        this.qrcodeLostTextArr = [];
        let i = 1;
        while ( i <= this.qrcodeLostQty ) {
            let line = '';
            for (let j = 1; j <= qtyBundle; j++) {
                const no = this.userService.setAddStrLen(''+i, 5, '0');
                line = line + style + '#' + yyyymmddhhmmss + no + ',';
                i++;
            }
            line = line + style;
            line = line + ' \n';
            this.qrcodeLostTextArr.push(line);
            // console.log(this.qrcodeLostTextArr);
            if (i >= this.qrcodeLostQty) {
                this.saveAsTextFile(this.qrLostfileName, this.qrcodeLostTextArr);
            }
        }
    }

    exportText() {
        this.qrcodeTextArr = [];
        const style = this.order.productOR.productID;
        const zone = this.orderService.qZone;
        const color = this.orderService.qColor;
        const colorName = this.userService.getColorNameByColorCode(color, this.setName).substr(0, this.colorNameLen);   // str.substr(0, 18)
        const colorID = this.userService.getCodeColorNameByColorCode(color, this.setName);
        const size = this.orderService.qSize;
        const qQty = this.orderService.qQty;
        // this.yarnLotID = 'YARN-LOT-ID-12345';  // ## get yarn lot id here

        const productBarcode = this.userService.genProductBarcode(this.order.productOR.productID, this.orderService.qZone,
            '-----', this.userService.getInfoFromorder(this.order, 'year'),
            this.orderService.qColor, this.orderService.qSize,
            this.userService.getInfoFromorder(this.order, 'sex'));
        const barcodeCount = +this.labelEnd1  - +this.labelStart1 + 1;
        const bundleCount = +barcodeCount / this.labelCount;

        // const round = +barcodeCount / this.labelCount;
        // console.log(bundleCount);
        let labelStart1 = this.labelStart1;
        let i = 0;
        while ( i < bundleCount ) {
            // ## insert line here
            // style,zone,color,size,qrcode1,number1
            // setAddStrLen(str: string, len: number, strAdd: string)

            // style+','+zone+','+colorID+','+colorName+','+size+','+this.yarnLotID+',';

            let bundleNo = '';
            let line = '';
            line = line + style+','+zone+','+colorID+','+colorName+','+size+','+this.yarnLotID1+','+this.yarnLotID2+ ',';
            for (let j = 0; j < this.labelCount; j++) {
                let forLoss = +labelStart1 <= qQty ? '' : 'for LOSS';  // 'for LOSS'
                const qrcode = productBarcode + this.userService.setAddStrLen(''+labelStart1, 5, '0');
                // ## get bundle no
                const findBundleNo = this.orderProductBundleNos.filter(i=>(i.productBarcodeNo == qrcode));
                bundleNo = findBundleNo.length>0?findBundleNo[0].bundleNo+'':'';

                const numRunning = labelStart1;
                line = line + qrcode + ',' + numRunning + ',' + bundleNo + ','+ forLoss + ',';
                labelStart1++;
            }
            // line = line + style+','+zone+','+colorID+','+colorName+','+size+','+this.yarnLotID1+','+this.yarnLotID2+ ',';
            line = line + ' \n';

            this.qrcodeTextArr.push(line);
            i++;
            if (i === bundleCount) {
                this.saveAsTextFile(this.fileName, this.qrcodeTextArr);
            }
        }
    }

    saveAsTextFile(fileName: string, textArr: string[]){

        const data = new Blob(textArr, {type: 'text/plain'});

        let url = window.URL.createObjectURL(data);

        let a = document.createElement('a');
        document.body.appendChild(a);

        a.setAttribute('style', 'display: none');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }

    async getRepCompanyOrder() {
        // this.lastColor = '';
        // this.orders = [];
        // console.log('getRepCompanyOrder');

        const productStatus = ['normal', 'problem', 'repaired', 'lost', 'complete'];
        const ordertatus = ['open'];
        this.orderService.getCompanyOrderByStyle(this.company.companyID, this.order.productOR.productID, ordertatus, productStatus);
        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        this.repCompanyOrderSub = this.orderService.getRepCompanyOrderUpdatedListener().subscribe((data) => {
            // console.log(data);
            // this.orderStyleColorSize = this.repService.setColorSeq(this.sizes, data.orderStyleColorSize);
            this.orderStyleColorSize = data.orderStyleColorSize;
            this.currentCompanyOrder = data.currentCompanyOrder;
            this.currentOrderStyle = data.currentOrderStyle;
            // console.log(this.currentCompanyOrder);
            // console.log(this.orderStyleColorSize);

            this.currentProductQtyAllC = data.currentProductQtyAllC;

            this.currentOrderStyle.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
            });

            this.orderStyleColorSize.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            this.orderStyleColorSize = this.repService.setSizeSeq(this.sizes, this.orderStyleColorSize);
            this.orderStyleColorSize = this.repService.setColorSeq(this.colors, this.orderStyleColorSize);


            // ## multi sort 2 property
            this.orderStyleColorSize.sort((a,b)=>{
                return a.style >b.style?1:a.style <b.style?-1:0
                    || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                    || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            });

            // this.orderStyleColorSize.sort((a,b)=>{
            //     return a.productColor >b.productColor?1:a.productColor <b.productColor?-1:0
            //         || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
            // });

            // ## replace - to empty
            this.currentProductQtyAllC.forEach( (item, index) => {
                item.size = this.userService.strReplaceAll(item.size, '-', '');
                item.color = this.userService.strReplaceAll(item.color, '-', '');
                item.targetPlace = this.userService.strReplaceAll(item.targetPlace, '-', '');
            });
            // ## change color text to textComma
            this.currentProductQtyAllC.forEach( (item, index) => {
                item.color = this.userService.changeColorTextToColorTextComma(item.color);
                item.sizeSeq = this.userService.getSizeSeq(item.size);
            });
            // console.log(this.currentProductQtyAllC);


            // console.log(this.orderStyleColorSize);
            // console.log(this.currentOrderStyle, this.orderStyleColorSize, this.currentCompanyOrder);
            // console.log(this.currentCompanyOrder);

            // ## grouping style
            this.currentCompanyOrder.sort((a,b)=>{ return a.style >b.style?1:a.style <b.style?-1:0 });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrder.forEach( (item, index) => {
                item.productSize = this.userService.strReplaceAll(item.productSize, '-', '');
            });
            // console.log(this.currentCompanyOrder);

            this.currentCompanyOrderStyleGroup = this.userService.groupBy(this.currentCompanyOrder, (c: any) => c.style);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.currentCompanyOrderStyleGroup = Object.values(this.currentCompanyOrderStyleGroup);
            // console.log(this.currentCompanyOrderStyleGroup);

            this.orderStyleColorSizeF = this.orderStyleColorSizeFilter(0);

        });
    }

    orderStyleColorSizeFilter(idx: number) {
        let orderStyleColorSize = this.orderStyleColorSize.filter(i=>i.style == this.currentCompanyOrderStyleGroup[idx][0].style);
        // console.log(orderStyleColorSize);
        // if (this.orders.length > 0) {
        let colors: ColorS[] = this.order.orderColor;

        // console.log(colors, orderStyleColorSize);
        orderStyleColorSize = this.repService.setColorSeq(colors, orderStyleColorSize);
        orderStyleColorSize.sort((a,b)=>{
            return a.style >b.style?1:a.style <b.style?-1:0
                || a.colorSeq >b.colorSeq?1:a.colorSeq <b.colorSeq?-1:0
                || a.sizeSeq >b.sizeSeq?1:a.sizeSeq <b.sizeSeq?-1:0
        });
        // console.log(orderStyleColorSize);
        return orderStyleColorSize;
    }















    transformToCountryID(element: string) {
        return element.split("/")[1];
    }

    productORInfoFilter() {
        this.tempFullProductORInfo = [...this.order.productOR.productORInfo];
        if (this.styleS.length > 0) {
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(this.styleS.includes(i.productBarcode.substr(0, 12).trim())));
        }
        if (this.targetPlaceS.length > 0) {
            const targetPlaceNewS = this.targetPlaceS.map(this.transformToCountryID)
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(targetPlaceNewS.includes(i.targetPlace.countryID)));
        }
        if (this.colorS.length > 0) {
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(this.colorS.includes(i.productColor)));
        }
        if (this.sizeS.length > 0) {
            this.tempFullProductORInfo = this.tempFullProductORInfo.filter(i=>(this.sizeS.includes(i.productSize)));
        }
    }

    showProductfilterModal() {
        const ref = this.dialogService.open(SProductFilterComponent, {
            data: {
                id: 'productFilter',
                company: this.userService?.getCompany(),
                order: this.order,
                callfrom: this.formName,  // ## send to nodejs for choose buckets
                styleS: this.styleS,
                targetPlaceS: this.targetPlaceS,
                colorS: this.colorS,
                sizeS: this.sizeS
            },
            header: 'Product Filter [ ' + this.order.productOR.productID + ' ]',
            width: '80%'
        });

        ref.onClose.subscribe((data: any) => {
            // console.log(data);
            if (data) {
                this.styleS = data.styleS;
                this.targetPlaceS = data.targetPlaceS;
                this.colorS = data.colorS;
                this.sizeS = data.sizeS;
                this.productORInfoFilter();
            } else {
                this.styleS = [];
                this.targetPlaceS = [];
                this.colorS = [];
                this.sizeS = [];
                this.productORInfoFilter();
            }
            // this.targetPlace =
            //     this.userService.setAddBackStrLen(targetPlace.targetPlace.targetPlaceID, 4, '-').toUpperCase();
            // console.log(targetPlace);
            // editProductORInfo(field: string, value: string, targetPlace: TargetPlace)
            // this.editProductORInfo('targetPlace','',targetPlace.targetPlace);
        });
    }

    getRowClass(idx: number) {
        // let className = '';
        if (idx === this.rowSelectedIdx) { return 'background-color: var(--yellow-50);'}
        return '';
    }

    rowSelect(idx: number, modeRow: string) {
        // this.tempFullProductORInfo


        if (this.productORInfoSelected.productBarcode !== this.tempFullProductORInfo[idx].productBarcode) {
            this.labelStart = 1;
            this.labelEnd = +this.labelStart + +this.labelCount - 1;
        }
        if (this.rowSelectedIdx === idx && modeRow === 'selectRow') {
            this.rowSelectedIdx = -1;
            this.productORInfoSelected = GBC.clrProductORInfo();

        } else if ( (this.rowSelectedIdx !== idx && modeRow === 'selectRow') || modeRow === 'calEndNumber') {
            this.rowSelectedIdx = idx;
            this.productORInfoSelected = this.tempFullProductORInfo[idx];
            this.labelQRCodes = [];
            this.createLabelQRCodes('');
        }
        // console.log(this.labelQRCodes);
        // .replace("Microsoft", "W3Schools")

    }

    createLabelQRCodes(mode: string) { // ## mode = autoRunning
        this.labelQRCodes = [];
        // ## gen QRcode  labelQRCode[]
        let i = 0;
        for (i = +this.labelStart; i <= +this.labelEnd; i++) {
            const productBarcode = this.productORInfoSelected.productBarcode;
            const runningNumber = +this.userService.setAddStrLen(i+'', 5, '0');
            const productBarcodeNumber = productBarcode+ this.userService.setAddStrLen(i+'', 5, '0');
            const style = productBarcode.substr(0, 12).trim();
            const targetPlaceName = this.productORInfoSelected.targetPlace.targetPlaceID;
            const countryID = this.productORInfoSelected.targetPlace.countryID;
            const productSize = this.productORInfoSelected.productSize;
            let productColor = '';
            const productColorArr = this.productORInfoSelected.productColor.split(",");
            // ## get color name
            for (const productC of productColorArr) {
                const colorName = this.userService.getColorNameByColorCode(productC, this.setName);
                productColor = productColor + colorName + ', ';
            }
            productColor = productColor.substring(0, productColor.length-2);  // ## cut last string 2 digit  ,
            const labelQRCode: LabelQRCode = {
                productBarcode,
                runningNumber,
                productBarcodeNumber,
                style,
                targetPlaceName,
                countryID,
                productSize,
                productColor: productColor.trim()
            };
            this.labelQRCodes.push(labelQRCode);
            // console.log('1...' + i);
        }
        // console.log(this.labelQRCodes);
        // console.log('2');
        if (mode === 'autoRunning' && i !== 0 && i > +this.labelEnd ) {
            // console.log(this.labelQRCodes);
            this.deleyTimer = setTimeout(() => {
                this.saveimg();
            }, 1000);

        }
    }

    // labelCount = 12;
    // labelStart = 1;
    // maxLabelStart = 99999 - +this.labelCount + 1;

    calEndNumber() {
        // console.log('calEndNumber');
        this.maxLabelStart = 99999 - +this.labelCount + 1;
        this.labelEnd = +this.labelStart + +this.labelCount - 1;
        // if (this.labelEnd > this.maxLabelStart) {
        //     this.labelStart = +this.labelStart - (+this.labelEnd - +this.maxLabelStart);
        //     this.labelEnd = +this.labelStart + +this.labelCount - 1;
        // }
        if (this.productORInfoSelected.productBarcode !== '-') {this.rowSelect(this.rowSelectedIdx, 'calEndNumber');}
    }

    maxValue(): boolean {
        // const charCode = (event.which) ? event.which : event.keyCode;
        if (this.maxLabelStart < this.labelStart) {
            this.labelStart = this.maxLabelStart;
            this.labelEnd = +this.labelStart + +this.labelCount - 1;
            return false;
        }
        return true;
    }

    // private setUsersTimer(duration: number) {
    //     this.clearTimeoutLogIn();
    //     clearTimeout(this.tokenTimer);
    //     this.tokenTimer = setTimeout(() => {
    //         this.logout();
    //         location.reload(); // ## refresh web for clear modal dialog
    //         // this.ref.close('button close dialog from ufactory create');
    //     }, duration * 1000);
    //     this.timeOutArr.push(this.tokenTimer);
    // }

    genLabelMany(duration: number, bundleQty: number, startNumber: number, endNumber: number) {
        // console.log(duration, bundleQty, startNumber, endNumber);
        this.clearInterval();
        clearTimeout(this.tokenTimer);
        this.errBundle = '';
        this.txtNoRunning = '';


        // ## create array bundle qrcode
        let qrCodeArr: any[] = [];

        //## check bundle OK
        const qty = endNumber - startNumber + 1;
        if (qty % bundleQty === 0 && +startNumber > 0 && +endNumber > 0 ) {
            // console.log('qrCodeArr');
            qrCodeArr = [];
            let startNo = +startNumber;
            let toNo = +startNumber + bundleQty - 1;
            while(toNo <= +endNumber) {
                qrCodeArr.push({
                    startNo: startNo, toNo: toNo
                });
                startNo = startNo + bundleQty;
                toNo = toNo + bundleQty;
            }
            // console.log(qrCodeArr);

            let i = 0;
            this.tokenTimer = setInterval(() => {
                // ## create qrCode here
                // console.log(qrCodeArr[i]);
                this.labelStart = qrCodeArr[i].startNo;
                this.labelEnd = qrCodeArr[i].toNo;
                this.txtNoRunning = qrCodeArr[i].startNo + ' --> ' + qrCodeArr[i].toNo;
                this.createLabelQRCodes('autoRunning');
                i++;
                if (i >= qrCodeArr.length) {
                    this.txtNoRunning = 'completed';
                    this.clearInterval();
                } // ## stop gen qrcode
            }, duration * 1000);
        } else {
            this.errBundle = 'err Qty not bundle complete';
        }
    }

    clearInterval() {
        clearInterval(this.tokenTimer);
    }

    // clearTimeoutLogIn() {
    //     this.timeOutArr.forEach((item, index) => {
    //       clearTimeout(item);
    //       if (index == (this.timeOutArr.length - 1)) { this.timeOutArr = []; }
    //     });
    // }

    releaseCanvas(canvas: any) {
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx && ctx.clearRect(0, 0, 1, 1);
    }

    // ## not complete because decide to use save to image
    savePdf() {
        // class="label-box"
        const labelBox = document.querySelector('.label-box');
        const doc = new jsPDF();
        html2canvas(labelBox as HTMLElement).then((canvas) => {
            // console.log(canvas);
            const imgWidth = 40;
            const pageHeight = 52;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const heightLeft = imgHeight;

            const contentDataURL = canvas.toDataURL('image/png');
            // new jsPDF('l', 'in', [3, 5]);
            // const pdf = new jsPDF("p", "in", [1.5, 2]); // A4 size page of PDF
            new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
            const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
            const position = 0;
            pdf.addImage(
                contentDataURL,
                'PNG',
                0,
                position,
                imgWidth,
                imgHeight
            );
            pdf.save('MYPdf.pdf'); // Generated PDF
        });
    }

    saveimg() {
        const fileName = this.labelQRCodes[0].style
            +'-'+this.labelQRCodes[0].targetPlaceName
            +'-'+this.labelQRCodes[0].countryID
            +'-'+this.labelQRCodes[0].productSize
            +'-'+this.labelQRCodes[0].productColor.replace(" ", "-")
            +'-'+this.labelQRCodes.length
            +'-'+this.labelStart+'-'+this.labelEnd;
        const labelBox = document.querySelector('.label-box');
        const doc = new jsPDF();
        html2canvas(labelBox as HTMLElement).then(async (canvas) => {
            const dataUrl = canvas.toDataURL();
            const data = dataUrl.split(',')[1];
            const blob = await this.userService.b64toBlob(data, 'image/png');

            // ## web
            const a = window.document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            this.releaseCanvas(canvas);
        });
    }

    saveimg2() {
        const labelBox = document.querySelector('.label-box');
        const doc = new jsPDF();
        html2canvas(labelBox as HTMLElement).then((canvas) => {
            this.canvas.nativeElement.src = canvas.toDataURL();
            this.downloadLink.nativeElement.href =
                canvas.toDataURL('image/png');
            this.downloadLink.nativeElement.download = 'marble-diagram.png';
        });
    }

    getBackgroudColor(colorCode: string) {
        const colorValue =  this.userService.getColorByColorCode(colorCode);
        return 'background-color: '+colorValue;
    }

    // numberOnly(event: any): boolean {
    //     const charCode = (event.which) ? event.which : event.keyCode;
    //     if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    //       return false;
    //     }
    //     return true;
    // }



    ngOnDestroy(): void {
        clearTimeout(this.deleyTimer);

        if (this.repCompanyOrderSub) { this.repCompanyOrderSub.unsubscribe(); }
        if (this.orderProductBundleNosSub) { this.orderProductBundleNosSub.unsubscribe(); }
    }
}
