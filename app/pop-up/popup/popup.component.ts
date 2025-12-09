import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent {

  @Input() visible: boolean = false;  // Control visibility from parent
  @Output() closePopup = new EventEmitter<void>();  // Emit event when popup is closed

  close() {
    this.visible = false;
    this.closePopup.emit();
  }

}
