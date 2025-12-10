import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { first } from 'rxjs';
import { DatePickerComponent } from 'src/app/shared/components/date-picker/date-picker.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import * as NavigationAction from 'src/app/store/navigation-state/navigation.actions';
import { GraficRambursare, Rata } from '../models/mortgage.model';
import { MortgageService } from '../services/mortgage.service';

@Component({
  selector: 'app-mortgage-overview',
  imports: [
    CommonModule,
    NgbModule,
    SideBarModule,
    DatePickerComponent,
    ToggleButtonComponent,
  ],
  templateUrl: './mortgage-overview.component.html',
  styleUrls: ['./mortgage-overview.component.scss'],
})
export class MortgageOverviewComponent {
  transactions: GraficRambursare[] = [];

  constructor(
    private store: Store<fromAppStore.AppState>,
    private readonly _mortgageService: MortgageService
  ) {
    this._mortgageService
      .getMortgages()
      .pipe(first())
      .subscribe((res) => {
        this.transactions = res;
      });
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/mortgage/${module.toLocaleLowerCase()}`,
      })
    );
  }

  rateSelectate: Rata[] = [];

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
