import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-numeric-input',
  templateUrl: './numeric-input.component.html',
  styleUrls: ['./numeric-input.component.scss'],
})
export class NumericInputComponent {
  @Input() label = '';
  @Input() value: number | null = null;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<number | null>();

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;

    const newValue = input.value === '' ? null : Number(input.value);

    this.value = newValue;
    this.valueChange.emit(newValue);
  }
}
