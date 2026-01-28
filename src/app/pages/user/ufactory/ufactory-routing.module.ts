import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from 'src/app/auth/auth.guard';

import { UfactoryComponent } from './ufactory.component';
import { UfSettingComponent } from './uf-setting/uf-setting.component';
import { UfUserComponent } from './uf-user/uf-user.component';
import { UfactoryDashboardComponent } from './ufactory-dashboard/ufactory-dashboard.component';
import { UfDashboard1Component } from './ufactory-dashboard/uf-dashboard1/uf-dashboard1.component';
import { UfDashboard2Component } from './ufactory-dashboard/uf-dashboard2/uf-dashboard2.component';
// import { ProductComponent } from './product/product.component';
// import { ProductEditComponent } from './product/product-edit/product-edit.component';
// import { ProductCreateComponent } from './product/product-create/product-create.component';
// import { OrderComponent } from './order/order.component';
// import { OrderCreateComponent } from './order/order-create/order-create.component';
import { NodeStationComponent } from './node-station/node-station.component';
import { NodeListComponent } from './node-list/node-list.component';
import { NodeSubComponent } from './node-sub/node-sub.component';
import { NodeWorkflowComponent } from './node-workflow/node-workflow.component';
import { NodePickComponent } from './node-pick/node-pick.component';
import { ProductionLineCreateComponent } from './production-line-create/production-line-create.component';



@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: UfactoryComponent, canActivate: [AuthGuard]},
        { path: 'setting', canActivate: [AuthGuard],
            children: [
                { path: '', component: UfSettingComponent },
                { path: 'user', component: UfUserComponent },
                { path: 'set2', component: UfDashboard2Component },
            ]
        },
        { path: 'dashboard', canActivate: [AuthGuard],
            children: [
                { path: '', component: UfactoryDashboardComponent },
                { path: 'db1', component: UfDashboard1Component },
                { path: 'db2', component: UfDashboard2Component },
            ]
        },
        // { path: 'product',
        //     children: [
        //         { path: '', component: ProductComponent },
        //         { path: 'edit', component: ProductEditComponent },
        //     ]
        // },
        // { path: 'order',
        //     children: [
        //         { path: '', component: OrderComponent },
        //         { path: 'create', component: OrderCreateComponent },
        //     ]
        // },
        { path: 'station', canActivate: [AuthGuard],
            children: [
                { path: '', component: NodeStationComponent },
                { path: 'list', component: NodeListComponent },
                { path: 'nodepick', component: NodePickComponent },
                { path: 'workflow', component: NodeWorkflowComponent },
                { path: 'sub', component: NodeSubComponent },
                { path: 'productionline/create', component: ProductionLineCreateComponent },
            ]
        },


    ])],
    exports: [RouterModule]
})
export class UFactoryRoutingModule { }
