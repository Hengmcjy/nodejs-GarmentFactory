import { Component } from '@angular/core';

@Component({
  selector: 'app-s-rep-outs-date',
  templateUrl: './s-rep-outs-date.component.html',
  styleUrls: ['./s-rep-outs-date.component.scss']
})
export class SRepOutsDateComponent {
    formActive = 'repOutSourceDate';
    pageActive = this.formActive;
    formName = this.formActive;

    // blockedPanel: boolean = false;
    // seasonYear = '';

    // reportHeader = 'Outsource Date';
}
