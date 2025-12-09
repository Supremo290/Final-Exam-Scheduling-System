import { Inject, Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { Http, Headers, RequestOptions } from '@angular/http';
import { CookieService } from 'ngx-cookie-service';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
const swal = Swal;
@Injectable()

export class GlobalService {

   api = "https://apidev.usl.edu.ph/api/";//development server
   tokenID = "RPihnXCvK4b2pLRj"//dev token ID for Project Site

  //SignalR api
  //signalR_Api="http://localhost:50315/api/notify"; //localhost
  //signalR_Api = "https://apidev.usl.edu.ph/api/notify"; //dev

  header = new Headers();
  option: any;
  idseries = null
  domain = null;
  syear = null;
  displaysem = "";
  displayyear = "";
  idnumber = ''
  viewdomain = []
  access = []
  schoolyearsettings = null
  allsyoptions = null
  pass
  departments = []
  programlevels = []
  token: any;
  fullname = ''
  Fname = ''
  Mname = ''
  Lname = ''

  activeid = ''
  roles = []
  serverdate

  requisiteMessage = '';
  tempRequisites = '';
  HSClassSchedule = [];
  noHSClassSchedule = [];
  empDtrArray = []

  hrisId = ''

  // webview2 public accessible variable
  public webViewMessage = new Subject<any>();

  constructor(private cookieService: CookieService, @Inject(SESSION_STORAGE) private storage: WebStorageService, private router: Router, private http: Http) {
    if (this.storage.get('token') != null) {
      this.requestToken(this.storage.get('token'));
    }

    this.getPublicAPICurrentServerTime()
      .map(response => response.json())
      .subscribe(res => {
        var today: any = new Date(res.data);
        // var dd = String(today.getDate()-1).padStart(2, '0');
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        this.serverdate = today
      })

    if (this.storage.get('syear') != null) {
      this.domain = this.storage.get('domain');
      this.syear = this.storage.get('syear');
      var year = this.storage.get('displayyear');
      this.displayyear = "SY " + year.substring(0, 4) + "-" + year.substring(4, 8)
      this.displaysem = '';
      if (this.domain == 'COLLEGE' || this.domain == "GRADUATE SCHOOL") {
        if (year.substring(8, 9) == 1) {
          this.displaysem = "1st Semester";
        } else if (year.substring(8, 9) == 2) {
          this.displaysem = "2nd Semester";
        } else if (year.substring(8, 9) == 3) {
          this.displaysem = "Summer";
        } else {
          this.displaysem = "";
        }
      }
    }

    if (this.storage.get('idseries') != null) {
      this.idseries = this.storage.get('idseries');
    }

  }



  setidseries(idseries) {
    this.idseries = idseries;
    this.storage.set('idseries', idseries);
  }
  sysetting(domain, year) {
    this.domain = domain;
    this.syear = year.substring(0, 4) + year.substring(6, 9);
    this.storage.set('domain', domain);
    this.storage.set('syear', this.syear);
    this.storage.set('displayyear', year);
    localStorage.setItem('domain', this.domain);
    localStorage.setItem('sy', year);
    localStorage.setItem('idno', this.requestid());
    this.displayyear = "SY " + year.substring(0, 4) + "-" + year.substring(4, 8)
    if (domain != 'ELEMENTARY' && domain != 'HIGHSCHOOL') {
      if (this.syear.substring(6, 7) == 1) {
        this.displaysem = "1st Semester";
      } else if (this.syear.substring(6, 7) == 2) {
        this.displaysem = "2nd Semester";
      } else if (this.syear.substring(6, 7) == 3) {
        this.displaysem = "Summer";
      } else
        this.displaysem = "";
    } else { this.displaysem = ""; }
  }

  requestid() { return this.storage.get('id'); }

  setidname(val1) {
    this.storage.set('id', val1);
  }
  year = ''
  requestToken(toks) {
    this.token = toks;
    this.header.append("Content-Type", "application/json");
    this.header.append("Authorization", "Bearer " + this.token);
    this.option = new RequestOptions({ headers: this.header });
    var dt = new Date();
    this.year = dt.getFullYear().toString()
  }

  swalAlert(title, text, type) {
    swal.fire({
      type: type,
      title: title,
      html: text,
      allowEnterKey: false,
    },
    )
  }

  swalLoading(val) {
    swal.fire({
      title: val, allowOutsideClick: false,
    });
    swal.showLoading();
  }

  swalClose() {
    swal.close();
  }

  swalErrorLog(error) {
    if (error.status == 502) {
      error.statusText + "<br>Cannot connect to API server."
    }
    swal.fire('Oops...', error.statusText + "<br>Please contact your administrator.", 'error');
  }

  swalAlertError(error = null) {
    if (error == null)
      swal.fire('Looks like the server is taking too long to respond, please try again later.', '', 'warning');
    else {
      if (error.url == null) {
        swal.fire('Looks like the server is taking too long to respond, please try again later.', '', 'warning');
      } else
        swal.fire('Looks like the server is taking too long to respond, please try again later.', '' + "Error reference: (" + error.status + ") " + error.statusText + "<br>Target: " + error.url.replace(this.api, ''), 'warning');
    }

  }


  swalErrorWithCustomMessage(errorMessage) {
    swal.fire('Request Cannot Proceed', errorMessage, 'info');
  }

  setSession(val) {
    this.storage.set('token', val);
  }

  getSession() {
    return this.storage.get('token');
  }

  removeSession() {
    this.storage.remove('token');
  }

  logout() {
    let timerInterval
    swal.fire({
      allowOutsideClick: false,
      title: 'Auto close alert!',
      html: 'You will be Logged out from the system.',
      timer: 2000,
      onOpen: () => {
        swal.showLoading()
        timerInterval = setInterval(() => {
        }, 100)
      },
      onClose: () => {
        clearInterval(timerInterval)
      }
    }).then((result) => {
      if (
        // Read more about handling dismissals
        result.dismiss === swal.DismissReason.timer
      ) {
        localStorage.removeItem('authToken');
        this.storage.remove('token');
        window.location.reload();
      }
    })
  }

  swalSuccess(bat) {
    swal.fire({
      type: 'success',
      title: bat,
      showConfirmButton: false,
      timer: 1500
    })
  }

  getaccess(x) {
    for (var i = 0; i < x.length; ++i) {
      for (var u = 0; u < x[i].accessRights.length; ++u) {
        for (var n = 0; n < x[i].accessRights[u].actions.length; ++n) {
          if (!this.access.includes(x[i].accessRights[u].actions[n].id)) {
            this.access.push(x[i].accessRights[u].actions[n].id)
          }
        }
      }
    }
  }
  viewdomainname = [];
  getdomain(x) {
    if (x != undefined && x != null) {
      for (var i = 0; i < x.length; ++i) {
        if (!this.viewdomain.includes(x[i].departmentId)) {
          this.viewdomain.push(x[i].departmentId)
        }
      }
    }

    if (x != undefined && x != null) {
      for (var i = 0; i < x.length; ++i) {
        if (!this.viewdomainname.includes(x[i].departmentCode)) {
          this.viewdomainname.push(x[i].departmentCode)
        }
      }
    }
  }

  checkdomain(x) {
    if (this.viewdomain.includes(x))
      return true
    return false
  }

  viewDomain() {
    return this.viewdomain
  }


  checkrole(x) {
    if (this.roles.includes(x))
      return true
    return false
  }

  checkaccess(x) {
    if (this.access.includes(x))
      return true
    return false
  }

  syDisplay(x) {
    var y = x.substring(0, 4)
    var z = parseInt(y) + 1
    var a = y.toString() + " - " + z.toString();
    var b = x.substring(6, 7)
    var c
    if (b == '1')
      c = "1st Semester"
    else if (b == '2')
      c = "2nd Semester"
    else if (b == '3')
      c = "Summer"
    else
      c = ""
    return c + " SY " + a
  }

  ayDisplay(x) {
    var y = x.substring(0, 4)
    var z = parseInt(y) + 1
    var a = y.toString() + " - " + z.toString();
    var b = x.substring(6, 7)
    var c
    if (b == '1')
      c = "1st Semester"
    else if (b == '2')
      c = "2nd Semester"
    else if (b == '3')
      c = "Summer"
    else
      c = ""
    return c + " AY " + a
  }

  syDisplaynoSemester(x) {
    var y = x.substring(0, 4)
    var z = parseInt(y) + 1
    var a = y.toString() + " - " + z.toString();
    var b = x.substring(6, 7)
    return " SY " + a
  }

  syDisplayNoSemesterCompact(x) {
    var y = x.substring(0, 4)
    var z = parseInt(y) + 1
    var a = y.toString() + "-" + z.toString();
    var b = x.substring(6, 7)
    return a
  }

  checknosemester(x) {
    if (this.domain == "ELEMENTARY" || this.domain == "HIGHSCHOOL") {
      return x.substring(0, 6)
    }
    return x
  }

  getPublicAPICurrentServerTime() {
    return this.http.get(this.api + 'PublicAPI/CurrentServerTime', this.option)
  }

  tokenExpired(token: string) {
        try {
          const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
          return (Math.floor((new Date).getTime() / 1000)) >= expiry;
          //return true //return true to check for expired token
        } catch (Error) {
          return null;
        }
      }

}

declare global {
  interface Window {
    chrome: any;
  }
}
