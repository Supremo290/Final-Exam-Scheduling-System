import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../shared-data.service';
import { ApiService } from '../api.service';
import { GlobalService } from '../global.service';

interface FinalScheduleRow {
  code: string;
  version: string;
  subjectId: string;
  descriptiveTitle: string;
  course: string;
  lec: number;
  dept: string;
  day: string;
  time: string;
  room: string;
}

@Component({
  selector: 'app-final-output',
  templateUrl: './final-output.component.html',
  styleUrls: ['./final-output.component.scss']
})
export class FinalOutputComponent implements OnInit {
  
  finalScheduleData: FinalScheduleRow[] = [];
  isLoading: boolean = false;
  currentExamGroup: string = '';
  currentTerm: string = '';
  
  displayedColumns: string[] = [
    'code', 
    'version', 
    'subjectId', 
    'descriptiveTitle', 
    'course', 
    'lec', 
    'dept', 
    'day', 
    'time', 
    'room'
  ];

  constructor(
    private sharedData: SharedDataService,
    private api: ApiService,
    private global: GlobalService
  ) {}

  ngOnInit() {
    // Get current exam group and term first
    const group = this.sharedData.getSelectedExamGroup();
    const term = this.sharedData.getActiveTerm();
    
    if (group) {
      this.currentExamGroup = group.name;
      console.log('✅ Exam Group:', this.currentExamGroup);
    }
    
    if (term) {
      this.currentTerm = term;
      console.log('✅ Term:', this.currentTerm);
    }
    
    // Load schedule after setting group and term
    this.loadFinalSchedule();
    
    // Subscribe to changes in student or room mapping
    this.sharedData.selectedExamGroup$.subscribe(group => {
      if (group && group.name !== this.currentExamGroup) {
        this.currentExamGroup = group.name;
        console.log('🔄 Group changed to:', this.currentExamGroup);
        this.loadFinalSchedule();
      }
    });

    this.sharedData.activeTerm$.subscribe(term => {
      if (term && term !== this.currentTerm) {
        this.currentTerm = term;
        console.log('🔄 Term changed to:', this.currentTerm);
        this.loadFinalSchedule();
      }
    });
  }

  loadFinalSchedule() {
    // Get current exam group and term if not already set
    if (!this.currentExamGroup || !this.currentTerm) {
      const group = this.sharedData.getSelectedExamGroup();
      const term = this.sharedData.getActiveTerm();
      
      if (group) this.currentExamGroup = group.name;
      if (term) this.currentTerm = term;
    }

    if (!this.currentExamGroup || !this.currentTerm) {
      console.warn('⚠️ Cannot load final schedule - missing exam group or term');
      console.log('   Group:', this.currentExamGroup);
      console.log('   Term:', this.currentTerm);
      return;
    }

    this.isLoading = true;
    console.log('📊 Loading final schedule for:', this.currentExamGroup, this.currentTerm);

    // Get student mapping data
    const studentMapping = this.sharedData.getStudentMappingForGroup(
      this.currentExamGroup,
      this.currentTerm
    );

    console.log('📖 Student Mapping:', studentMapping);

    // Get room mapping data
    const roomMapping = this.sharedData.getRoomMappingForGroup(
      this.currentExamGroup,
      this.currentTerm
    );

    console.log('🏠 Room Mapping:', roomMapping);

    // Get room summary data (contains units and other details)
    const roomSummary = this.sharedData.getRoomSummaryData();
    
    console.log('📋 Room Summary:', roomSummary ? roomSummary.length + ' items' : 'none');

    if (!studentMapping || studentMapping.length === 0) {
      console.warn('⚠️ No student mapping data found');
      this.finalScheduleData = [];
      this.isLoading = false;
      return;
    }

    this.finalScheduleData = this.buildFinalSchedule(
      studentMapping,
      roomMapping,
      roomSummary
    );

    this.isLoading = false;
    console.log('✅ Final schedule loaded:', this.finalScheduleData.length, 'entries');
    console.log('📊 Sample data:', this.finalScheduleData.slice(0, 3));
  }

  private buildFinalSchedule(
    studentMapping: any[],
    roomMapping: any,
    roomSummary: any[]
  ): FinalScheduleRow[] {
    
    const scheduleRows: FinalScheduleRow[] = [];

    console.log('🔨 Building final schedule...');
    console.log('   Days to process:', studentMapping.length);

    // Process each exam date
    studentMapping.forEach((daySchedule, dayIndex) => {
      const date = daySchedule.date;
      const formattedDate = this.formatDate(date);

      console.log(`   Processing day ${dayIndex + 1}:`, date);
      console.log('   Programs:', daySchedule.programs ? daySchedule.programs.length : 0);

      if (!daySchedule.programs || !Array.isArray(daySchedule.programs)) {
        console.warn('   ⚠️ No programs found for this day');
        return;
      }

      // Process each program
      daySchedule.programs.forEach((program: any) => {
        const course = `${program.program} - ${program.year}`;

        if (!program.subjects || !Array.isArray(program.subjects)) {
          return;
        }

        // Process each subject
        program.subjects.forEach((subject: any) => {
          const subjectId = subject.subjectId;
          const subjectTitle = subject.subjectTitle;
          const codeNo = subject.codeNo;
          const timeSlot = subject.sched;

          // Find room assignment for this code
          let assignedRoom = '';
          if (roomMapping && roomMapping[date]) {
            for (const room in roomMapping[date]) {
              if (roomMapping[date][room] && roomMapping[date][room][timeSlot] === codeNo) {
                assignedRoom = room;
                break;
              }
            }
          }

          // Find units from room summary data
          let units = 3; // Default
          let dept = '';
          
          if (roomSummary && Array.isArray(roomSummary)) {
            const roomSummaryItem = roomSummary.find(
              item => item.subjectId === subjectId && item.codeNo === codeNo
            );
            
            if (roomSummaryItem) {
              if (roomSummaryItem.lecUnits) {
                units = parseInt(roomSummaryItem.lecUnits);
              }
              if (roomSummaryItem.dept) {
                dept = roomSummaryItem.dept;
              }
            }
          }

          scheduleRows.push({
            code: codeNo || '',
            version: this.currentTerm.substring(0, 4), // Year from term code
            subjectId: subjectId || '',
            descriptiveTitle: subjectTitle || '',
            course: course,
            lec: units,
            dept: dept,
            day: formattedDate,
            time: timeSlot || '',
            room: assignedRoom || 'TBA'
          });
        });
      });
    });

    console.log('✅ Built', scheduleRows.length, 'schedule rows');

    // Sort by date, then time, then course
    scheduleRows.sort((a, b) => {
      if (a.day !== b.day) {
        return new Date(a.day).getTime() - new Date(b.day).getTime();
      }
      if (a.time !== b.time) {
        return this.compareTimeSlots(a.time, b.time);
      }
      return a.course.localeCompare(b.course);
    });

    return scheduleRows;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: '2-digit' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  private compareTimeSlots(time1: string, time2: string): number {
    const timeOrder = [
      '7:30 AM - 9:00 AM',
      '9:00 AM - 10:30 AM',
      '10:30 AM - 12:00 PM',
      '12:00 PM - 1:30 PM',
      '1:30 PM - 3:00 PM',
      '3:00 PM - 4:30 PM',
      '4:30 PM - 6:00 PM',
      '6:00 PM - 7:30 PM'
    ];
    
    const index1 = timeOrder.indexOf(time1);
    const index2 = timeOrder.indexOf(time2);
    
    return index1 - index2;
  }

  exportToExcel() {
    if (this.finalScheduleData.length === 0) {
      this.global.swalAlertError('No schedule data to export');
      return;
    }

    // Create CSV content
    const headers = [
      'CODE', 'VERSION', 'SUBJECT ID', 'DESCRIPTIVE TITLE', 
      'COURSE', 'LEC', 'DEPT', 'Day', 'Time', 'Room'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    this.finalScheduleData.forEach(row => {
      const rowData = [
        row.code,
        row.version,
        row.subjectId,
        `"${row.descriptiveTitle}"`, // Wrap in quotes to handle commas
        `"${row.course}"`,
        row.lec,
        row.dept,
        row.day,
        row.time,
        row.room
      ];
      csvContent += rowData.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `exam_schedule_${this.currentExamGroup}_${this.currentTerm}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.global.swalSuccess('Schedule exported successfully!');
  }

  printSchedule() {
    window.print();
  }

  refreshSchedule() {
    this.loadFinalSchedule();
  }

  getTermYearLabel(termYearCode: string): string {
    if (!termYearCode) return '';
    
    const termMap: any = { '1': '1st Term', '2': '2nd Term', '3': 'Summer' };
    const termCode = termYearCode.slice(-1);
    const yearPart = termYearCode.slice(0, -1);
    const year1 = yearPart.slice(0, 4);
    const year2 = '20' + yearPart.slice(-2);
    
    return `${termMap[termCode] || 'Unknown'} ${year1}-${year2}`;
  }

  getUniqueSubjectCount(): number {
    const uniqueSubjects = new Set(
      this.finalScheduleData.map(row => row.subjectId)
    );
    return uniqueSubjects.size;
  }

  getAssignedRoomCount(): number {
    return this.finalScheduleData.filter(row => row.room && row.room !== 'TBA').length;
  }

  getUnassignedRoomCount(): number {
    return this.finalScheduleData.filter(row => !row.room || row.room === 'TBA').length;
  }
}