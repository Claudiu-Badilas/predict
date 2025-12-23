import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dropdown-select',
  templateUrl: './dropdown-select.component.html',
  styleUrls: ['./dropdown-select.component.scss'],
  imports: [NgbDropdownModule, FormsModule],
})
export class DropdownSelectComponent {
  @Input({ required: true }) items: string[] = [];
  @Input({ required: true }) selectedItem!: string;
  @Input() placeholder = 'Select';

  @Output() selectionChange = new EventEmitter<string>();

  searchTerm: string = '';

  selectItem(item: string) {
    this.selectedItem = item;
    this.selectionChange.emit(item);
  }

  filteredItems() {
    if (!this.searchTerm || this.searchTerm === '') return this.items;
    return this.items.filter((item) =>
      item.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
