import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// // ## multi language
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { HttpClient } from '@angular/common/http';

import { UProfileRoutingModule } from './uprofile-routing.module';

// import { UprofileComponent } from './uprofile.component';
// import { UprofileMenuComponent } from './uprofile-menu/uprofile-menu.component';

import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
// import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { ChipsModule } from 'primeng/chips';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import {DividerModule} from 'primeng/divider';

import { SharedModule } from 'src/app/shared/shared.module';

// // ## multi language
// // AoT requires an exported function for factories
// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        SharedModule,
        UProfileRoutingModule,

        // // ## multi language
        // TranslateModule.forChild({
        //     loader: {
        //         provide: TranslateLoader,
        //         useFactory: createTranslateLoader,
        //         deps: [HttpClient],
        //     },
        //     isolate: true,
        // }),

        ButtonModule,
        RippleModule,
        // DynamicDialogModule,
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
        DividerModule
    ],
})
export class UprofileModule {}
