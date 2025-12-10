import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss'],
  imports: [NgbDropdownModule],
})
export class DropdownSelectComponent {
  @Input() items: string[] = [];
  @Input() placeholder = 'Select';

  @Output() selectionChange = new EventEmitter<string>();

  selectedItem?: string;

  selectItem(item: string) {
    this.selectedItem = item;
    this.selectionChange.emit(item);
  }
}
