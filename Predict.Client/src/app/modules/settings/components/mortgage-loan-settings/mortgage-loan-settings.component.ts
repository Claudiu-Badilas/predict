import { Component } from '@angular/core';
import { MortgageLoanService } from 'src/app/modules/mortgage-loan/services/overview-mortgage.service';

@Component({
  selector: 'p-mortgage-loan-settings',
  imports: [],
  templateUrl: './mortgage-loan-settings.component.html',
  styleUrl: './mortgage-loan-settings.component.scss',
})
export class MortgageLoanSettingsComponent {
  constructor(
    // private readonly store: Store<fromMortgageLoan.MortgageLoanState>,
    private mortgageService: MortgageLoanService,
  ) {}

  downloadSchedules(): void {
    this.mortgageService.downloadRepaymentSchedulesAsJson();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.mortgageService
      .uploadRepaymentSchedulesFromJson(file)
      .then(() => {
        alert('File uploaded and stored successfully!');
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      });
  }
}
