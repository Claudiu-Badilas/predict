import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NumberFormatPipe } from 'src/app/shared/pipes/number-format.pipe';
import {
  TransactionCategorizer,
  TransactionCategory,
  TransactionDomain,
} from '../../models/transactions.model';

@Component({
  selector: 'p-transaction-feed',
  imports: [CommonModule, NumberFormatPipe],
  templateUrl: './transaction-feed.component.html',
  styleUrl: './transaction-feed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionFeedComponent {
  transactions = input<TransactionDomain[]>([]);
  searchTerm = input('');
  categorySelected = output<TransactionCategory>();
  providerSelected = output<string>();

  merchantLabel(transaction: TransactionDomain): string {
    return (
      transaction.serviceProvider?.trim() ||
      transaction.merchantName?.trim() ||
      transaction.provider?.trim() ||
      'Transaction'
    );
  }

  selectProvider(transaction: TransactionDomain): void {
    const provider =
      transaction.serviceProvider?.trim() ||
      transaction.merchantName?.trim() ||
      transaction.provider?.trim();
    if (provider) this.providerSelected.emit(provider);
  }

  formatDate(date: Date | null): string {
    return date
      ? new Intl.DateTimeFormat(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(date)
      : 'Date unavailable';
  }

  transactionKey(transaction: TransactionDomain, index: number): string {
    return String(
      transaction.id ??
        `${transaction.completionDate?.getTime() ?? transaction.registrationDate?.getTime() ?? 0}-${index}`,
    );
  }

  getCategoryColor(category: TransactionCategory): string {
    return TransactionCategorizer.getCategoryColor(category);
  }

  getCategoryLabel(category: TransactionCategory): string {
    return TransactionCategorizer.getCategoryLabel(category);
  }

  highlightParts(value: string): { text: string; match: boolean }[] {
    const query = this.searchTerm().trim();
    if (!query || !value) return [{ text: value, match: false }];

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = value.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return parts.map((text) => ({
      text,
      match: text.toLocaleLowerCase() === query.toLocaleLowerCase(),
    }));
  }
}
