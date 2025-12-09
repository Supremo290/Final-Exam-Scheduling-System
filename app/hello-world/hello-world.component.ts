import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { GlobalService } from '../global.service';
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.scss']
})
export class HelloWorldComponent implements OnInit {

  selectedProvince = ''
  selectedTownCity = '' 
  selectedBarangays = ''

  provinces
  townsCities
  barangays

  fullAddress = ''


  constructor(
    public api: ApiService,
    public global: GlobalService
  ) { }

  ngOnInit() {
    this.getProvinces()
  }


  getProvinces() {
    this.api.getProvinces()
    .map(response => response.json())
      .subscribe(res => {
      this.provinces = res;
      console.log(res);
      this.updateFullAddress()
    },Error => {
      this.global.swalAlertError(Error);
  });
}

 getTownsCities(p) {
    this.selectedProvince = p
    this.api.getTownsCities(p)
    .map(response => response.json())
      .subscribe(res => {
      this.townsCities = res;
      console.log(res);
      this.updateFullAddress()
    },Error => {
      this.global.swalAlertError(Error);
  });
}


 getBarangays(p,t) {
    this.api.getBarangays(p, t)
    .map(response => response.json())
      .subscribe(res => {
      this.barangays = res;
      console.log(res);
      this.updateFullAddress()
    },Error => {
      this.global.swalAlertError(Error);
  });
}


updateFullAddress() {
  if(this.selectedProvince && this.selectedTownCity && this.selectedBarangays) {
    this.fullAddress = this.selectedProvince + ', ' + this.selectedTownCity + ', ' + this.selectedBarangays;
  } else {
    this.fullAddress = '';
  }
}

}
