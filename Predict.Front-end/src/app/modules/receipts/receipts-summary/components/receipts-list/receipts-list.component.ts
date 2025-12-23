import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ReceiptDomain } from '../../../models/receipts-domain.model';

@Component({
  selector: 'app-receipts-list',
  imports: [CommonModule],
  templateUrl: './receipts-list.component.html',
  styleUrls: ['./receipts-list.component.scss'],
})
export class ReceiptListComponent {
  @Input() receipts: ReceiptDomain[] = [];

  expanded = new Set<number>();

  toggle(id: number) {
    if (this.expanded.has(id)) {
      this.expanded.delete(id);
    } else {
      this.expanded.add(id);
    }
  }
}
