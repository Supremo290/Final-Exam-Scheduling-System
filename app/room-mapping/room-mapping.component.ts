import { Component, OnInit } from '@angular/core';
import { SubjectGroup, DepartmentGroup, ProgramSchedule, Rooms } from '../subject-code';
import { ApiService } from '../api.service';
import { GlobalService } from '../global.service';
import { SharedDataService } from '../shared-data.service';

interface DateRoomSchedule {
  [date: string]: {
    [room: string]: {
      [slot: string]: string;
    };
  };
}

@Component({
  selector: 'app-room-mapping',
  templateUrl: './room-mapping.component.html',
  styleUrls: ['./room-mapping.component.scss']
})
export class RoomMappingComponent implements OnInit {
  codes: any[] = [];
  roomsData: Rooms[] = [];
  selectedScheduleOutput: any[] = [];
  
  currentExamGroupName: string = '';
  activeTerm: string = '';
  
  roomList: string[] = [];
  uniqueRooms: string[] = [];
  excludedRooms: string[] = [
    'B-11', 'B-12','BTL -','BUL -','HL','J-42','J-43','J-44','J-45','J-46','J-48','K-13',
    'K-14','K-22','K-24','K-41','L-23','M-21','M-31','M-33','M-43','MChem','MLab1','MLab2',
    'Nutri','SMTL','A-102','A-203','A-204','A-205','A-219','A-221','A-225','A-226','A-234',
    'A-302','A-306','A-308','A-309','A-310','A-311','A-312','DemoR','Pharm', 'TBA', 'to be', 
    'Virtu', 'EMC', 'Field', 'Hosp', 'Molec'
  ];
  
  examDates: string[] = [];
  selectedDate: string = '';
  selectedTabIndex: number = 0;
  
  timeSlots: string[] = [
    '7:30 AM - 9:00 AM', '9:00 AM - 10:30 AM', '10:30 AM - 12:00 PM',
    '12:00 PM - 1:30 PM', '1:30 PM - 3:00 PM', '3:00 PM - 4:30 PM',
    '4:30 PM - 6:00 PM', '6:00 PM - 7:30 PM'
  ];

  roomAssignments: DateRoomSchedule = {};
  availableCodesCache: { [dateSlot: string]: string[] } = {};

  constructor(
    private sharedData: SharedDataService,
    private api: ApiService,
    private global: GlobalService
  ) {}

  ngOnInit() {
    console.log("🚀 Room Mapping Component Initialized");
    
    const currentGroup = this.sharedData.getSelectedExamGroup();
    if (currentGroup) {
      this.currentExamGroupName = currentGroup.name;
      console.log("📋 Current exam group:", this.currentExamGroupName);
    }

    const savedTerm = this.sharedData.getActiveTerm();
    if (savedTerm) {
      this.activeTerm = savedTerm;
      console.log("📅 Current term:", this.activeTerm);
    }

    this.sharedData.examDates$.subscribe((dates) => {
      if (dates && dates.length > 0) {
        console.log(" Room Mapping: Received exam dates update:", dates);
        setTimeout(() => {
          this.loadStudentMappingData();
        }, 100);
      } else {
        console.log("🗑️ No exam dates - clearing room mapping");
        this.examDates = [];
        this.selectedDate = '';
        this.roomAssignments = {};
      }
    });

    this.sharedData.selectedExamGroup$.subscribe((group) => {
      if (group && group.name !== this.currentExamGroupName) {
        console.log("🔄 Exam group changed to:", group.name);
        this.currentExamGroupName = group.name;
        setTimeout(() => {
          this.loadStudentMappingData();
        }, 100);
      }
    });

    this.sharedData.activeTerm$.subscribe((term) => {
      if (term && term !== this.activeTerm) {
        console.log("🔄 Term changed to:", term);
        this.activeTerm = term;
        setTimeout(() => {
          this.loadStudentMappingData();
        }, 100);
      }
    });

    const storedRoomData = this.sharedData.getRoomSummaryData();
    if (storedRoomData && storedRoomData.length) {
      console.log("✅ Loaded room data:", storedRoomData.length, "items");
      this.codes = storedRoomData;
      this.extractRoomsData();
    }

    this.sharedData.api$.subscribe(data => {
      if (data && data.length) {
        console.log("🔄 Room data updated:", data.length, "items");
        this.codes = data;
        this.extractRoomsData();
      }
    });

    this.loadStudentMappingData();
  }

  private loadStudentMappingData() {
    if (!this.currentExamGroupName || !this.activeTerm) {
      console.warn("⚠️ Cannot load student mapping - missing group name or term");
      return;
    }

    console.log("📖 Loading student mapping for:", this.currentExamGroupName, this.activeTerm);

    const groupMapping = this.sharedData.getStudentMappingForGroup(
      this.currentExamGroupName,
      this.activeTerm
    );

    if (groupMapping && groupMapping.length > 0) {
      console.log("✅ Loaded group-specific student mapping:", groupMapping.length, "days");
      this.selectedScheduleOutput = groupMapping;
      this.extractExamDates();
      this.buildAvailableCodesCache();
      this.loadRoomAssignments();
    } else {
      console.warn("⚠️ No student mapping data found");
      this.selectedScheduleOutput = [];
      this.examDates = [];
      this.selectedDate = '';
    }
  }

  private loadRoomAssignments() {
    if (!this.currentExamGroupName || !this.activeTerm) {
      console.warn("⚠️ Cannot load room assignments - missing group name or term");
      return;
    }

    const storedRooms = this.sharedData.getRoomMappingForGroup(
      this.currentExamGroupName,
      this.activeTerm
    );

    if (storedRooms && Object.keys(storedRooms).length > 0) {
      console.log("Loaded saved room assignments for group");
      this.roomAssignments = storedRooms;
    } else {
      if (this.roomList.length > 0 && this.examDates.length > 0) {
        console.log("🔧 Initializing new room assignments");
        this.initializeRoomAssignments();
      }
    }
  }

  extractExamDates() {
    if (!this.selectedScheduleOutput || !this.selectedScheduleOutput.length) {
      console.warn('⚠️ No student mapping available to extract dates');
      this.examDates = [];
      this.selectedDate = '';
      this.selectedTabIndex = 0;
      return;
    }

    this.examDates = this.selectedScheduleOutput.map(day => day.date);
    
    console.log('📅 Extracted exam dates:', this.examDates);
    
    if (this.examDates.length > 0) {
      this.selectedDate = this.examDates[0];
      this.selectedTabIndex = 0;
      console.log(" Auto-selected first date:", this.selectedDate);
    } else {
      this.selectedDate = '';
      this.selectedTabIndex = 0;
    }
  }

  onTabChange(index: number) {
    if (index >= 0 && index < this.examDates.length) {
      this.selectedDate = this.examDates[index];
      console.log("📅 Tab changed to:", this.selectedDate);
    }
  }

  buildAvailableCodesCache() {
    this.availableCodesCache = {};
    if (!this.selectedScheduleOutput || !Array.isArray(this.selectedScheduleOutput)) {
      return;
    }

    this.selectedScheduleOutput.forEach(daySchedule => {
      const date = daySchedule.date;
      if (!daySchedule.programs || !Array.isArray(daySchedule.programs)) return;

      const slotCodesMap: { [slot: string]: Set<string> } = {};

      daySchedule.programs.forEach((p: any) => {
        if (!p.subjects || !Array.isArray(p.subjects)) return;

        p.subjects.forEach((s: any) => {
          if (s.sched && s.codeNo) {
            if (!slotCodesMap[s.sched]) {
              slotCodesMap[s.sched] = new Set<string>();
            }
            slotCodesMap[s.sched].add(s.codeNo);
          }
        });
      });

      Object.keys(slotCodesMap).forEach(slot => {
        const cacheKey = date + '_' + slot;
        this.availableCodesCache[cacheKey] = Array.from(slotCodesMap[slot]);
      });
    });

    console.log('✅ Built available codes cache');
  }

  getAvailableCodesForSlot(date: string, slot: string): string[] {
    const cacheKey = date + '_' + slot;
    return this.availableCodesCache[cacheKey] || [];
  }

  getAvailableCodesForCurrentSlot(slot: string): string[] {
    if (!this.selectedDate) return [];
    return this.getAvailableCodesForSlot(this.selectedDate, slot);
  }

  autoAssignAllDates() {
    if (this.examDates.length === 0) {
      this.global.swalAlertError('No exam dates available');
      return;
    }

    if (!confirm(`Auto-assign rooms for all ${this.examDates.length} exam dates?`)) {
      return;
    }

    let totalAssigned = 0;

    this.examDates.forEach(date => {
      this.selectedDate = date;
      
      const daySchedule = this.selectedScheduleOutput.find(d => d.date === date);
      if (!daySchedule) return;

      if (!this.roomAssignments[date]) {
        this.roomAssignments[date] = {};
      }

      this.roomList.forEach(room => {
        if (!this.roomAssignments[date][room]) {
          this.roomAssignments[date][room] = {};
        }
        this.timeSlots.forEach(slot => {
          this.roomAssignments[date][room][slot] = '';
        });
      });

      this.timeSlots.forEach(slot => {
        const codesForSlot = this.getAvailableCodesForSlot(date, slot);
        if (codesForSlot.length === 0) return;

        const sortedRooms = this.roomList.slice().sort((a, b) => {
          return this.getRoomCapacity(b) - this.getRoomCapacity(a);
        });

        let roomIndex = 0;

        codesForSlot.forEach(code => {
          if (roomIndex >= sortedRooms.length) return;
          const room = sortedRooms[roomIndex];
          
          if (!this.roomAssignments[date][room][slot]) {
            this.roomAssignments[date][room][slot] = code;
            totalAssigned++;
            roomIndex++;
          }
        });
      });
    });

    this.saveRoomAssignments();
    this.global.swalSuccess(`✅ Auto-assigned ${totalAssigned} codes across ${this.examDates.length} days!`);
  }

  autoAssignRooms() {
    if (!this.selectedDate) {
      this.global.swalAlertError('Please select a date first');
      return;
    }

    const daySchedule = this.selectedScheduleOutput.find(d => d.date === this.selectedDate);
    if (!daySchedule) {
      this.global.swalAlertError('No schedule found for selected date');
      return;
    }

    if (!this.roomAssignments[this.selectedDate]) {
      this.roomAssignments[this.selectedDate] = {};
    }

    this.roomList.forEach(room => {
      if (!this.roomAssignments[this.selectedDate][room]) {
        this.roomAssignments[this.selectedDate][room] = {};
      }
      this.timeSlots.forEach(slot => {
        this.roomAssignments[this.selectedDate][room][slot] = '';
      });
    });

    const assignedCodes = new Set<string>();

    this.timeSlots.forEach(slot => {
      const codesForSlot = this.getAvailableCodesForSlot(this.selectedDate, slot);
      if (codesForSlot.length === 0) return;

      const sortedRooms = this.roomList.slice().sort((a, b) => {
        return this.getRoomCapacity(b) - this.getRoomCapacity(a);
      });

      let roomIndex = 0;

      codesForSlot.forEach(code => {
        if (roomIndex >= sortedRooms.length) return;
        const room = sortedRooms[roomIndex];
        
        if (!this.roomAssignments[this.selectedDate][room][slot]) {
          this.roomAssignments[this.selectedDate][room][slot] = code;
          assignedCodes.add(code);
          roomIndex++;
        }
      });
    });

    this.saveRoomAssignments();
    this.global.swalSuccess(`✅ Auto-assigned ${assignedCodes.size} codes!`);
  }

  clearCurrentDate() {
    if (!this.selectedDate) {
      this.global.swalAlertError('Please select a date first');
      return;
    }

    if (!confirm('Clear all room assignments for ' + new Date(this.selectedDate).toLocaleDateString() + '?')) {
      return;
    }

    if (!this.roomAssignments[this.selectedDate]) {
      this.roomAssignments[this.selectedDate] = {};
    }

    this.roomList.forEach(room => {
      if (!this.roomAssignments[this.selectedDate][room]) {
        this.roomAssignments[this.selectedDate][room] = {};
      }
      this.timeSlots.forEach(slot => {
        this.roomAssignments[this.selectedDate][room][slot] = '';
      });
    });

    this.saveRoomAssignments();
    this.global.swalSuccess('Cleared assignments for selected date!');
  }

  clearAll() {
    if (!confirm('Clear all room assignments for ALL dates?')) {
      return;
    }

    this.examDates.forEach(date => {
      this.roomList.forEach(room => {
        if (!this.roomAssignments[date]) {
          this.roomAssignments[date] = {};
        }
        if (!this.roomAssignments[date][room]) {
          this.roomAssignments[date][room] = {};
        }
        this.timeSlots.forEach(slot => {
          this.roomAssignments[date][room][slot] = '';
        });
      });
    });

    this.saveRoomAssignments();
    this.global.swalSuccess('Cleared all room assignments!');
  }

  extractRoomsData() {
    if (!this.codes || !this.codes.length) {
      return;
    }

    this.extractUniqueRoomNumbers();
    this.roomsData = this.groupDataByRoom(this.codes);
    
    if (this.examDates.length > 0) {
      this.initializeRoomAssignments();
    }
  }

  extractUniqueRoomNumbers() {
    const roomSet = new Set<string>();
    
    this.codes.forEach(item => {
      if (item.roomNumber && item.roomNumber.trim() !== '') {
        const roomNumber = item.roomNumber.trim();
        if (!this.excludedRooms.includes(roomNumber)) {
          roomSet.add(roomNumber);
        }
      }
    });

    this.uniqueRooms = Array.from(roomSet).sort((a, b) => {
      const hasADash = a.includes('-');
      const hasBDash = b.includes('-');
      
      if (hasADash && !hasBDash) return -1;
      if (!hasADash && hasBDash) return 1;
      if (!hasADash && !hasBDash) return a.localeCompare(b);
      
      const splitA = a.split('-');
      const splitB = b.split('-');
      const buildingA = splitA[0] || '';
      const buildingB = splitB[0] || '';
      const numA = splitA[1] || '0';
      const numB = splitB[1] || '0';
      
      if (buildingA !== buildingB) {
        return buildingA.localeCompare(buildingB);
      }
      
      return parseInt(numA, 10) - parseInt(numB, 10);
    });

    this.roomList = this.uniqueRooms;
  }

  groupDataByRoom(data: any[]): Rooms[] {
    const roomsMap = new Map<string, Rooms>();

    for (const item of data) {
      if (!item.roomNumber || item.roomNumber.trim() === '') continue;

      const roomNumber = item.roomNumber.trim();
      
      if (!roomsMap.has(roomNumber)) {
        roomsMap.set(roomNumber, {
          roomNumber: roomNumber,
          schedule: []
        });
      }

      const room = roomsMap.get(roomNumber);
      if (room) {
        room.schedule.push({
          subjectId: item.subjectId || '',
          codeNo: item.codeNo || '',
          course: item.course || '',
          yearLevel: item.yearLevel || 0,
          dept: item.dept || item.deptCode || '',
          day: item.day || '',
          time: item.time || '',
          units: parseInt(item.lecUnits) || 0
        });
      }
    }

    return Array.from(roomsMap.values());
  }

  initializeRoomAssignments() {
    this.examDates.forEach(date => {
      if (!this.roomAssignments[date]) {
        this.roomAssignments[date] = {};
      }
      
      this.roomList.forEach(room => {
        if (!this.roomAssignments[date][room]) {
          this.roomAssignments[date][room] = {};
        }
        
        this.timeSlots.forEach(slot => {
          if (typeof this.roomAssignments[date][room][slot] === 'undefined') {
            this.roomAssignments[date][room][slot] = '';
          }
        });
      });
    });
  }

  onAssignCode(room: string, slot: string, event: any) {
    if (!this.selectedDate) return;

    if (!this.roomAssignments[this.selectedDate]) {
      this.roomAssignments[this.selectedDate] = {};
    }
    if (!this.roomAssignments[this.selectedDate][room]) {
      this.roomAssignments[this.selectedDate][room] = {};
    }
    
    this.roomAssignments[this.selectedDate][room][slot] = event.target.value;
    this.saveRoomAssignments();
  }

  getCurrentAssignment(room: string, slot: string): string {
    if (!this.selectedDate) return '';
    return this.roomAssignments[this.selectedDate] && 
           this.roomAssignments[this.selectedDate][room] &&
           this.roomAssignments[this.selectedDate][room][slot] 
           ? this.roomAssignments[this.selectedDate][room][slot] 
           : '';
  }

  getRoomCapacity(roomNumber: string): number {
    if (!this.codes || !this.codes.length) return 0;
    const roomData = this.codes.find(item => item.roomNumber === roomNumber);
    return roomData && roomData.classSize ? roomData.classSize : 0;
  }

  private saveRoomAssignments() {
    if (!this.currentExamGroupName || !this.activeTerm) return;
    
    this.sharedData.setRoomMappingForGroup(
      this.currentExamGroupName,
      this.activeTerm,
      this.roomAssignments
    );
  }

  saveToLocalStorage() {
    this.saveRoomAssignments();
    this.global.swalSuccess('Room assignments saved successfully!');
  }

  getSubjectDetailsForCode(code: string, slot: string): any {
    if (!this.selectedDate || !code) return null;

    const daySchedule = this.selectedScheduleOutput.find(d => d.date === this.selectedDate);
    if (!daySchedule) return null;

    for (const program of daySchedule.programs) {
      if (!program.subjects || !Array.isArray(program.subjects)) continue;

      for (const subject of program.subjects) {
        if (subject.codeNo === code && subject.sched === slot) {
          return {
            subjectId: subject.subjectId,
            subjectTitle: subject.subjectTitle,
            codeNo: subject.codeNo
          };
        }
      }
    }

    return null;
  }

  getAssignedCodesForDate(date: string): number {
    if (!this.roomAssignments[date]) return 0;
    
    let count = 0;
    for (const room in this.roomAssignments[date]) {
      for (const slot in this.roomAssignments[date][room]) {
        if (this.roomAssignments[date][room][slot]) {
          count++;
        }
      }
    }
    return count;
  }

  getTotalCodesForDate(date: string): number {
    let count = 0;
    this.timeSlots.forEach(slot => {
      const codes = this.getAvailableCodesForSlot(date, slot);
      count += codes.length;
    });
    return count;
  }
}