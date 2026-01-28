import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UcompanyComponent } from './ucompany.component';
import { UcompanyDashboardComponent } from './ucompany-dashboard/ucompany-dashboard.component';
import { UcSettingComponent } from './uc-setting/uc-setting.component';
import { UcMemberComponent } from './uc-member/uc-member.component';
import { UprofileComponent } from '../uprofile/uprofile.component';
import { UcCustomerComponent } from './uc-customer/uc-customer.component';
import { ProductComponent } from '../ufactory/product/product.component';
import { ProductEditComponent } from '../ufactory/product/product-edit/product-edit.component';
import { OrderComponent } from '../ufactory/order/order.component';
import { OrderCreateComponent } from '../ufactory/order/order-create/order-create.component';
import { OrderQueueCreateComponent } from './order/order-queue-create/order-queue-create.component';
import { OrderQueueListComponent } from './order/order-queue-list/order-queue-list.component';
import { OrderQueueHistoryComponent } from './order/order-queue-history/order-queue-history.component';
import { OrderQrcodeManageComponent } from './order/order-qrcode-manage/order-qrcode-manage.component';
import { ProductScanLoggingComponent } from './product/product-scan-logging/product-scan-logging.component';

import { YarnComponent } from './yarn/yarn.component';
import { YarnCreateComponent } from './yarn-create/yarn-create.component';
import { YarnSettingComponent } from './yarn-setting/yarn-setting.component';

import { TransportComponent } from './transport/transport.component';
import { TspProductBoxComponent } from './tsp-product-box/tsp-product-box.component';
import { TspSettingDestinationComponent } from './transport/tsp-setting-destination/tsp-setting-destination.component';
import { TspSettingTaggroupComponent } from './transport/tsp-setting-taggroup/tsp-setting-taggroup.component';
import { TspPackingCheckComponent } from './tsp-packing-check/tsp-packing-check.component';
import { TspSettingLabeltagComponent } from './transport/tsp-setting-labeltag/tsp-setting-labeltag.component';
import { TspRegistLabeltagComponent } from './transport/tsp-regist-labeltag/tsp-regist-labeltag.component';
import { TspDashboardComponent } from './tsp-dashboard/tsp-dashboard.component';

import { FinancialComponent } from './financial/financial.component';
import { SetCostStyleSubnodeComponent } from './financial/set-cost-style-subnode/set-cost-style-subnode.component';
// import { SAccSettngComponent } from 'src/app/shared/components/acc/s-acc-settng/s-acc-settng.component';
import { UcFinanceSettingComponent } from './financial/uc-finance-setting/uc-finance-setting.component';


import { HrComponent } from './hr/hr.component';
import { HrStaffRegistComponent } from './hr/hr-staff-regist/hr-staff-regist.component';

import { AuthGuard } from 'src/app/auth/auth.guard';
import { RepExclusiveUserComponent } from './rep-exclusive-user/rep-exclusive-user.component';
import { UcChangePassComponent } from './uc-change-pass/uc-change-pass.component';
import { UcScannedSubnodeComponent } from './financial/uc-scanned-subnode/uc-scanned-subnode.component';
import { SLabelQrcodeComponent } from 'src/app/shared/components/order/s-label-qrcode/s-label-qrcode.component';

import { YarnDashboardComponent } from './yarn-dashboard/yarn-dashboard.component';
import { YarnManageComponent } from './yarn-manage/yarn-manage.component';
import { YarnStockCardComponent } from './yarn-stock-card/yarn-stock-card.component';
import { YarnTransferComponent } from './yarn-transfer/yarn-transfer.component';
// import { YarnPackingListComponent } from './yarn-packing-list/yarn-packing-list.component';
import { YarnStockComponent } from './yarn-stock/yarn-stock.component';
import { YarnPlanComponent } from './yarn-plan/yarn-plan.component';
import { YarnReportComponent } from './yarn-report/yarn-report.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: UcompanyComponent, canActivate: [AuthGuard] },
        { path: 'uprofile', component: UprofileComponent, canActivate: [AuthGuard] },
        { path: 'setting', canActivate: [AuthGuard],
            children: [
                { path: '', component: UcSettingComponent },
                { path: 'member', component: UcMemberComponent },
                { path: 'customer', component: UcCustomerComponent },
            ]
        },
        { path: 'dashboard', canActivate: [AuthGuard],
            children: [
                { path: '', component: UcompanyDashboardComponent },
                // { path: 'db1', component: UfDashboard1Component },
                // { path: 'db2', component: UfDashboard2Component },
            ]
        },
        { path: 'product', canActivate: [AuthGuard],
            children: [
                { path: '', component: ProductComponent },
                { path: 'edit', component: ProductEditComponent },
                { path: 'scan', component: ProductScanLoggingComponent },
            ]
        },
        { path: 'order', canActivate: [AuthGuard],
            children: [
                { path: '', component: OrderComponent },
                { path: 'create', component: OrderCreateComponent },
                { path: 'edit', component: OrderCreateComponent },

                { path: 'queue/create', component: OrderQueueCreateComponent },
                { path: 'queue/list', component: OrderQueueListComponent },
                { path: 'queue/history', component: OrderQueueHistoryComponent },

                { path: 'qrcode/manage', component: OrderQrcodeManageComponent },
                { path: 'qrcode/staff', component: SLabelQrcodeComponent },

            ]
        },

        { path: 'yarn', canActivate: [AuthGuard],
            children: [
                { path: '', component: YarnPlanComponent },
                { path: 'dashboard', component: YarnDashboardComponent },
                { path: 'stockcard', component: YarnStockCardComponent },
                { path: 'create', component: YarnCreateComponent },
                { path: 'edit', component: YarnCreateComponent },
                { path: 'setting', component: YarnSettingComponent },
                { path: 'report', component: YarnReportComponent },
                { path: 'manage/plan', component: YarnPlanComponent },
                { path: 'manage/create/plan', component: YarnManageComponent },
                { path: 'manage/receive/actual', component: YarnManageComponent },
                // { path: 'manage/packinglist', component: YarnPackingListComponent },
                // { path: 'manage/checking/packinglist', component: YarnPackingListComponent },
                { path: 'manage/transfer', component: YarnTransferComponent },
                { path: 'manage/stock', component: YarnStockComponent },
                // { path: 'queue/history', component: OrderQueueHistoryComponent },
            ]
        },

        { path: 'transport', canActivate: [AuthGuard],
            children: [
                { path: '', component: TspDashboardComponent },
                { path: 'manage', component: TransportComponent },
                { path: 'managec/checking', component: TspPackingCheckComponent },
                { path: 'productbox', component: TspProductBoxComponent },
                { path: 'setting/destination', component: TspSettingDestinationComponent },
                { path: 'setting/taggroup', component: TspSettingTaggroupComponent },
                { path: 'setting/labeltag', component: TspSettingLabeltagComponent },
                { path: 'regist/labeltagregist', component: TspRegistLabeltagComponent },
            ]
        },


        { path: 'financial', canActivate: [AuthGuard],
            children: [
                { path: '', component: FinancialComponent },
                { path: 'set/cost/style/subnode', component: SetCostStyleSubnodeComponent },
                { path: 'scanned/subnode', component: UcScannedSubnodeComponent },
                { path: 'setting/setting', component: UcFinanceSettingComponent },
                // ['/user/ucompany/financial/scanned/subnode']
                // { path: 'edit', component: YarnCreateComponent },
                // { path: 'queue/create', component: OrderQueueCreateComponent },
                // { path: 'queue/list', component: OrderQueueListComponent },
                // { path: 'queue/history', component: OrderQueueHistoryComponent },
            ]
        },

        { path: 'hr', canActivate: [AuthGuard],
            children: [
                { path: '', component: HrComponent },
                { path: 'regist/staff', component: HrStaffRegistComponent },
                { path: 'edit/staff', component: HrStaffRegistComponent },
                // { path: 'edit', component: YarnCreateComponent },
                // { path: 'queue/create', component: OrderQueueCreateComponent },
                // { path: 'queue/list', component: OrderQueueListComponent },
                // { path: 'queue/history', component: OrderQueueHistoryComponent },
            ]
        },

        { path: 'rep', canActivate: [AuthGuard],
            children: [
                { path: 'exclusive', component: RepExclusiveUserComponent },
                { path: 'exclusive/password', component: UcChangePassComponent },
                // { path: 'regist/staff', component: HrStaffRegistComponent },
                // { path: 'edit/staff', component: HrStaffRegistComponent },
                // { path: 'edit', component: YarnCreateComponent },
                // { path: 'queue/create', component: OrderQueueCreateComponent },
                // { path: 'queue/list', component: OrderQueueListComponent },
                // { path: 'queue/history', component: OrderQueueHistoryComponent },
            ]
        },
    ])],
    exports: [RouterModule]
})
export class UCompanyRoutingModule { }

// UprofileComponent  uprofile   RepExclusiveUserComponent

