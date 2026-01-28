import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SignupComponent } from './signup/signup.component';



@NgModule({
    imports: [RouterModule.forChild([
        { path: 'signup', component: SignupComponent },
        // { path: 'setting',
        //     children: [
        //         { path: '', component: UcSettingComponent },
        //         // { path: 'set1', component: UfDashboard1Component },
        //         // { path: 'set2', component: UfDashboard2Component },
        //     ]
        // },
    ])],
    exports: [RouterModule]
})
export class GeneralRoutingModule { }
