import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
// import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { NotfoundComponent } from './pages/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";

import { LoginComponent } from './pages/components/auth/login/login.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            // {path:'', component: LoginComponent},
            // {path:'login', component: LoginComponent},
            // {path:'confirmlink/:confirmlink', component: LoginComponent },
            // {
            //     path: 'user', component: AppLayoutComponent,
            //     children: [
            //         { path: '', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
            //         { path: 'uikit', loadChildren: () => import('./demo/components/uikit/uikit.module').then(m => m.UIkitModule) },
            //         { path: 'utilities', loadChildren: () => import('./demo/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
            //         { path: 'documentation', loadChildren: () => import('./demo/components/documentation/documentation.module').then(m => m.DocumentationModule) },
            //         { path: 'blocks', loadChildren: () => import('./demo/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
            //         { path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then(m => m.PagesModule) }

            //         // { path: 'pages', loadChildren: () => import('./pages/components/pages/pages.module').then(m => m.PagesModule) },
            //         // { path: 'ucompany', loadChildren: () => import('./pages/user/ucompany/ucompany.module').then(m => m.UcompanyModule) },
            //         // { path: 'ufactory', loadChildren: () => import('./pages/user/ufactory/ufactory.module').then(m => m.UfactoryModule) },
            //     ]

            // },
            // { path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then(m => m.AuthModule) },
            // { path: 'landing', loadChildren: () => import('./demo/components/landing/landing.module').then(m => m.LandingModule) },
            // { path: 'notfound', component: NotfoundComponent },
            // { path: '**', redirectTo: '/notfound' },

            {path:'', component: LoginComponent},
            {path:'login', component: LoginComponent},
            {path:'confirmlink/:confirmlink', component: LoginComponent },
            {
                path: 'user', component: AppLayoutComponent,
                children: [
                    { path: '', loadChildren: () => import('./pages/components/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    { path: 'uikit', loadChildren: () => import('./pages/components/uikit/uikit.module').then(m => m.UIkitModule) },
                    { path: 'utilities', loadChildren: () => import('./pages/components/utilities/utilities.module').then(m => m.UtilitiesModule) },
                    { path: 'documentation', loadChildren: () => import('./pages/components/documentation/documentation.module').then(m => m.DocumentationModule) },
                    { path: 'blocks', loadChildren: () => import('./pages/components/primeblocks/primeblocks.module').then(m => m.PrimeBlocksModule) },
                    { path: 'pages', loadChildren: () => import('./pages/components/pages/pages.module').then(m => m.PagesModule) },

                    { path: 'ucompany', loadChildren: () => import('./pages/user/ucompany/ucompany.module').then(m => m.UcompanyModule) },
                    { path: 'ufactory', loadChildren: () => import('./pages/user/ufactory/ufactory.module').then(m => m.UfactoryModule) },
                    // { path: 'uprofile', loadChildren: () => import('./pages/user/uprofile/uprofile.module').then(m => m.UprofileModule) },
                ]
            },
            { path: 'general', loadChildren: () => import('./pages/general/general.module').then(m => m.GeneralModule) },
            { path: 'workstation', loadChildren:
                () => import('./pages/user/work-station-production/work-station-production.module')
                .then(m => m.WorkStationProductionModule) },
            { path: 'auth', loadChildren: () => import('./pages/components/auth/auth.module').then(m => m.AuthModule) },
            { path: 'landing', loadChildren: () => import('./pages/components/landing/landing.module').then(m => m.LandingModule) },
            { path: 'notfound', component: NotfoundComponent },
            { path: '**', redirectTo: '/notfound' },

        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
