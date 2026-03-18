import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';
import * as fromAppStore from 'src/app/store/app-state.reducer';

@Component({
  selector: 'p-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  imports: [CommonModule, NgbDropdownModule],
})
export class TopBarComponent {
  isMenuOpen = false;

  modules = [
    { name: 'Mortgage', url: 'mortgage-loan/overview' },
    { name: 'Transactions', url: 'transactions' },
    { name: 'Invoices', url: 'invoices' },
    { name: 'Receipts', url: 'receipts/summary' },
    { name: 'Settings', url: 'settings' },
    { name: 'Log out', url: 'authentication/logout' },
  ];

  constructor(private store: Store<fromAppStore.AppState>) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onNavigateTo(url: string) {
    this.isMenuOpen = false;
    this.store.dispatch(NavigationAction.navigateTo({ route: url }));
  }
}
