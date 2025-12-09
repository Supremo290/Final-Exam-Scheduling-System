import { Component, OnInit } from '@angular/core';

interface Exam {
  code: string;
  version: number;
  subjectId: string;
  title: string;
  course: string;
  lec: number;
  oe: number;
  dept: string;
  day: string;
  time: string;
  room: string;
  instructor: string;
}
@Component({
  selector: 'app-generate-schedule',
  templateUrl: './generate-schedule.component.html',
  styleUrls: ['./generate-schedule.component.scss']

})
export class GenerateScheduleComponent implements OnInit {

  exams: Exam[] = [];
  generatedSchedule: any[] = [];

  rooms = Array.from({ length: 81 }, (_, i) => `Room ${i + 1}`);
  days = ['Day 1', 'Day 2', 'Day 3'];
  timeSlots: string[] = [
    '7:30-9:00',
    '9:00-10:30',
    '10:30-12:00',
    '12:00-1:30',
    '1:30-3:00',
    '3:00-4:30',
    '4:30-6:00',
    '6:00-7:30'
  ];

  constructor() {}

  ngOnInit(): void {
    // this.loadExams();
  }

  // loadExams() {
  //   this.examService.getExams().subscribe({
  //     next: (data) => {
  //       this.exams = data;
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }

  // ✅ Added: Import data manually
  importData() {
    this.exams = [
      {
        code: 'P35',
        version: 2018,
        subjectId: 'ICTE 1053',
        title: 'Auditing in a CIS Environment',
        course: 'BSAC - 3',
        lec: 3,
        oe: 10,
        dept: 'SABH',
        day: '',
        time: '',
        room: '',
        instructor: 'AGGABAO, MARIE JOYCE ZINGAPAN'
      },
      {
        code: 'A79',
        version: 2018,
        subjectId: 'TAXN 1023',
        title: 'Business Taxation',
        course: 'BSAC - 2',
        lec: 3,
        oe: 41,
        dept: 'SABH',
        day: '',
        time: '',
        room: '',
        instructor: 'AGGABAO, MARIE JOYCE ZINGAPAN'
      },
      {
        code: '021',
        version: 2018,
        subjectId: 'ACCT 1163',
        title: 'Operations Auditing',
        course: 'BSAC - 3',
        lec: 3,
        oe: 33,
        dept: 'SABH',
        day: '',
        time: '',
        room: '',
        instructor: 'ANTONIO, JEREMY MANSIBANG'
      }
    ];

    console.log('Imported Exams:', this.exams);
  }

  // ✅ Existing method to generate schedule
  generateExamSchedule() {
    const schedule: any[] = [];
    let dayIndex = 0;
    let timeIndex = 0;
    let roomIndex = 0;

    const usedSlots: any = {};

    for (const exam of this.exams) {
      const courseKey = exam.course;
      const slotKey = `${dayIndex}-${timeIndex}`;

      if (usedSlots[courseKey] === slotKey) {
        timeIndex++;
        if (timeIndex >= this.timeSlots.length) {
          timeIndex = 0;
          dayIndex++;
        }
      }

      const scheduleItem = {
        subject: exam.title,
        course: exam.course,
        room: this.rooms[roomIndex],
        day: this.days[dayIndex],
        time: this.timeSlots[timeIndex]
      };

      schedule.push(scheduleItem);
      usedSlots[courseKey] = slotKey;

      roomIndex++;
      if (roomIndex >= this.rooms.length) {
        roomIndex = 0;
        timeIndex++;
      }
      if (timeIndex >= this.timeSlots.length) {
        timeIndex = 0;
        dayIndex++;
      }
      if (dayIndex >= this.days.length) break;
    }

    this.generatedSchedule = schedule;
    console.log('Generated Exam Schedule:', this.generatedSchedule);
  }
}