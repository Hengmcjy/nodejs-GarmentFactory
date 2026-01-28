/* eslint-disable @typescript-eslint/quotes */
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from "@angular/common/http";
import { catchError } from "rxjs/operators";
// import { throwError } from "rxjs";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";

import { UserService } from "./user.service";
import { ModeRes } from "../models/app.model";
// import { MatDialog } from "@angular/material";
// import {MatDialog} from '@angular/material/dialog';

// import { ErrorComponent } from "./error/error.component";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private userService: UserService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // console.log(error.error.message);
        // let errorMessage: ModeRes = {messageID: '0', mode:'all', value: "An unknown error occurred!"};

        // if (error.error.message) {
        //   errorMessage = error.error.message;
        //   this.userService.errorStatusListener.next(errorMessage);
        // }

        // // console.log(errorMessage);
        // if (errorMessage.mode === 'errsignup') {
        //   this.userService.sendSignupStatusListener(false);
        // }

        this.userService.errorStatusListener.next(error.error.message);

        return throwError(error);
      })
    );
  }
}
