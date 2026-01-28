import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// // ## multi language
// import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
// import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

import { ButtonModule } from 'primeng/button';
import {DialogModule} from 'primeng/dialog';

import {KeyFilterModule} from 'primeng/keyfilter';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import {DividerModule} from 'primeng/divider';
import {CarouselModule} from 'primeng/carousel';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';


// // ## multi language
// // AoT requires an exported function for factories
// export function createTranslateLoader(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

@NgModule({
    imports: [
        CommonModule,
        LoginRoutingModule,

        // // ## multi language
        // TranslateModule.forChild({
        //     loader: { provide: TranslateLoader, useFactory: createTranslateLoader, deps: [HttpClient] },
        //     isolate: true
        // }),


        ButtonModule,
        DialogModule,
        KeyFilterModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        PasswordModule,
        DividerModule,
        CarouselModule,
        RippleModule,
        MenuModule
    ],
    declarations: [LoginComponent]
})
export class LoginModule { }
