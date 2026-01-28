import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// // ## multi language
// import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
// import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import {KeyFilterModule} from 'primeng/keyfilter';
import { RippleModule } from 'primeng/ripple';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {DialogModule} from 'primeng/dialog';
import {ToastModule} from 'primeng/toast';

import { SharedModule } from 'src/app/shared/shared.module';
import { GeneralRoutingModule } from './general-routing.module';

import { SignupComponent } from './signup/signup.component';



// // ## multi language
// // AoT requires an exported function for factories
// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

@NgModule({
  declarations: [
    SignupComponent
  ],
  imports: [
    CommonModule,

    SharedModule,
    GeneralRoutingModule,

    // // ## multi language
    // TranslateModule.forChild({
    //     loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
    //     isolate: true
    // }),

    ButtonModule,
    KeyFilterModule,
    RippleModule,
    DynamicDialogModule,
    DialogModule,
    ToastModule,
  ]
})
export class GeneralModule { }
