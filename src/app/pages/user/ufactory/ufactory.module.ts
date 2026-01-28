import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { BrowserModule } from '@angular/platform-browser';


// // ## multi language
// import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
// import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { UfactoryComponent } from './ufactory.component';
import { UFactoryRoutingModule } from './ufactory-routing.module';

import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {DialogModule} from 'primeng/dialog';
import {ToastModule} from 'primeng/toast';
import {MegaMenuModule} from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import {CheckboxModule} from 'primeng/checkbox';
import {InputNumberModule} from 'primeng/inputnumber';
import {CalendarModule} from 'primeng/calendar';
import {BadgeModule} from 'primeng/badge';
import {TableModule} from 'primeng/table';
import {RatingModule} from 'primeng/rating';
import {DividerModule} from 'primeng/divider';
import {AccordionModule} from 'primeng/accordion';
import {SliderModule} from 'primeng/slider';
import {GalleriaModule} from 'primeng/galleria';
import {ListboxModule} from 'primeng/listbox';
import {CardModule} from 'primeng/card';
import {OrderListModule} from 'primeng/orderlist';
import {PickListModule} from 'primeng/picklist';
import {RadioButtonModule} from 'primeng/radiobutton';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {ChartModule} from 'primeng/chart';
import {ProgressBarModule} from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import {InputSwitchModule} from 'primeng/inputswitch';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {TabViewModule} from 'primeng/tabview';
import {PaginatorModule} from 'primeng/paginator';
import {BlockUIModule} from 'primeng/blockui';


// import { NoSpaceDirective } from 'src/app/directives/no-space.directive';
import { SharedModule } from 'src/app/shared/shared.module';

import { UfSettingComponent } from './uf-setting/uf-setting.component';
import { UfUserComponent } from './uf-user/uf-user.component';
import { UfUserEditComponent } from './uf-user-edit/uf-user-edit.component';
import { UfactoryDashboardComponent } from './ufactory-dashboard/ufactory-dashboard.component';
import { UfactoryDashboardMenuComponent } from './ufactory-dashboard/ufactory-dashboard-menu/ufactory-dashboard-menu.component';
import { UfDashboard1Component } from './ufactory-dashboard/uf-dashboard1/uf-dashboard1.component';
import { UfDashboard2Component } from './ufactory-dashboard/uf-dashboard2/uf-dashboard2.component';

// import { ProductCreateComponent } from './product/product-create/product-create.component';
// import { ProductComponent } from './product/product.component';
// import { ProductEditComponent } from './product/product-edit/product-edit.component';

// import { OrderComponent } from './order/order.component';
// import { OrderCreateComponent } from './order/order-create/order-create.component';
import { NodeStationComponent } from './node-station/node-station.component';
import { NodeListComponent } from './node-list/node-list.component';
import { NodeSubComponent } from './node-sub/node-sub.component';
import { NodeCreateComponent } from './node-create/node-create.component';
import { NodeEditComponent } from './node-edit/node-edit.component';
import { NodeWorkflowComponent } from './node-workflow/node-workflow.component';
import { NodePickComponent } from './node-pick/node-pick.component';

import { ProductionLineCreateComponent } from './production-line-create/production-line-create.component';



// // ## multi language
// // AoT requires an exported function for factories
// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        // BrowserAnimationsModule,
        // BrowserModule,
        SharedModule,
        UFactoryRoutingModule,

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
        CheckboxModule,
        InputNumberModule,
        CalendarModule,
        BadgeModule,
        TableModule,
        RatingModule,
        DividerModule,
        AccordionModule,
        SliderModule,
        GalleriaModule,
        ListboxModule,
        CardModule,
        OrderListModule,
        PickListModule,
        RadioButtonModule,
        InputTextModule,
        InputTextareaModule,
        ChartModule,
        ProgressBarModule,
        TagModule,
        InputSwitchModule,
        ConfirmPopupModule,
        TabViewModule,
        PaginatorModule,
        BlockUIModule,

    ],
    declarations: [
        // NoSpaceDirective,
        UfactoryComponent,
        UfSettingComponent,
        UfUserComponent,
        UfUserEditComponent,
        UfactoryDashboardComponent,
        UfactoryDashboardMenuComponent,
        UfDashboard1Component,
        UfDashboard2Component,
        // ProductCreateComponent,
        // ProductComponent,
        // ProductEditComponent,
        // OrderComponent,
        // OrderCreateComponent,
        NodeStationComponent,
        NodeSubComponent,
        NodeListComponent,
        NodeCreateComponent,
        NodeEditComponent,
        NodeWorkflowComponent,
        NodePickComponent,

        ProductionLineCreateComponent,

    ]
})
export class UfactoryModule { }
