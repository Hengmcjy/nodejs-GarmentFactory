import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthNodeGuard } from 'src/app/auth/authnode.guard';

import { WorkStationProductionComponent } from './work-station-production.component';




@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: WorkStationProductionComponent, canActivate: [AuthNodeGuard]},
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
export class WorkStationProductRoutingModule { }
