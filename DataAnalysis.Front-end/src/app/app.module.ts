import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AuthenticationService } from 'src/app/platform/services/authentication.service';
import { TopBarModule } from 'src/app/shared/components/top-bar/top-bar.module';

import { AppComponent } from 'src/app/app.component';

import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { AppRouting } from 'src/app/app.routing';
import { TransactionService } from 'src/app/modules/transaction-module/services/transaction.service';
import { TransactionModule } from 'src/app/modules/transaction-module/transaction.module';
import { AuthenticationModule } from 'src/app/platform/authentication/authentication.module';
import { AuthenticationEffects } from 'src/app/platform/authentication/effects/authentication.effects';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import { NavigationEffects } from 'src/app/store/navigation-state/navigation.effects';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastNotificationEffects } from 'src/app/platform/toast-notifications/effects/toast-notification.effects';
import { ToastNotificationModule } from 'src/app/platform/toast-notifications/toast-notification.module';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { MortgageService } from './modules/mortgage-module/services/mortgage.service';
import { MortgageModule } from './modules/mortgage-module/mortgage.module';
import { MortgageEffects } from './modules/mortgage-module/state-management/mortgage.effects';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRouting,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    TransactionModule,
    AuthenticationModule,
    StoreModule.forRoot(fromAppStore.appReducer),
    EffectsModule.forRoot([
      NavigationEffects,
      AuthenticationEffects,
      ToastNotificationEffects,
      MortgageEffects,
    ]),
    StoreRouterConnectingModule.forRoot(),
    ToastNotificationModule,
    TopBarModule,
    MortgageModule,
  ],
  bootstrap: [AppComponent],
  providers: [TransactionService, AuthenticationService, MortgageService],
})
export class AppModule {}
