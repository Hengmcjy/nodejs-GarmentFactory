import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { QRCodeModule } from 'angularx-qrcode';

// // ## multi language
// import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
// import {TranslateHttpLoader} from '@ngx-translate/http-loader';
// import { HttpClient } from '@angular/common/http';



// import { OrderComponent } from './order/order.component';
// import { OrderCreateComponent } from './order/order-create/order-create.component';

import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {DialogModule} from 'primeng/dialog';
import {ToastModule} from 'primeng/toast';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { ChipsModule } from 'primeng/chips';
import { ChipModule } from 'primeng/chip';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {BadgeModule} from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import {ListboxModule} from 'primeng/listbox';
import {DividerModule} from 'primeng/divider';
import {CalendarModule} from 'primeng/calendar';
import {InputNumberModule} from 'primeng/inputnumber';
import {TableModule} from 'primeng/table';
import {RatingModule} from 'primeng/rating';
import {CheckboxModule} from 'primeng/checkbox';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {AccordionModule} from 'primeng/accordion';
import {GalleriaModule} from 'primeng/galleria';
import {AvatarModule} from 'primeng/avatar';
import {AvatarGroupModule} from 'primeng/avatargroup';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {OrderListModule} from 'primeng/orderlist';
import {TabViewModule} from 'primeng/tabview';
import {PaginatorModule} from 'primeng/paginator';
import {SelectButtonModule} from 'primeng/selectbutton';
import {BlockUIModule} from 'primeng/blockui';
import { SplitterModule } from 'primeng/splitter';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToolbarModule } from 'primeng/toolbar';


import { SharedModule } from 'src/app/shared/shared.module';
// import { NoSpaceDirective } from 'src/app/directives/no-space.directive';

import { UCompanyRoutingModule } from './ucompany-routing.module';
import { UcompanyDashboardComponent } from './ucompany-dashboard/ucompany-dashboard.component';
import { UcompanyComponent } from './ucompany.component';
import { UcompanyMenuComponent } from './ucompany-menu/ucompany-menu.component';
import { UcSettingComponent } from './uc-setting/uc-setting.component';
import { UcChangePassComponent } from './uc-change-pass/uc-change-pass.component';

import { UcMemberComponent } from './uc-member/uc-member.component';
import { UcMemberEditComponent } from './uc-member-edit/uc-member-edit.component';
import { UcCustomerComponent } from './uc-customer/uc-customer.component';
import { UcCustomerEditComponent } from './uc-customer-edit/uc-customer-edit.component';

// import { ProductComponent } from './product/product.component';
// import { ProductEditComponent } from './product/product-edit/product-edit.component';
import { ProductComponent } from '../ufactory/product/product.component';
import { ProductScanLoggingComponent } from './product/product-scan-logging/product-scan-logging.component';
import { ProductEditComponent } from '../ufactory/product/product-edit/product-edit.component';
import { OrderComponent } from '../ufactory/order/order.component';
import { OrderCreateComponent } from '../ufactory/order/order-create/order-create.component';
import { OrderOutsourceProgressTrackingComponent } from './order/order-outsource-progress-tracking/order-outsource-progress-tracking.component';
import { OrderQueueCreateComponent } from './order/order-queue-create/order-queue-create.component';
import { OrderQueueCreateOutsourceComponent } from './order/order-queue-create-outsource/order-queue-create-outsource.component';
import { OrderQueueListComponent } from './order/order-queue-list/order-queue-list.component';
import { OrderSetCountryComponent } from './order/order-set-country/order-set-country.component';
import { OrderSetColorComponent } from './order/order-set-color/order-set-color.component';
import { OrderSetSubproductionComponent } from './order/order-set-subproduction/order-set-subproduction.component';
import { OrderQueueHistoryComponent } from './order/order-queue-history/order-queue-history.component';
import { OrderProductSettingComponent } from './order/order-product-setting/order-product-setting.component';
import { OrderQrcodeManageComponent } from './order/order-qrcode-manage/order-qrcode-manage.component';


import { RepExclusiveUserComponent } from './rep-exclusive-user/rep-exclusive-user.component';

import { UprofileComponent } from '../uprofile/uprofile.component';
import { UprofileMenuComponent } from '../uprofile/uprofile-menu/uprofile-menu.component';

import { YarnComponent } from './yarn/yarn.component';
import { YarnPlanComponent } from './yarn-plan/yarn-plan.component';
import { YarnManageComponent } from './yarn-manage/yarn-manage.component';
import { YarnPackingListComponent } from './yarn-packing-list/yarn-packing-list.component';
import { YarnDashboardComponent } from './yarn-dashboard/yarn-dashboard.component';
import { YarnCreateComponent } from './yarn-create/yarn-create.component';
import { YarnSettingComponent } from './yarn-setting/yarn-setting.component';
import { YarnStockCardComponent } from './yarn-stock-card/yarn-stock-card.component';
import { YarnTransferComponent } from './yarn-transfer/yarn-transfer.component';
import { YarnStockComponent } from './yarn-stock/yarn-stock.component';
import { YarnReportComponent } from './yarn-report/yarn-report.component';

import { TransportComponent } from './transport/transport.component';
import { TspPackingCheckComponent } from './tsp-packing-check/tsp-packing-check.component';
import { TspDashboardComponent } from './tsp-dashboard/tsp-dashboard.component';
import { TspProductBoxComponent } from './tsp-product-box/tsp-product-box.component';
import { TspSettingDestinationComponent } from './transport/tsp-setting-destination/tsp-setting-destination.component';
import { TspSettingTaggroupComponent } from './transport/tsp-setting-taggroup/tsp-setting-taggroup.component';
import { TspSettingLabeltagComponent } from './transport/tsp-setting-labeltag/tsp-setting-labeltag.component';
import { TspRegistLabeltagComponent } from './transport/tsp-regist-labeltag/tsp-regist-labeltag.component';


import { FinancialComponent } from './financial/financial.component';
import { SetCostStyleSubnodeComponent } from './financial/set-cost-style-subnode/set-cost-style-subnode.component';
import { UcScannedSubnodeComponent } from './financial/uc-scanned-subnode/uc-scanned-subnode.component';
import { UcFinanceSettingComponent } from './financial/uc-finance-setting/uc-finance-setting.component';


import { HrComponent } from './hr/hr.component';
import { HrStaffRegistComponent } from './hr/hr-staff-regist/hr-staff-regist.component';


@NgModule({

    imports: [
        CommonModule,
        FormsModule,
        // QRCodeModule,
        // BrowserModule,
        // BrowserAnimationsModule,
        SharedModule,
        UCompanyRoutingModule,

        // // ## multi language
        // TranslateModule.forChild({
        //     loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
        //     isolate: true
        // }),

        ButtonModule,
        RippleModule,
        DynamicDialogModule,
        DialogModule,
        ToastModule,
        MegaMenuModule,
        MenuModule,
        ChipsModule,
        ChipModule,
        InputTextModule,
        InputTextareaModule,
        BadgeModule,
        TagModule,
        ListboxModule,
        DividerModule,
        CalendarModule,
        InputNumberModule,
        TableModule,
        RatingModule,
        CheckboxModule,
        MessagesModule,
        MessageModule,
        AccordionModule,
        GalleriaModule,
        AvatarModule,
        AvatarGroupModule,
        OverlayPanelModule,
        OrderListModule,
        TabViewModule,
        PaginatorModule,
        SelectButtonModule,
        BlockUIModule,
        SplitterModule,
        CardModule,
        ConfirmDialogModule,
        ProgressSpinnerModule,
        ToolbarModule,

    ],
    declarations: [
        // NoSpaceDirective,
        UcompanyDashboardComponent,
        UcompanyComponent,
        UcompanyMenuComponent,
        UcSettingComponent,
        UcChangePassComponent,

        UcMemberComponent,
        UcMemberEditComponent,
        UcCustomerComponent,
        UcCustomerEditComponent,

        ProductComponent,
        ProductEditComponent,
        ProductScanLoggingComponent,

        OrderComponent,
        OrderCreateComponent,
        OrderOutsourceProgressTrackingComponent,
        OrderQueueListComponent,
        OrderQueueCreateComponent,
        OrderQueueCreateOutsourceComponent,
        OrderSetCountryComponent,
        OrderSetColorComponent,
        OrderSetSubproductionComponent,
        OrderQueueHistoryComponent,
        OrderProductSettingComponent,
        OrderQrcodeManageComponent,

        RepExclusiveUserComponent,

        UprofileComponent,
        UprofileMenuComponent,

        YarnComponent,
        YarnPlanComponent,
        YarnManageComponent,
        YarnPackingListComponent,
        YarnDashboardComponent,
        YarnCreateComponent,
        YarnSettingComponent,
        YarnStockCardComponent,
        YarnTransferComponent,
        YarnStockComponent,
        YarnReportComponent,

        TransportComponent,
        TspPackingCheckComponent,
        TspDashboardComponent,
        TspProductBoxComponent,
        TspSettingDestinationComponent,
        TspSettingTaggroupComponent,
        TspSettingLabeltagComponent,
        TspRegistLabeltagComponent,

        FinancialComponent,
        SetCostStyleSubnodeComponent,
        UcScannedSubnodeComponent,
        UcFinanceSettingComponent,

        HrComponent,
        HrStaffRegistComponent,

    ]
})
export class UcompanyModule { }
