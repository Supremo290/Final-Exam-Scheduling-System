import { Component, OnInit } from '@angular/core';
import { ApiService } from './../../../api.service';
import { GlobalService } from './../../../global.service';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-exam-schedule-manager',
  templateUrl: './exam-schedule-manager.component.html',
  styleUrls: ['./exam-schedule-manager.component.scss']
})
export class ExamScheduleManagerComponent implements OnInit {

  codes: any[] = []; 
  activeTerm
  inputSchoolYear: any;
  termOptions = [
    {key: 1, value: '1st Term'},
    {key: 2, value: '2nd Term'},
    {key: 3, value: 'Summer'},
  ];

  combinedOptions:
    {label: string, value: string} []=[]
  

  swal = Swal;

  constructor(
    public api: ApiService,
    public global: GlobalService
  ) {}

    ngOnInit() {
      this.combineYearTerm();
  }

    combineYearTerm() {
      const currentYear = new Date().getFullYear();
      for (let y = currentYear - 1; y <= currentYear + 1; y++) {
        const nextYear = y + 1;
        for (const t of this.termOptions) {
          const label = `${t.value} ${y}-${nextYear}`;
          const value = `${y}${nextYear.toString().slice(-2)}${t.key}`;
          this.combinedOptions.push({ label, value });
        }
    }
  }
    getCodeSummaryReport(sy){
        this.api.getCodeSummaryReport(sy)
          .map(response => response.json())
          .subscribe(res => {
          this.codes = res.data;
          console.log(this.codes);
          setTimeout(() => {
          Swal.close(); 
        }, 2000);
      },Error=>{
      this.global.swalAlertError(Error);
    });
  }
  
    loadSwal(){
      this.swal.fire({
            title: 'Loading',
            text: '',         
            type: 'info',
            allowOutsideClick: false,
            allowEscapeKey: false,
          onOpen: () => {
        Swal.showLoading(); // Show the loading spinner
        }
      });
    }

    generateCode(){
      if(!this.activeTerm){this.global.swalAlertError("Please select term");
        return;
      }
      this.loadSwal();
      this.getCodeSummaryReport(2024251); 
      console.log('Selected term-year value:', this.activeTerm); 
    }
    // yearchange1() {
    //   this.year2 = this.year1 + 1;
    //   this.updateSchoolYear();
    // }
    // yearchange2() {
    //   this.year1 = this.year2 - 1;
    //   this.updateSchoolYear(); 
    // }

    // updateSchoolYear(){
    //   if(this.year1 && this.year2){
    //     const sy2 = this.year2.toString().slice(-2);
    //     this.inputSchoolYear = this.year1 + sy2;
    //   }
    //   if(this.activeTerm){
    //     this.inputSchoolYear += this.activeTerm;
    //   }
    // }

}
  
  