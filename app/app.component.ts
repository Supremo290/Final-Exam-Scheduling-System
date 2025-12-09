import { Component } from '@angular/core';
import {Router} from "@angular/router";
import { GlobalService } from './global.service';
import { CookieService } from 'ngx-cookie-service';
import { AfterViewInit, ElementRef, } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from './../environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'usl-erp';
  routerlink = "login";
	public data:any

  warning = ''
  constructor(
    private api: ApiService,
    private elRef:ElementRef,
    public cookieService: CookieService,
    public global: GlobalService,
    private router: Router){
    setTimeout(console.log.bind(console, '%cStop!', 'color: red;font-size:75px;font-weight:bold;-webkit-text-stroke: 1px black;'), 0);
    setTimeout(console.log.bind(console, '%cThis is a browser feature intended for developers.', 'color: black;font-size:20px;'), 0);

    if(environment.production){
      console.warn(`🚨 Console output is disabled on production!`);
      console.log = function():void{};
      console.debug = function():void{};
      console.warn = function():void{};
      console.info = function():void{};
    }

    if (cookieService.get('domain')!='') {
      this.global.sysetting(this.cookieService.get('domain'),this.cookieService.get('year'))
    }
  	if (this.global.getSession()==null) {
	  	this.router.navigate(['login']);
  	}

    if (this.global.api == 'http://192.168.0.53/api/'||this.global.api == 'http://api.usl.edu.ph/api/'||this.global.api == 'https://api.usl.edu.ph/api/') {
      this.warning = "You are now accessing the live database server";
    }else
      this.warning = "You are accessing the test database server";
  }
  ngOnInit(){
  
  }
 
  logout(){
  	this.global.logout();
  }
  ngAfterViewInit() {
     let loader = this.elRef.nativeElement.querySelector('#loader');
     //loader.style.display = "none"; //hide loader
     document.getElementById("loader").style.display = "none";
  }
}
