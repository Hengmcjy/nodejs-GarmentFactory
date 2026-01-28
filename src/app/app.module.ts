import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS} from '@angular/common/http';

import { ExportAsModule } from 'ngx-export-as';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
// import { NotfoundComponent } from './demo/components/notfound/notfound.component';

import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';

import { NotfoundComponent } from './pages/components/notfound/notfound.component';
import { SharedModule } from './shared/shared.module';

import { ToastModule } from 'primeng/toast';
import { AuthInterceptor } from './services/auth-interceptor';
import { ErrorInterceptor } from './services/error-interceptor';

@NgModule({
    declarations: [
        AppComponent,
        NotfoundComponent
    ],
    imports: [
        ExportAsModule,
        AppRoutingModule,
        AppLayoutModule,

        SharedModule,


        ToastModule,


    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService

        // { provide: LocationStrategy, useClass: HashLocationStrategy },
        // CountryService, CustomerService, EventService, IconService, NodeService,
        // PhotoService, ProductService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
