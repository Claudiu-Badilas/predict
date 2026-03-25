import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'p-toggle-button',
  imports: [NgClass],
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.scss',
})
export class ToggleButtonComponent {
  @Input({ required: true }) options: string[] = [];
  @Input() set selected(value: string | null) {
    this._selected.set(!!value ? value : this.options[0]);
  }

  @Output() selectionChange = new EventEmitter<string>();

  _selected = signal<string | null>(null);

  select(option: string) {
    this._selected.set(option);
    setTimeout(() => {
      this.selectionChange.emit(option);
    }, 200);
  }
}
