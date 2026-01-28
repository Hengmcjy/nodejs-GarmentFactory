import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-node-chart',
  templateUrl: './node-chart.component.html',
  styleUrls: ['./node-chart.component.scss']
})
export class NodeChartComponent implements OnInit {

    test: any[] = [];

    basicData: any;
    data: any;
    data2: any;
    dataPolarArea: any;
    stackedData: any;

    stackedOptions: any;
    chartPolarOptions: any;
    chartOptions:any;
    basicOptions:any;

  constructor() { }

  ngOnInit(): void {
    this.test = [
        {a: 'aaaaa', b: 'ok', c: 1},
        {a: 'bbbbb', b: 'wait', c: 2},
        {a: 'ccccc', b: 'error', c: 3},
        {a: 'ddddd', b: 'ok', c: 4},
        {a: 'eeeee', b: 'ok', c: 5},
        {a: 'fffff', b: 'ok', c: 6},
        // {a: 'ggggg', b: 'wait', c: 7},
        // {a: 'hhhhh', b: 'ok', c: 8},
        // {a: 'iiiii', b: 'ok', c: 9},
        // {a: 'jjjjj', b: 'wait', c: 10},
        // {a: 'kkkkk', b: 'ok', c: 11},
        // {a: 'lllll', b: 'error', c: 12},
    ];

    this.basicData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'First Dataset',
                data: [65, 59, 80, 80, 80, 55, 40],
                fill: false,
                borderColor: '#42A5F5',
                tension: .4
            },
            {
                label: 'Second Dataset',
                data: [28, 48, 40, 19, 86, 27, 90],
                fill: false,
                borderColor: '#FFA726',
                tension: .4
            }
        ]
    };

    this.data = {
        labels: ['Organic','Direct','Referral'],
        datasets: [
            {
                data: [51.596, 11.421, 3.862],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ],
                rotation: 270,    // ## make chart rotate c'
                circumference:  180 // ## make chart show half
            }
        ]
    };

    this.data2 = {
        labels: ['Organic','Direct','Referral'],
        datasets: [
            {
                data: [51.596, 11.421, 3.862],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ]
            }
        ]
    };

    this.stackedData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
            type: 'line',
            label: 'Dataset 4',
            borderColor: '#8B0000',
            borderWidth: 2,
            fill: false,
            data: [
                50,
                25,
                12,
                48,
                56,
                76,
                42
            ]
        }, {
            type: 'bar',
            label: 'Dataset 1',
            backgroundColor: '#42A5F5',
            data: [
                50,
                25,
                12,
                48,
                90,
                76,
                42
            ]
        }, {
            type: 'bar',
            label: 'Dataset 2',
            backgroundColor: '#66BB6A',
            data: [
                21,
                84,
                24,
                75,
                37,
                65,
                34
            ]
        }, {
            type: 'bar',
            label: 'Dataset 3',
            backgroundColor: '#FFA726',
            data: [
                41,
                52,
                24,
                74,
                23,
                21,
                32
            ]
        }, ]
    };

    this.stackedOptions = {

        responsive: true,
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    };

    this.dataPolarArea = {
        datasets: [{
            data: [
                11,
                16,
                7,
                3,
                14
            ],
            backgroundColor: [
                "#42A5F5",
                "#66BB6A",
                "#FFA726",
                "#26C6DA",
                "#7E57C2"
            ],
            label: 'My dataset'
        }],
        labels: [
            "Red",
            "Green",
            "Yellow",
            "Grey",
            "Blue"
        ]
    };
  }

}
