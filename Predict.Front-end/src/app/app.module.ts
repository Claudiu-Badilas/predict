import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AuthenticationService } from 'src/app/platform/services/authentication.service';

import { AppComponent } from 'src/app/app.component';

import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { AppRouting } from 'src/app/app.routing';
import { TransactionService } from 'src/app/modules/transaction/services/transaction.service';
import { TransactionModule } from 'src/app/modules/transaction/transaction.module';
import { AuthenticationModule } from 'src/app/platform/authentication/authentication.module';
import { AuthenticationEffects } from 'src/app/platform/authentication/effects/authentication.effects';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import { NavigationEffects } from 'src/app/store/effects/navigation.effects';

import { ToastNotificationEffects } from 'src/app/platform/toast-notifications/effects/toast-notification.effects';
import { ToastNotificationModule } from 'src/app/platform/toast-notifications/toast-notification.module';
import { MortgageLoanModule } from './modules/mortgage-loan/mortgage-loan.module';
import { MortgageLoanService } from './modules/mortgage-loan/services/overview-mortgage.service';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { TopBarComponent } from './shared/components/top-bar/top-bar.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRouting,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
     TransactionModule,
    AuthenticationModule,
    StoreModule.forRoot(fromAppStore.appReducer),
    EffectsModule.forRoot([
      NavigationEffects,
      AuthenticationEffects,
      ToastNotificationEffects,
    ]),
    StoreRouterConnectingModule.forRoot(),
    ToastNotificationModule,
    TopBarComponent,
    MortgageLoanModule,
    ReceiptsModule,
    SpinnerComponent,
  ],
  bootstrap: [AppComponent],
  providers: [TransactionService, AuthenticationService, MortgageLoanService],
})
export class AppModule {}
