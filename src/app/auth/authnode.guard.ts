import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree,
} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap, take } from 'rxjs/operators';

import { UserService } from '../services/user.service';
// import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthNodeGuard implements CanActivate {
    constructor(
        // private authService: AuthService,
        private router: Router,
        private userService: UserService,
        ) {}

    // canActivate(
    //     route: ActivatedRouteSnapshot,
    //     router: RouterStateSnapshot
    // ):
    //     | boolean
    //     | UrlTree
    //     | Promise<boolean | UrlTree>
    //     | Observable<boolean | UrlTree> {

    //         // const isAuth = this.userService.getIsAuth();
    //         // if (!isAuth) {
    //         // this.router.navigate(['/login']);
    //         // }
    //         // return isAuth;

    //     // return this.authService.user.pipe(
    //     //     take(1),
    //     //     map((user) => {
    //     //         const isAuth = !!user;
    //     //         if (isAuth) {
    //     //             return true;
    //     //         }
    //     //         return this.router.createUrlTree(['/auth']);
    //     //     })

    //     // );
    // }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
      ): boolean | Observable<boolean> | Promise<boolean> {
        // this.userService.getMainSettingMainWebOpen('mainSetting');
        // const test = false;
        const isAuthNode = this.userService.getIsNodeAuth();
        if (!isAuthNode) {
          this.router.navigate(['/login']);
        }
        return isAuthNode;
      }
}
