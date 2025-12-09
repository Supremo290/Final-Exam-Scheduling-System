import { Component, OnInit } from '@angular/core';
import { GlobalService } from './../../global.service';
import { ApiService } from './../../api.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Inject} from '@angular/core';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
	pword=''
	npword=''
	cpword=''
  constructor(public dialog: MatDialog,public dialogRef: MatDialogRef<ChangePasswordComponent>,@Inject(MAT_DIALOG_DATA) public data: any,private global: GlobalService,private api: ApiService,) { }

  ngOnInit() {
  }
  onNoClickclose(): void {
       this.dialogRef.close(undefined);
  }

  submit3(){
    this.global.swalLoading('');
      var x='';
      if (this.pword==''||this.npword==""||this.cpword=='') {
         x = x+"*All Fields are required!<br>";
      }
      if (this.npword != this.cpword) {
         x = x+"*New password and confirm password does no match!<br>";
      }
      if (this.npword.length < 6) {
         x = x+"*New Password must be at least 6 Characters!<br>";
      }
      
      if (x=='') { 
        this.global.swalLoading('');
        this.api.putAccountChangePassword({
          "oldPassword": this.pword,
    		  "newPassword": this.npword,
    		  "newPasswordConfirm": this.cpword
        })
	          .map(response => response.json())
	          .subscribe(res => {
	            if (res.message=='Password has been successfully changed.') {
	            	this.global.swalSuccess(res.message);
						    this.dialogRef.close(undefined);
	            }else
						this.global.swalAlert(res.message,'','warning')
	          },Error=>{
	            this.global.swalAlertError(Error);
	          });
      }else{
      	this.global.swalAlert('Alert!',x,'warning')
      }
  }
}
