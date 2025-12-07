import { Component } from '@angular/core';
import { first } from 'rxjs';
import { GraficRambursare } from '../models/mortgage.model';
import { MortgageService } from '../services/mortgage.service';

@Component({
  selector: 'app-mortgage',
  templateUrl: './mortgage.component.html',
  styleUrls: ['./mortgage.component.scss'],
})
export class MortgageComponent {
  transactions: GraficRambursare[] = [];

  constructor(private readonly _mortgageService: MortgageService) {
    this._mortgageService
      .getMortgages()
      .pipe(first())
      .subscribe((res) => {
        this.transactions = res;
      });
  }
}
