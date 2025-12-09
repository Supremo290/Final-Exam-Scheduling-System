import { Component, OnInit,ViewChild } from '@angular/core';
import { GlobalService } from '../../../global.service';
import { ApiService } from '../../../api.service';
import Swal from 'sweetalert2';
const swal = Swal;
import * as XLSX from 'xlsx';
import { ExcelService } from '../../../services/excel.service';

type AOA = any[][];

@Component({
  selector: 'app-exam-schedule-uploader',
  templateUrl: './exam-schedule-uploader.component.html',
  styleUrls: ['./exam-schedule-uploader.component.scss']
})
export class ExamScheduleUploaderComponent implements OnInit {

  tableArr=null
  data: AOA = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';
  @ViewChild('uploadthis', { static: true }) uploadthis;

  constructor(private excelService:ExcelService,public global: GlobalService,private api: ApiService) { }

  firstdata=undefined
  datadisplay=undefined
  savetemp = false
  

  ngOnInit() {
    this.loadexam()
    console.log(this.global.syear);
    
  }

  loadexam(){

	this.savetemp=false
  this.firstdata=undefined
  this.datadisplay=undefined

  	this.api.getExaminationSchedule(this.global.syear,2)
      .map(response => response.json())
      .subscribe(res => {
        console.log(res.data);
        
        this.firstdata=res.data
      },Error=>{
        this.global.swalAlertError(Error);
      });
  }

  exportAsXLSX():void {
    var array= []
    for (var i = 0; i < this.firstdata.length; ++i) {
      array.push(
          {
            'Code': this.firstdata[i].codeNo,
            'Subject ID': this.firstdata[i].subjectId,
            'Descriptive Title': this.firstdata[i].title,
            'Day': new Date(this.firstdata[i].day),
            'Time': this.firstdata[i].time,
            'Room': this.firstdata[i].roomNumber,
          }
        )
      }
   this.excelService.exportAsExcelFile(array, 'ExamSchedule-list');
  }

  funcSave(){
    this.swalConfirm("You are about to replace the exam schedules","You won't be able to revert this!",'warning','Save','Exam schedules has been saved','','sy');
  }
  funcDelete(){
    this.swalConfirm("You are about to clear the exam schedules","You won't be able to revert this!",'warning','Clear','Exam schedules has been cleared','','del');
  }

  swalConfirm(title,text,type,button,d1,d2,remove)
  {
    swal.fire({
        title: title,
        text: text,
        type: type,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: button
      }).then((result) => {
        if (result.value) {
          if (remove=='sy') {
  		      this.global.swalLoading("Uploading Schedule...")
            this.api.deleteExaminationScheduleAll()
              .map(response => response.json())
              .subscribe(res => {
            		this.insertexamsched(0)
              },Error=>{
                //console.log(Error);
                this.global.swalAlertError(Error);
                console.log(Error)
              });
          }
          if (remove=='del') {
  		      this.global.swalLoading("")
          	this.api.deleteExaminationScheduleAll()
              .map(response => response.json())
              .subscribe(res => {
    				    this.global.swalSuccess(res.message)
  		  		    this.loadexam()
  		  		    this.savetemp=false
              },Error=>{
                this.global.swalAlertError(Error);
              });
          }
        }
      })
  }

  insertexamsched(length){
  	if (length<this.datadisplay.length) {
  		this.api.postExaminationSchedule({
				  "codeNo": this.datadisplay[length][0],
				  "date": this.datadisplay[length][3],
				  "time": this.datadisplay[length][4],
				  "roomNo": this.datadisplay[length][5],
				})
              .map(response => response.json())
              .subscribe(res => {
                this.insertexamsched(length+1)
              },Error=>{
                //console.log(Error);
                this.global.swalAlertError(Error);
                console.log(Error)
              });
  	}else{
  		this.loadexam()
  		this.savetemp=false
  		this.global.swalClose()
  		this.global.swalSuccess("Exam schedules uploaded!")
  	}
  }

}
