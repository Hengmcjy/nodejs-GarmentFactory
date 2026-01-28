import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { UprofileComponent } from './uprofile.component';




@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: UprofileComponent },
        // { path: 'setting',
        //     children: [
        //         { path: '', component: UfSettingComponent },
        //         { path: 'set1', component: UfDashboard1Component },
        //         { path: 'set2', component: UfDashboard2Component },
        //     ]
        // },
        // { path: 'dashboard',
        //     children: [
        //         { path: '', component: UfactoryDashboardComponent },
        //         { path: 'db1', component: UfDashboard1Component },
        //         { path: 'db2', component: UfDashboard2Component },
        //     ]
        // },
        // { path: 'product',
        //     children: [
        //         { path: '', component: ProductComponent },
        //         { path: 'create', component: ProductCreateComponent },
        //     ]
        // },
        // { path: 'order',
        //     children: [
        //         { path: '', component: OrderComponent },
        //         { path: 'create', component: OrderCreateComponent },
        //     ]
        // },
        // { path: 'station',
        //     children: [
        //         { path: '', component: NodeStationComponent },
        //         // { path: 'create', component: OrderCreateComponent },
        //     ]
        // },


    ])],
    exports: [RouterModule]
})
export class UProfileRoutingModule { }
