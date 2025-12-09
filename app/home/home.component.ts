  import { Component, OnInit, ViewChild } from '@angular/core';
  import { GlobalService } from './../global.service';
  import {Http, Headers, RequestOptions} from '@angular/http';
  //import { Chart } from 'chart.js';


  @Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
  })
  export class HomeComponent implements OnInit {
    
    LineChart=[];
    BarChart=[];
    PieChart=[];


    constructor(private http: Http,public global: GlobalService) {

     }

    ngOnInit() {

    }

  }
