import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  imports: [FormsModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() checked: boolean = false;

  @Output() valueChange = new EventEmitter<boolean>();

  onCheckboxChange() {
    this.valueChange.emit(this.checked);
  }
}
