import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// // ## multi language
// import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
// import {TranslateHttpLoader} from '@ngx-translate/http-loader';
// import { HttpClient } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {DialogModule} from 'primeng/dialog';
import {ToastModule} from 'primeng/toast';
import {MegaMenuModule} from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
// import {SidebarModule} from 'primeng/sidebar';

import { SharedModule } from 'src/app/shared/shared.module';

import { WorkStationProductionComponent } from './work-station-production.component';
import { WorkStationProductRoutingModule } from './work-station-product-routing.module';


// // ## multi language
// // AoT requires an exported function for factories
// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

@NgModule({
  declarations: [
    WorkStationProductionComponent
  ],
  imports: [
    CommonModule,
    // BrowserModule,
    // BrowserAnimationsModule,
    SharedModule,
    WorkStationProductRoutingModule,

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
    // SidebarModule
  ]
})
export class WorkStationProductionModule { }
