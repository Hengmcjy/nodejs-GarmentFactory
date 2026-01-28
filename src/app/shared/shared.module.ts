import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { FileUploadModule as FileUploadModuleNG2 } from 'ng2-file-upload';
import { QRCodeModule } from 'angularx-qrcode';


// // ## multi language
// import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
// import {TranslateHttpLoader} from '@ngx-translate/http-loader';
// import { HttpClient } from '@angular/common/http';

//## primeng
import { ButtonModule } from 'primeng/button';
import {KeyFilterModule} from 'primeng/keyfilter';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {PasswordModule} from 'primeng/password';
import {DividerModule} from 'primeng/divider';
import {ChipsModule} from 'primeng/chips';
import {FileUploadModule} from 'primeng/fileupload';
import {ToastModule} from 'primeng/toast';
import {MenuModule} from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import {TableModule} from 'primeng/table';
import {ChartModule} from 'primeng/chart';
import {TimelineModule} from 'primeng/timeline';
import {KnobModule} from 'primeng/knob';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import {GalleriaModule} from 'primeng/galleria';
import {PaginatorModule} from 'primeng/paginator';
import {RatingModule} from 'primeng/rating';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {SliderModule} from 'primeng/slider';
import {AvatarModule} from 'primeng/avatar';
import {AvatarGroupModule} from 'primeng/avatargroup';
import {MegaMenuModule} from 'primeng/megamenu';
import { RippleModule } from 'primeng/ripple';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {CardModule} from 'primeng/card';
import {BadgeModule} from 'primeng/badge';
import {TabViewModule} from 'primeng/tabview';
import { ChipModule } from 'primeng/chip';
import {TabMenuModule} from 'primeng/tabmenu';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {SelectButtonModule} from 'primeng/selectbutton';
import {ToolbarModule} from 'primeng/toolbar';
import {BlockUIModule} from 'primeng/blockui';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import {ListboxModule} from 'primeng/listbox';
import { ContextMenuModule } from 'primeng/contextmenu';
import { SplitterModule } from 'primeng/splitter';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { AccordionModule } from 'primeng/accordion';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SidebarModule } from 'primeng/sidebar';
import { ConfirmPopupModule } from 'primeng/confirmpopup';


// ## test
import { STestPrgComponent } from './components/general/s-test-prg/s-test-prg.component';
import { SSystemInfoComponent } from './components/general/s-system-info/s-system-info.component';
import { STsUploadimgsComponent } from './test/s-ts-uploadimgs/s-ts-uploadimgs.component';

// ## general components
import { SmdInputNumber1Component } from './components/general/smd-input-number1/smd-input-number1.component';
import { SmdSelectZone1Component } from './components/general/smd-select-zone1/smd-select-zone1.component';

// ##
import { CompanyNewComponent } from './components/user/company-new/company-new.component';
import { CompanyJoinComponent } from './components/user/company-join/company-join.component';
import { FactoryNewComponent } from './components/user/factory-new/factory-new.component';
import { SProductNewComponent } from './components/user/s-product-new/s-product-new.component';
import { UsignupComponent } from './components/user/usignup/usignup.component';
import { UploadImageComponent } from './components/general/upload-image/upload-image.component';
import { StaffLoginComponent } from './components/general/staff-login/staff-login.component';
import { SWaitResponseUsernodeLoginComponent } from './components/general/s-wait-response-usernode-login/s-wait-response-usernode-login.component';
import { WebFooterComponent } from './components/general/web-footer/web-footer.component';



import { SmdSetQcCompleteComponent } from './components/general/smd-set-qc-complete/smd-set-qc-complete.component';
import { SProductBundleInfoComponent } from './components/user/s-product-bundle-info/s-product-bundle-info.component';
import { SmdProductBundleRecordComponent } from './components/user/smd-product-bundle-record/smd-product-bundle-record.component';
import { SProductBundleRecordComponent } from './components/user/s-product-bundle-record/s-product-bundle-record.component';
import { SmdConfirmImportantTaskComponent } from './components/general/smd-confirm-important-task/smd-confirm-important-task.component';
import { SOrderCardComponent } from './components/user/s-order-card/s-order-card.component';
import { SUserCardComponent } from './components/user/s-user-card/s-user-card.component';
import { SProductCardComponent } from './components/user/s-product-card/s-product-card.component';
import { SCustomerCardComponent } from './components/user/s-customer-card/s-customer-card.component';
import { SmdCustomerCardComponent } from './components/user/smd-customer-card/smd-customer-card.component';
import { SChangPasswordComponent } from './components/general/s-chang-password/s-chang-password.component';
import { SSelectFactoryComponent } from './components/general/s-select-factory/s-select-factory.component';
import { SNodeflowCreateComponent } from './components/factory/s-nodeflow-create/s-nodeflow-create.component';
import { SSelectCustomerComponent } from './components/general/s-select-customer/s-select-customer.component';
import { SSelectOrderComponent } from './components/general/s-select-order/s-select-order.component';
import { SSelectProductComponent } from './components/general/s-select-product/s-select-product.component';
import { SSelectStyleComponent } from './components/general/s-select-style/s-select-style.component';
import { SSelectTargetPlaceComponent } from './components/general/s-select-target-place/s-select-target-place.component';
import { SSelectSizeComponent } from './components/general/s-select-size/s-select-size.component';
import { SSelectColorComponent } from './components/general/s-select-color/s-select-color.component';
import { SmdSelectColorComponent } from './components/general/smd-select-color/smd-select-color.component';
import { SSelectYearComponent } from './components/general/s-select-year/s-select-year.component';
import { SSelectSexComponent } from './components/general/s-select-sex/s-select-sex.component';
import { SDepartmentProductionComponent } from './components/general/s-department-production/s-department-production.component';
import { SProductFilterComponent } from './components/general/s-product-filter/s-product-filter.component';
import { SYarnFilterComponent } from './components/general/s-yarn-filter/s-yarn-filter.component';
import { SGenQrcodeComponent } from './components/general/s-gen-qrcode/s-gen-qrcode.component';
import { SUserProfileComponent } from './components/user/s-user-profile/s-user-profile.component';
import { SProductHistoryComponent } from './components/product/s-product-history/s-product-history.component';
import { SProductImageComponent } from './components/product/s-product-image/s-product-image.component';
import { SOrderNewComponent } from './components/user/s-order-new/s-order-new.component';
import { SCustomerProfileComponent } from './components/customer/s-customer-profile/s-customer-profile.component';
import { SLabelQrcodeComponent } from './components/order/s-label-qrcode/s-label-qrcode.component';
import { SGenQrComponent } from './components/order/s-gen-qr/s-gen-qr.component';
import { SFactoryCardComponent } from './components/factory/s-factory-card/s-factory-card.component';
import { SProductionQueueInfoComponent } from './components/order/s-production-queue-info/s-production-queue-info.component';
import { SProductionQueueManageComponent } from './components/order/s-production-queue-manage/s-production-queue-manage.component';
import { SProductionQueueListComponent } from './components/order/s-production-queue-list/s-production-queue-list.component';
import { SCompanyCardComponent } from './components/company/s-company-card/s-company-card.component';
import { SOrderviewComponent } from './components/order/s-orderview/s-orderview.component';
import { SmdOrderviewComponent } from './components/order/smd-orderview/smd-orderview.component';
import { SmdOrderMaxqtyViewComponent } from './components/order/smd-order-maxqty-view/smd-order-maxqty-view.component';
import { SZonecountryOrderviewComponent } from './components/order/s-zonecountry-orderview/s-zonecountry-orderview.component';
import { SShowQrcodeComponent } from './components/order/s-show-qrcode/s-show-qrcode.component';
import { SQrcodeManageComponent } from './components/order/s-qrcode-manage/s-qrcode-manage.component';
import { SOrderproductionInfoComponent } from './components/order/s-orderproduction-info/s-orderproduction-info.component';
import { SOrderQueueListComponent } from './components/order/s-order-queue-list/s-order-queue-list.component';
import { SOrderQueueSetComponent } from './components/order/s-order-queue-set/s-order-queue-set.component';
import { SOrderQtyRewriteComponent } from './components/order/s-order-qty-rewrite/s-order-qty-rewrite.component';
import { SOrderPrintJobcardComponent } from './components/order/s-order-print-jobcard/s-order-print-jobcard.component';
import { SQrcodeSetnumberComponent } from './components/order/s-qrcode-setnumber/s-qrcode-setnumber.component';
import { SmdOrderRecordRewriteComponent } from './components/order/smd-order-record-rewrite/smd-order-record-rewrite.component';
import { SmdProductbarcodenoComponent } from './components/order/smd-productbarcodeno/smd-productbarcodeno.component';
import { SmdScannedProductComponent } from './components/order/smd-scanned-product/smd-scanned-product.component';
import { SmdOrderSeasonyearComponent } from './components/order/smd-order-seasonyear/smd-order-seasonyear.component';
import { SmdSelectOrderComponent } from './components/general/smd-select-order/smd-select-order.component';
import { SOrderSetlostComponent } from './components/order/s-order-setlost/s-order-setlost.component';
import { SOrderSetlostEditComponent } from './components/order/s-order-setlost-edit/s-order-setlost-edit.component';
import { SOrderOutsProgressTrackingComponent } from './components/order/s-order-outs-progress-tracking/s-order-outs-progress-tracking.component';

import { SNodeLoginAllowComponent } from './components/user/node/s-node-login-allow/s-node-login-allow.component';
import { SWorkStationComponent } from './components/user/node/s-work-station/s-work-station.component';
import { SWorkStationMainComponent } from './components/user/node/s-work-station-main/s-work-station-main.component';
import { SWorkStationHeadComponent } from './components/user/node/s-work-station-head/s-work-station-head.component';
import { NodeHomeComponent } from './components/user/node/node-home/node-home.component';
import { NodeViewStatComponent } from './components/user/node/node-view-stat/node-view-stat.component';
import { NodeChartComponent } from './components/user/node/node-chart/node-chart.component';
import { NodeProductionQueueComponent } from './components/user/node/node-production-queue/node-production-queue.component';
import { NodeProductRecordComponent } from './components/user/node/node-product-record/node-product-record.component';
import { SNodeProductRecordComponent } from './components/user/node/s-node-product-record/s-node-product-record.component';
import { SNodeProductReportComponent } from './components/user/node/s-node-product-report/s-node-product-report.component';
import { SNodeProductHistoryComponent } from './components/user/node/s-node-product-history/s-node-product-history.component';
import { SNodeProductRepairComponent } from './components/user/node/s-node-product-repair/s-node-product-repair.component';
import { SNodeProductReturnComponent } from './components/user/node/s-node-product-return/s-node-product-return.component';
import { SNodeProductSelectProblemComponent } from './components/user/node/s-node-product-select-problem/s-node-product-select-problem.component';
import { SNodeScanSubProcessComponent } from './components/user/node/s-node-scan-sub-process/s-node-scan-sub-process.component';
import { SmdNodeSubnodeSelectComponent } from './components/user/node/smd-node-subnode-select/smd-node-subnode-select.component';

import { SRepComOverallComponent } from './components/rep/company/s-rep-com-overall/s-rep-com-overall.component';
import { SRepComOverviewComponent } from './components/rep/company/s-rep-com-overview/s-rep-com-overview.component';
import { SRepComProductionOverallComponent } from './components/rep/company/s-rep-com-production-overall/s-rep-com-production-overall.component';
import { SRepFacOverallComponent } from './components/rep/company/s-rep-fac-overall/s-rep-fac-overall.component';
import { SRepFacDashboardComponent } from './components/rep/factory/s-rep-fac-dashboard/s-rep-fac-dashboard.component';
import { SRepFacQueuedProductionComponent } from './components/rep/factory/s-rep-fac-queued-production/s-rep-fac-queued-production.component';
import { SRepFacNodeStationComponent } from './components/rep/factory/s-rep-fac-node-station/s-rep-fac-node-station.component';
import { SRepFacNodeBundleComponent } from './components/rep/factory/s-rep-fac-node-bundle/s-rep-fac-node-bundle.component';
import { SRepFacNodeScanComponent } from './components/rep/factory/s-rep-fac-node-scan/s-rep-fac-node-scan.component';
import { SRepFacAllNodeScanComponent } from './components/rep/factory/s-rep-fac-all-node-scan/s-rep-fac-all-node-scan.component';
import { SRepFacProcessPeriodComponent } from './components/rep/factory/s-rep-fac-process-period/s-rep-fac-process-period.component';
import { SRepFacProcessPeriodZoneComponent } from './components/rep/factory/s-rep-fac-process-period-zone/s-rep-fac-process-period-zone.component';
import { SRepFacScanBundleStateComponent } from './components/rep/factory/s-rep-fac-scan-bundle-state/s-rep-fac-scan-bundle-state.component';
import { SRepFacScanBundleStateStyleComponent } from './components/rep/factory/s-rep-fac-scan-bundle-state-style/s-rep-fac-scan-bundle-state-style.component';
import { SRepFacScanBundleStateStyleSetgroupComponent } from './components/rep/factory/s-rep-fac-scan-bundle-state-style-setgroup/s-rep-fac-scan-bundle-state-style-setgroup.component';
import { SmdNewBundleSetgroupComponent } from './components/rep/company/smd-new-bundle-setgroup/smd-new-bundle-setgroup.component';
import { SmdRepFacScanBundleStateStyleSetgroupComponent } from './components/rep/factory/smd-rep-fac-scan-bundle-state-style-setgroup/smd-rep-fac-scan-bundle-state-style-setgroup.component';
import { SRepOutsOverallComponent } from './components/rep/company/s-rep-outs-overall/s-rep-outs-overall.component';
import { SRepOutsOverall2Component } from './components/rep/company/s-rep-outs-overall2/s-rep-outs-overall2.component';
import { SRepOutsDateComponent } from './components/rep/company/s-rep-outs-date/s-rep-outs-date.component';
import { SRepOutsStateComponent } from './components/rep/company/s-rep-outs-state/s-rep-outs-state.component';
import { SRepWorkloadOverallComponent } from './components/rep/company/s-rep-workload-overall/s-rep-workload-overall.component';
import { SRepWorkloadOverall2Component } from './components/rep/company/s-rep-workload-overall2/s-rep-workload-overall2.component';
import { SRepWorkloadPersonalComponent } from './components/rep/company/s-rep-workload-personal/s-rep-workload-personal.component';
import { SRepPdsWlSubnodeComponent } from './components/rep/company/s-rep-pds-wl-subnode/s-rep-pds-wl-subnode.component';
import { SmdRepSubnodeScannedComponent } from './components/rep/company/smd-rep-subnode-scanned/smd-rep-subnode-scanned.component';
import { SmdRepProgressZoneComponent } from './components/rep/company/smd-rep-progress-zone/smd-rep-progress-zone.component';
import { SmdRepProgressNodeComponent } from './components/rep/company/smd-rep-progress-node/smd-rep-progress-node.component';
import { SmdRepProcessEditQtyComponent } from './components/rep/factory/smd-rep-process-edit-qty/smd-rep-process-edit-qty.component';

import { SmdSelectNodestationComponent } from './components/general/smd-select-nodestation/smd-select-nodestation.component';
import { SmdSelectSubnodeflowComponent } from './components/general/smd-select-subnodeflow/smd-select-subnodeflow.component';
import { SmdRepWorkloadOverall1Component } from './components/rep/company/smd-rep-workload-overall1/smd-rep-workload-overall1.component';
import { SmdRepWorkloadOverallstaff1Component } from './components/rep/company/smd-rep-workload-overallstaff1/smd-rep-workload-overallstaff1.component';

import { SFactoryAffiliateReceiveComponent } from './components/user/node/s-factory-affiliate-receive/s-factory-affiliate-receive.component';
import { SOutsourceReceiveComponent } from './components/user/node/s-outsource-receive/s-outsource-receive.component';
import { SOutsourceSendoutComponent } from './components/user/node/s-outsource-sendout/s-outsource-sendout.component';
import { SOutsourceSelectnodeComponent } from './components/user/node/s-outsource-selectnode/s-outsource-selectnode.component';


import { SYarnPlanListComponent } from './components/user/yarn/s-yarn-plan-list/s-yarn-plan-list.component';
import { SYarnStatComponent } from './components/user/yarn/s-yarn-stat/s-yarn-stat.component';
import { SYarnPlanListManageComponent } from './components/user/yarn/s-yarn-plan-list-manage/s-yarn-plan-list-manage.component';
import { SYarnPlanPackinglistManageComponent } from './components/user/yarn/s-yarn-plan-packinglist-manage/s-yarn-plan-packinglist-manage.component';
import { SmdYarnPlanPackinglistAddComponent } from './components/user/yarn/smd-yarn-plan-packinglist-add/smd-yarn-plan-packinglist-add.component';
import { SmdYarnLotManageComponent } from './components/user/yarn/smd-yarn-lot-manage/smd-yarn-lot-manage.component';
import { SmdYarnLotTransferComponent } from './components/user/yarn/smd-yarn-lot-transfer/smd-yarn-lot-transfer.component';
import { SmdYarnDataInfoManageComponent } from './components/user/yarn/smd-yarn-data-info-manage/smd-yarn-data-info-manage.component';
import { SmdYarnSeasonyearComponent } from './components/user/yarn/smd-yarn-seasonyear/smd-yarn-seasonyear.component';
import { SmdYarnPlanManageComponent } from './components/user/yarn/smd-yarn-plan-manage/smd-yarn-plan-manage.component';
import { SmdYarnListsSelectComponent } from './components/user/yarn/smd-yarn-lists-select/smd-yarn-lists-select.component';
import { SpnsYarnSeasonyearComponent } from './components/user/yarn/spns-yarn-seasonyear/spns-yarn-seasonyear.component';
import { SpnsYarnCustomerComponent } from './components/user/yarn/spns-yarn-customer/spns-yarn-customer.component';
import { SpnsYarnFactoryComponent } from './components/user/yarn/spns-yarn-factory/spns-yarn-factory.component';
import { SYarnStockComponent } from './components/user/yarn/s-yarn-stock/s-yarn-stock.component';
import { SYarnLotFacComponent } from './components/user/yarn/s-yarn-lot-fac/s-yarn-lot-fac.component';
import { S2YarnLotFacComponent } from './components/user/yarn/s2-yarn-lot-fac/s2-yarn-lot-fac.component';
import { SYarnTransferReportComponent } from './components/user/yarn/s-yarn-transfer-report/s-yarn-transfer-report.component';
import { SYarnReportListComponent } from './components/user/yarn/s-yarn-report-list/s-yarn-report-list.component';
import { SYarnReportFacStockComponent } from './components/user/yarn/s-yarn-report-fac-stock/s-yarn-report-fac-stock.component';
import { SmdYarnChangeinvoiceidComponent } from './components/user/yarn/smd-yarn-changeinvoiceid/smd-yarn-changeinvoiceid.component';
import { SmdYarnChangenameComponent } from './components/user/yarn/smd-yarn-changename/smd-yarn-changename.component';

import { SSetYarnProductionComponent } from './components/user/yarn/s-set-yarn-production/s-set-yarn-production.component';

import { SCcProgressbarComponent } from './components/component/s-cc-progressbar/s-cc-progressbar.component';
import { SCcDateSelectComponent } from './components/component/s-cc-date-select/s-cc-date-select.component';
import { SCcDateSelect2Component } from './components/component/s-cc-date-select2/s-cc-date-select2.component';

import { SmdDeliCountrySelectComponent } from './components/deli/smd-deli-country-select/smd-deli-country-select.component';
import { SmdDeliOrderSelectComponent } from './components/deli/smd-deli-order-select/smd-deli-order-select.component';
import { SmdDeliCartonSizeSelectComponent } from './components/deli/smd-deli-carton-size-select/smd-deli-carton-size-select.component';
import { SmdDeliCartonAddboxComponent } from './components/deli/smd-deli-carton-addbox/smd-deli-carton-addbox.component';
import { SDeliPackingCheckComponent } from './components/deli/s-deli-packing-check/s-deli-packing-check.component';

import { SAccSettngComponent } from './components/acc/s-acc-settng/s-acc-settng.component';

import { NoSpaceDirective } from '../directives/no-space.directive';
import { NumberDirective } from '../directives/numbers-only.directive';









// // ## multi language
// // AoT requires an exported function for factories
// export function createTranslateLoader(http: HttpClient) {
    //     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
    // }

@NgModule({
    declarations: [
        NoSpaceDirective,
        NumberDirective,

        STestPrgComponent,
        SSystemInfoComponent,
        STsUploadimgsComponent,

        SmdInputNumber1Component,
        SmdSelectZone1Component,

        SmdSetQcCompleteComponent,
        SProductBundleInfoComponent,
        SmdProductBundleRecordComponent,
        SProductBundleRecordComponent,
        SmdConfirmImportantTaskComponent,
        CompanyNewComponent,
        CompanyJoinComponent,
        FactoryNewComponent,
        SProductNewComponent,
        SOrderNewComponent,
        UsignupComponent,
        UploadImageComponent,
        StaffLoginComponent,
        SWaitResponseUsernodeLoginComponent,
        WebFooterComponent,
        SWorkStationComponent,
        NodeHomeComponent,
        NodeViewStatComponent,
        NodeChartComponent,
        SOrderCardComponent,
        SUserCardComponent,
        SProductCardComponent,
        SCustomerCardComponent,
        SmdCustomerCardComponent,
        SChangPasswordComponent,
        SSelectFactoryComponent,
        SNodeflowCreateComponent,
        SSelectCustomerComponent,
        SSelectOrderComponent,
        SSelectProductComponent,
        SSelectStyleComponent,
        SSelectTargetPlaceComponent,
        SSelectSizeComponent,
        SSelectColorComponent,
        SmdSelectColorComponent,
        SSelectYearComponent,
        SSelectSexComponent,
        SDepartmentProductionComponent,
        SProductFilterComponent,
        SYarnFilterComponent,
        SGenQrcodeComponent,
        SUserProfileComponent,
        SProductHistoryComponent,
        SOrderviewComponent,
        SmdOrderviewComponent,
        SmdOrderMaxqtyViewComponent,
        SZonecountryOrderviewComponent,
        SShowQrcodeComponent,
        SQrcodeManageComponent,
        SOrderproductionInfoComponent,
        SOrderQtyRewriteComponent,
        SOrderPrintJobcardComponent,
        SQrcodeSetnumberComponent,
        SmdOrderRecordRewriteComponent,
        SmdProductbarcodenoComponent,
        SmdScannedProductComponent,
        SmdOrderSeasonyearComponent,
        SmdSelectOrderComponent,
        SOrderOutsProgressTrackingComponent,

        SProductImageComponent,
        SCustomerProfileComponent,
        SLabelQrcodeComponent,
        SGenQrComponent,
        SFactoryCardComponent,
        SProductionQueueInfoComponent,
        SProductionQueueManageComponent,
        SProductionQueueListComponent,
        SOrderQueueListComponent,
        SOrderQueueSetComponent,
        SCompanyCardComponent,
        SWorkStationMainComponent,
        SWorkStationHeadComponent,
        SNodeLoginAllowComponent,
        SOrderSetlostComponent,
        SOrderSetlostEditComponent,

        SRepComOverallComponent,
        SRepComOverviewComponent,
        SRepComProductionOverallComponent,
        SRepFacOverallComponent,
        SRepFacDashboardComponent,
        SRepFacQueuedProductionComponent,
        SRepFacNodeStationComponent,
        SRepFacNodeBundleComponent,
        SRepFacNodeScanComponent,
        SRepFacAllNodeScanComponent,
        SRepFacProcessPeriodComponent,
        SRepFacProcessPeriodZoneComponent,
        SRepFacScanBundleStateComponent,
        SRepFacScanBundleStateStyleComponent,
        SRepFacScanBundleStateStyleSetgroupComponent,
        SmdNewBundleSetgroupComponent,
        SmdRepFacScanBundleStateStyleSetgroupComponent,
        SRepOutsOverallComponent,
        SRepOutsOverall2Component,
        SRepOutsStateComponent,
        SRepWorkloadOverallComponent,
        SRepWorkloadOverall2Component,
        SRepOutsDateComponent,
        SRepWorkloadPersonalComponent,
        SRepPdsWlSubnodeComponent,
        SmdRepSubnodeScannedComponent,
        SmdRepProgressZoneComponent,
        SmdRepProgressNodeComponent,
        SmdRepProcessEditQtyComponent,

        NodeProductionQueueComponent,
        NodeProductRecordComponent,
        SNodeProductReportComponent,
        SNodeProductRepairComponent,
        SNodeProductRecordComponent,
        SNodeProductReturnComponent,
        SNodeProductHistoryComponent,
        SNodeProductSelectProblemComponent,
        SNodeScanSubProcessComponent,
        SmdNodeSubnodeSelectComponent,
        SmdRepWorkloadOverall1Component,
        SmdRepWorkloadOverallstaff1Component,

        SmdSelectNodestationComponent,
        SmdSelectSubnodeflowComponent,

        SFactoryAffiliateReceiveComponent,
        SOutsourceReceiveComponent,
        SOutsourceSendoutComponent,
        SOutsourceSelectnodeComponent,

        SYarnPlanListComponent,
        SYarnStatComponent,
        SYarnPlanListManageComponent,
        SYarnPlanPackinglistManageComponent,
        SmdYarnPlanPackinglistAddComponent,
        SmdYarnLotManageComponent,
        SmdYarnDataInfoManageComponent,
        SmdYarnSeasonyearComponent,
        SmdYarnPlanManageComponent,
        SmdYarnLotTransferComponent,
        SmdYarnListsSelectComponent,
        SpnsYarnSeasonyearComponent,
        SpnsYarnCustomerComponent,
        SpnsYarnFactoryComponent,
        SYarnStockComponent,
        SYarnLotFacComponent,
        S2YarnLotFacComponent,
        SYarnTransferReportComponent,
        SYarnReportListComponent,
        SYarnReportFacStockComponent,
        SmdYarnChangeinvoiceidComponent,
        SmdYarnChangenameComponent,

        SSetYarnProductionComponent,

        SmdDeliCountrySelectComponent,
        SmdDeliOrderSelectComponent,
        SmdDeliCartonSizeSelectComponent,
        SmdDeliCartonAddboxComponent,
        SDeliPackingCheckComponent,

        SCcProgressbarComponent,
        SCcDateSelectComponent,
        SCcDateSelect2Component,

        SAccSettngComponent,

    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        FileUploadModuleNG2,
        QRCodeModule,

        // // ## multi language
        // TranslateModule.forChild({
        //     loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
        //     isolate: true
        // }),

        ButtonModule,
        KeyFilterModule,
        InputTextModule,
        InputNumberModule,
        PasswordModule,
        DividerModule,
        ChipsModule,
        FileUploadModule,
        ToastModule,
        MenuModule,
        TagModule,
        TableModule,
        ChartModule,
        TimelineModule,
        KnobModule,
        DynamicDialogModule,
        DialogModule,
        GalleriaModule,
        PaginatorModule,
        RatingModule,
        ToggleButtonModule,
        SliderModule,
        AvatarModule,
        AvatarGroupModule,
        MegaMenuModule,
        RippleModule,
        ProgressSpinnerModule,
        CardModule,
        BadgeModule,
        TabViewModule,
        ChipModule,
        TabMenuModule,
        ConfirmDialogModule,
        SelectButtonModule,
        ToolbarModule,
        BlockUIModule,
        CalendarModule,
        OverlayPanelModule,
        ListboxModule,
        ContextMenuModule,
        SplitterModule,
        ScrollPanelModule,
        AccordionModule,
        SplitButtonModule,
        SidebarModule,
        ConfirmPopupModule,

    ],
    exports: [
        NoSpaceDirective,
        NumberDirective,

        STestPrgComponent,
        SSystemInfoComponent,
        STsUploadimgsComponent,

        SmdInputNumber1Component,
        SmdSelectZone1Component,

        SmdSetQcCompleteComponent,
        SProductBundleInfoComponent,
        SmdProductBundleRecordComponent,
        SProductBundleRecordComponent,
        SmdConfirmImportantTaskComponent,
        CompanyNewComponent,
        CompanyJoinComponent,
        FactoryNewComponent,
        SProductNewComponent,
        SOrderNewComponent,
        UsignupComponent,
        UploadImageComponent,
        WebFooterComponent,
        StaffLoginComponent,
        SWaitResponseUsernodeLoginComponent,
        SWorkStationComponent,
        NodeHomeComponent,
        NodeViewStatComponent,
        NodeChartComponent,
        SOrderCardComponent,
        SUserCardComponent,
        SProductCardComponent,
        SCustomerCardComponent,
        SmdCustomerCardComponent,
        SChangPasswordComponent,
        SSelectFactoryComponent,
        SNodeflowCreateComponent,
        SSelectCustomerComponent,
        SSelectOrderComponent,
        SSelectProductComponent,
        SSelectStyleComponent,
        SSelectTargetPlaceComponent,
        SSelectSizeComponent,
        SSelectColorComponent,
        SmdSelectColorComponent,
        SSelectYearComponent,
        SSelectSexComponent,
        SDepartmentProductionComponent,
        SProductFilterComponent,
        SYarnFilterComponent,
        SGenQrcodeComponent,
        SUserProfileComponent,
        SProductHistoryComponent,
        SOrderviewComponent,
        SmdOrderviewComponent,
        SmdOrderMaxqtyViewComponent,
        SZonecountryOrderviewComponent,
        SShowQrcodeComponent,
        SQrcodeManageComponent,
        SOrderproductionInfoComponent,
        SOrderQtyRewriteComponent,
        SOrderPrintJobcardComponent,
        SQrcodeSetnumberComponent,
        SmdOrderRecordRewriteComponent,
        SmdProductbarcodenoComponent,
        SmdScannedProductComponent,
        SmdOrderSeasonyearComponent,
        SmdSelectOrderComponent,
        SOrderOutsProgressTrackingComponent,

        SProductImageComponent,
        SCustomerProfileComponent,
        SLabelQrcodeComponent,
        SGenQrComponent,
        SFactoryCardComponent,
        SProductionQueueInfoComponent,
        SProductionQueueManageComponent,
        SProductionQueueListComponent,
        SOrderQueueListComponent,
        SOrderQueueSetComponent,
        SCompanyCardComponent,
        SWorkStationMainComponent,
        SWorkStationHeadComponent,
        SNodeLoginAllowComponent,
        SOrderSetlostComponent,
        SOrderSetlostEditComponent,

        SRepComOverallComponent,
        SRepComOverviewComponent,
        SRepComProductionOverallComponent,
        SRepFacOverallComponent,
        SRepFacDashboardComponent,
        SRepFacQueuedProductionComponent,
        SRepFacNodeStationComponent,
        SRepFacNodeBundleComponent,
        SRepFacNodeScanComponent,
        SRepFacAllNodeScanComponent,
        SRepFacProcessPeriodComponent,
        SRepFacProcessPeriodZoneComponent,
        SRepFacScanBundleStateComponent,
        SRepFacScanBundleStateStyleComponent,
        SRepFacScanBundleStateStyleSetgroupComponent,
        SmdNewBundleSetgroupComponent,
        SmdRepFacScanBundleStateStyleSetgroupComponent,
        SRepOutsOverallComponent,
        SRepOutsOverall2Component,
        SRepOutsDateComponent,
        SRepOutsStateComponent,
        SRepWorkloadOverallComponent,
        SRepWorkloadOverall2Component,
        SRepWorkloadPersonalComponent,
        SRepPdsWlSubnodeComponent,
        SmdRepSubnodeScannedComponent,
        SmdRepProgressZoneComponent,
        SmdRepProgressNodeComponent,
        SmdRepProcessEditQtyComponent,

        NodeProductionQueueComponent,
        NodeProductRecordComponent,
        SNodeProductReportComponent,
        SNodeProductRecordComponent,
        SNodeProductRepairComponent,
        SNodeProductReturnComponent,
        SNodeProductHistoryComponent,
        SNodeProductSelectProblemComponent,
        SNodeScanSubProcessComponent,
        SmdNodeSubnodeSelectComponent,
        SmdRepWorkloadOverall1Component,
        SmdRepWorkloadOverallstaff1Component,

        SmdSelectNodestationComponent,
        SmdSelectSubnodeflowComponent,

        SFactoryAffiliateReceiveComponent,
        SOutsourceReceiveComponent,
        SOutsourceSendoutComponent,
        SOutsourceSelectnodeComponent,

        SYarnPlanListComponent,
        SYarnStatComponent,
        SYarnPlanListManageComponent,
        SYarnPlanPackinglistManageComponent,
        SmdYarnPlanPackinglistAddComponent,
        SmdYarnLotManageComponent,
        SmdYarnLotTransferComponent,
        SmdYarnDataInfoManageComponent,
        SmdYarnSeasonyearComponent,
        SmdYarnPlanManageComponent,
        SmdYarnListsSelectComponent,
        SpnsYarnSeasonyearComponent,
        SpnsYarnCustomerComponent,
        SpnsYarnFactoryComponent,
        SYarnStockComponent,
        SYarnLotFacComponent,
        S2YarnLotFacComponent,
        SYarnTransferReportComponent,
        SYarnReportListComponent,
        SYarnReportFacStockComponent,
        SmdYarnChangeinvoiceidComponent,
        SmdYarnChangenameComponent,

        SSetYarnProductionComponent,

        SmdDeliCountrySelectComponent,
        SmdDeliOrderSelectComponent,
        SmdDeliCartonSizeSelectComponent,
        SmdDeliCartonAddboxComponent,
        SDeliPackingCheckComponent,

        SCcProgressbarComponent,
        SCcDateSelectComponent,
        SCcDateSelect2Component,

        SAccSettngComponent,
    ]
})
export class SharedModule { }
