import { Component } from '@angular/core';
import { first } from 'rxjs';
import { GraficRambursare, Rata } from '../models/mortgage.model';
import { MortgageService } from '../services/mortgage.service';

@Component({
    selector: 'app-mortgage',
    templateUrl: './mortgage.component.html',
    styleUrls: ['./mortgage.component.scss'],
    standalone: false
})
export class MortgageComponent {
  transactions: GraficRambursare[] = [];

  constructor(private readonly _mortgageService: MortgageService) {
    this._mortgageService
      .getMortgages()
      .pipe(first())
      .subscribe((res) => {
        this.transactions = res;
        // this.rateSelectate = res[0].rate.slice(0, 7);
      });
  }

  rateSelectate: Rata[] = [];
  showDetails = false;

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  onSelect(rata: Rata) {
    const index = this.rateSelectate.findIndex((r) => r.nrCtr === rata.nrCtr);

    if (index !== -1) {
      this.rateSelectate.splice(index, 1);
    } else {
      this.rateSelectate.push(rata);
    }

    this.rateSelectate = this.rateSelectate.sort((a, b) => a.nrCtr - b.nrCtr);
  }

  get anySelected(): boolean {
    return this.rateSelectate.length > 0;
  }

  get rata() {
    return this.rateSelectate[0] || null;
  }

  get anticipate() {
    return this.rateSelectate.slice(1);
  }

  get totalAnticipate() {
    return (this.anticipate ?? [])
      .map((a) => a.rataCredit)
      .reduce((sum, val) => sum + val, 0);
  }

  get totalDobandaSalvata() {
    return (this.anticipate ?? []).reduce(
      (sum, val) => sum + (val.totalRata - val.rataCredit),
      0
    );
  }

  get total() {
    return (this.rata?.totalRata ?? 0) + this.totalAnticipate;
  }
}
