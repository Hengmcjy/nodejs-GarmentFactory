import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

import { NodeStationService } from 'src/app/services/node-station.service';
import { UserService } from 'src/app/services/user.service';
import { Company, Factory } from './../../../../models/app.model';
import { User } from 'src/app/models/user.model';
import { NodeStation, UserNode } from 'src/app/models/workstation.model';
import { GBC } from 'src/app/global/const-global';

@Component({
    selector: 'app-node-edit',
    templateUrl: './node-edit.component.html',
    styleUrls: ['./node-edit.component.scss'],
    providers: [MessageService],
})
export class NodeEditComponent implements OnInit, OnDestroy {
    @Input() nodeStation: NodeStation = GBC.clrNodeStation();

    indexTab = 0;

    company: Company = GBC.clrCompany();
    factory: Factory = GBC.clrFactory();
    user: User = GBC.clrUser();
    userNodeID = '';
    stationNoMax = 6;

    userNode: UserNode[] = [];
    userNodeEmpty: UserNode = GBC.emptyUserNode();

    nodeStationPageLimit = 0;
    errID = '';
    mode = '';

    fieldSelect: any = {
        nodeStation: GBC.clrNodeStation(),
        field: '',
        i: -1
    };

    statusList: any[] = [];
    statusItems: MenuItem[] = [];
    nodeTypeList: any[] = [];
    nodeTypeItems: MenuItem[] = [];
    // haveSubWorkflowSelected: boolean = false;
    haveSubWorkflowItems: MenuItem[] = [
        {
            visible: true,
            label: 'No',
            command: () => {
                return false;
            },
        },
        {
            visible: true,
            label: 'Yes',
            command: () => {
                return true;
            },
        },
    ];
    mustBundleScanItems: MenuItem[] = [
        {
            visible: true,
            label: 'No',
            command: () => {
                return false;
            },
        },
        {
            visible: true,
            label: 'Yes',
            command: () => {
                return true;
            },
        },
    ];
    canScanNodeScanItems: MenuItem[] = [
        {
            visible: true,
            label: 'No',
            command: () => {
                // console.log('no');
                this.nodeStation.userNode[this.fieldSelect.i].canScanNode = false;
                return false;
            },
        },
        {
            visible: true,
            label: 'Yes',
            command: () => {
                // console.log('yes');
                this.nodeStation.userNode[this.fieldSelect.i].canScanNode = true;
                return true;
            },
        },
    ];
    canScanSubNodeScanItems: MenuItem[] = [
        {
            visible: true,
            label: 'No',
            command: () => {
                this.nodeStation.userNode[this.fieldSelect.i].canScanSubNode = false;
                return false;
            },
        },
        {
            visible: true,
            label: 'Yes',
            command: () => {
                this.nodeStation.userNode[this.fieldSelect.i].canScanSubNode = true;
                return true;
            },
        },
    ];

    private editNodeSub: Subscription = new Subscription();
    private selectNodeSub: Subscription = new Subscription();
    private tabChangeSub: Subscription = new Subscription();
    private editNodeUserPassSub: Subscription = new Subscription();
    private CheckExistUserIDNodeSub: Subscription = new Subscription();

    constructor(
        public messageService: MessageService,

        public userService: UserService,
        public nsService: NodeStationService
    ) {}

    ngOnInit(): void {
        this.company = this.userService.getCompany();
        this.factory = this.userService.getFactory();
        this.user = this.userService.getUser();
        this.userNode = [...this.nodeStation.userNode];
        this.nodeStationPageLimit = this.nsService.nodeStationPageLimit;

        this.statusList = this.nsService.statusList;
        this.statusItems = this.nsService.statusItems;
        this.nodeTypeList = this.nsService.nodeTypeList;
        this.nodeTypeItems = this.nsService.nodeTypeItems;

        // console.log('data');
        this.errID = '';
        this.mode = '';
        this.getNodeStationsUpdatedListener();
        this.getSelectNodeStationUpdatedListener();
        this.getTabChangeListener();
        // console.log(this.nodeStation);
        this.userNode = [...this.nodeStation.userNode];
        this.expandUserNode();
        // console.log('data', this.nodeStation.userNode.userNodeID);
        // this.userNodeID = this.nodeStation.userNode.userNodeID;

        for (let statusItem of this.statusItems) {
            statusItem.command = () => {
                this.nodeStation.status = this.nsService.getNodeStatus(
                    statusItem.label + ''
                );
            };
        }
        for (let nodeTypeItem of this.nodeTypeItems) {
            nodeTypeItem.command = () => {
                this.nodeStation.nodeInfo.nodeType = nodeTypeItem.label + '';
            };
        }
        for (let haveSubWorkflowItem of this.haveSubWorkflowItems) {
            haveSubWorkflowItem.command = () => {
                this.nodeStation.nodeInfo.haveSubWorkflow =
                    '' + haveSubWorkflowItem.label === 'Yes' ? true : false;
            };
        }
        for (let mustBundleScanItem of this.mustBundleScanItems) {
            mustBundleScanItem.command = () => {
                this.nodeStation.nodeInfo.mustBundleScan =
                    '' + mustBundleScanItem.label === 'Yes' ? true : false;
            };
        }
    }

    selectCanScanNode(nodeStation: NodeStation, field: string, i: number) {
        // console.log(nodeStation, field, i);
        this.fieldSelect = {
            nodeStation: GBC.clrNodeStation(),
            field: '',
            i: -1
        };
        this.fieldSelect = {
            nodeStation: nodeStation,
            field: field,
            i: i
        };

    }

    manageUserNode() {
        // console.log(this.nodeStation.nStation.stationNo);
        // if (+this.nodeStation.nStation.stationNo === 0) {this.nodeStation.nStation.stationNo = 0;}
        if (this.nodeStation.nStation.stationNo > this.stationNoMax) {
            this.nodeStation.nStation.stationNo = this.stationNoMax;
        }
        // this.nodeStation.nStation.stationNo = this.nodeStation.nStation.stationNo;
    }

    async expandUserNode() {
        const nStation = +this.nodeStation.nStation.stationNo;
        for (let i = this.nodeStation.userNode.length; i < nStation; i++) {
            let userNOde = GBC.emptyUserNode();
            userNOde.stationID = 'station'+ (i+1);
            this.nodeStation.userNode.push(userNOde);

        }
        // for (let i = 1; i <= nStation; i++) {
        //     maskx = maskx + mask;
        // }

        // if (this.nodeStation.userNode.length <= nStation) {

        // } else {  // this.nodeStation.userNode.length > nStation

        // }



        // let i = 0;
        // for (const usrNode of this.userNode) {
        //     if (this.nodeStation.userNode.length > i) {
        //         this.nodeStation.userNode[i] = this.userNode[i];
        //     }
        //     i++;
        // }
        // console.log(this.nodeStation);
    }

    handleChange(e: any) {
        var index = e.index;
        // console.log(e);
        if (e.index === 1) {
            // console.log('e.index' , e.index);
            // console.log('this.indexTab' , this.indexTab);
            // this.indexTab = 0;
        }
    }

    getTabChangeListener() {
        if (this.tabChangeSub) {
            this.tabChangeSub.unsubscribe();
        }
        this.tabChangeSub = this.nsService
            .getTabChangeUpdatedListener()
            .subscribe((data) => {
                // this.indexTab = 0;  // ## set tab  alway when click tab
                // console.log('getTabChangeListening()');
            });
    }

    getSelectNodeStationUpdatedListener() {
        // return this.selectNodeStationUpdated.asObservable();
        if (this.selectNodeSub) {
            this.selectNodeSub.unsubscribe();
        }
        this.selectNodeSub = this.nsService
            .getSelectNodeStationUpdatedListener()
            .subscribe((data) => {
                // console.log(data);
                this.nodeStation = data.nodeStation;
                this.userNode = [...this.nodeStation.userNode];
                this.expandUserNode();
                // console.log(this.nodeStation);
                // this.userNodeID = this.nodeStation.userNode.userNodeID;
                this.errID = '';
                this.mode = '';
            });
    }

    getNodeStationsUpdatedListener() {
        if (this.editNodeSub) {
            this.editNodeSub.unsubscribe();
        }
        this.editNodeSub = this.nsService
            .getNodeStationsUpdatedListener()
            .subscribe((data) => {
                // this.product = data.product;
                // this.style = this.product.productCustomerCode.toUpperCase();
                // console.log(data);
                const nodeID = this.nodeStation.nodeID;

                if (this.nodeStation.nodeID !== '') {
                    this.nodeStation = data.nodeStations.filter(
                        (i) => i.nodeID === nodeID
                    )[0];
                    this.userNode = [...this.nodeStation.userNode];
                    this.expandUserNode();
                }

                if (data.success && this.mode === 'edit') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Node edit',
                        detail: 'completed',
                        sticky: false,
                    });
                } else if (!data.success) {
                    this.errID = data.message.messageID;
                    if (data.message.messageID === 'errns004') {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error [ ' + data.message.messageID + ' ]',
                            detail: 'edit Node error [ NodeID edit error ] ',
                            sticky: false,
                        });
                    }
                }
            });
    }

    async putNodeStationEdit() {
        this.mode = 'edit';
        // postNodeStationCreateNew(userID: string, userName: string, nodeStation: NodeStation,
        //                          status: string[], page: number, limit: number)
        this.errID = '';
        const status = ['a', 'c', 'd'];
        // let nodeStation: NodeStation = this.userService.clrNodeStation();
        // nodeStation.companyID = this.company.companyID;
        // nodeStation.factoryID = this.factory.factoryID;
        // nodeStation.nodeID = this.nodeStation.nodeID;

        // console.log(this.nodeStation);

        // ## check len of userNode   this.nodeStation.userNode.length
        if ( this.nodeStation.nStation.stationNo > this.userNode.length ) {
            await this.expandUserNode();
        } else if ( this.nodeStation.nStation.stationNo < this.userNode.length ) {
            // console.log('get n first element');
            const userNode = [...this.nodeStation.userNode];
            this.nodeStation.userNode = userNode.slice(0, this.nodeStation.nStation.stationNo);  // ## get n first element
        }

        // console.log(this.nodeStation);

        this.nsService.putNodeStationEdit(
            this.user.userID,
            this.user.uInfo.userName,
            this.nodeStation,
            status,
            1,
            this.nodeStationPageLimit
        );
    }

    putNodeUserPassStationEdit() {
        // putNodeUserPassStationEdit(nodeStation: NodeStation, status: string[])
        this.mode = 'edit';
        this.errID = '';
        const status = ['a', 'c', 'd'];

        // console.log(this.nodeStation);

        // this.nodeStation.userNode.userNodeID = this.userNodeID;
        this.nsService.putNodeUserPassStationEdit(this.nodeStation, status);
        // console.log(this.nodeStation);
        if (this.editNodeUserPassSub) { this.editNodeUserPassSub.unsubscribe(); }
        this.editNodeUserPassSub = this.nsService
            .getEditUserPassNodeStationUpdatedListener()
            .subscribe((data) => {
                if (data.success) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Node edit User & Pass',
                        detail: 'completed',
                        sticky: false,
                    });
                }
            });
    }

    getCheckExistNodeCompanyFactoryUserID(userNodeID: string) {
        // getCheckExistNodeCompanyFactoryUserID(companyID: string, factory: string, checkuserID: string)
        // console.log(this.company.companyID,
        //     this.factory.factoryID,
        //     this.nodeStation.nodeID,
        //     userNodeID);
        this.nsService.getCheckExistNodeCompanyFactoryUserID(
            this.company.companyID,
            this.factory.factoryID,
            this.nodeStation.nodeID,
            userNodeID
        );
        if (this.CheckExistUserIDNodeSub) {
            this.CheckExistUserIDNodeSub.unsubscribe();
        }
        this.CheckExistUserIDNodeSub = this.nsService
            .getCheckNodeUserIDExistedUpdatedListener()
            .subscribe((data) => {
                // console.log(data);
                if (data.isExist) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error UserID',
                        detail: 'userID Exist error [ userID for Node is Existed ] ',
                        sticky: false,
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'userID OK',
                        detail: 'completed, not exist',
                        sticky: false,
                    });
                }
            });
    }

    // numberOnly(event: any) {
    //     var charCode = event.which ? event.which : event.keyCode;
    //     // Only Numbers 0-9
    //     if (charCode < 48 || charCode > 57) {
    //         event.preventDefault();
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }

    ngOnDestroy(): void {
        if (this.editNodeSub) {
            this.editNodeSub.unsubscribe();
        }
        if (this.editNodeUserPassSub) {
            this.editNodeUserPassSub.unsubscribe();
        }
        if (this.selectNodeSub) {
            this.selectNodeSub.unsubscribe();
        }
        if (this.tabChangeSub) {
            this.tabChangeSub.unsubscribe();
        }
        if (this.CheckExistUserIDNodeSub) {
            this.CheckExistUserIDNodeSub.unsubscribe();
        }

        // if (this.langSub) { this.langSub.unsubscribe(); }
        // if (this.screenSub) { this.screenSub.unsubscribe(); }
    }
}
