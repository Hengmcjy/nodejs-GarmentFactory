/* eslint-disable @typescript-eslint/quotes */
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpHeaders,
    // HttpEvent,
    // HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
// import { map } from "rxjs";

import { UserService } from './user.service';
// import { environment } from '../../environments/environment';

// const BACKEND_AESP = environment.aesP;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private userService: UserService,
        private route: ActivatedRoute
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // console.log(req.url);

        const url = req.url;
        let result1 = -1;
        let result2 = -1;
        result1 = url.indexOf('ipify');
        result2 = url.indexOf('jsonip');
        // console.log('result1 : ' + result1);
        // console.log('result2 : ' + result2);



        const authToken = this.userService.getToken();
        let authRequest: any;
        if (result1 < 0 && result2 < 0) {
            // ## for connect nodejs
            authRequest = req.clone({
                headers: req.headers.set(
                    'Authorization',
                    'Bearer ' + authToken
                    + ' ' + this.userService.getUserIDEncrypt()
                    + ' ' + this.userService.getUUID5IDEncrypt()
                    + ' ' + this.userService.getIsNodeAuthText()
                ),
            });
            // authRequest = req.clone({headers: req.headers.set("Content-Type", "application/json")});
        } else {
            // ## for get ip for http://api.ipify.org/?format=json
            authRequest = req.clone({
                headers: req.headers.set('Content-Type', 'text/plain'),
                // .set("Accept", "text/plain")
            });
        }
        return next.handle(authRequest);
    }
}
