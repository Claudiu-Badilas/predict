import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component';

@Component({
  selector: 'p-settings',
  imports: [RouterModule, TopBarComponent, SideBarComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  modules = [
    { name: 'Mortgage', url: 'mortgage-loan' },
    { name: 'Transactions', url: 'transactions' },
    { name: 'Invoices', url: 'invoices' },
    { name: 'Receipts', url: 'receipts' },
  ];
}
