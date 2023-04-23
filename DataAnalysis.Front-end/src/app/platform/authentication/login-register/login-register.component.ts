import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthenticationValidators } from 'src/app/platform/authentication/login-register/validators/authentication-validator';
import { AuthenticationAction } from './models/authentication-actions.enum';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import { select, Store } from '@ngrx/store';
import * as AuthActions from '../actions/authentication.actions';
import { combineLatest, debounceTime, filter, Subject, takeUntil } from 'rxjs';
import * as fromState from 'src/app/store/app-state.reducer';
import * as NavigationAction from 'src/app/store/navigation-state/navigation.actions';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent implements OnDestroy {
  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  registerMessage: string = `You do not have an account, start journey with us from`;
  loginMessage: string = `You already have an account, just log in from`;
  isRegisterActive: boolean = false;
  isVisiblePassword: boolean = false;

  credentialForm: FormGroup = this.formBuilder.group(
    {
      authenticationAction: new FormControl(AuthenticationAction.Login),
      authenticationMessage: new FormControl(this.registerMessage),
      email: new FormControl('', [
        Validators.required,
        AuthenticationValidators.email,
      ]),
      password: new FormControl('', [
        Validators.required,
        AuthenticationValidators.minLength(4),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        AuthenticationValidators.minLength(4),
      ]),
    },
    { validators: AuthenticationValidators.identityRevealedValidator }
  );

  constructor(
    private store: Store<fromAppStore.AppState>,
    private formBuilder: FormBuilder
  ) {
    combineLatest([
      this.store.pipe(select(fromState.getRouterUrl)),
      this.store.pipe(select(fromState.selectRouteNestedParams)),
    ])
      .pipe(
        debounceTime(500),
        filter(
          ([url, params]) => url?.startsWith(`/authentication`) && !!params
        ),
        takeUntil(this.ngUnsubscribe$.asObservable())
      )
      .subscribe(([, params]) => {
        const authAction: AuthenticationAction = params['auth-type'];
        this.isRegisterActive = authAction === AuthenticationAction.Register;
        this.updateCredentialForm();
      });
  }

  isInvalidInput(inputName: string) {
    return (
      this.getInputValue(inputName) &&
      this.credentialForm.get(inputName).invalid &&
      (!this.credentialForm.get(inputName).pristine ||
        this.credentialForm.get(inputName).dirty)
    );
  }

  getInputValidationError(inputName: string) {
    return this.credentialForm.controls[inputName]?.errors['value'];
  }

  getInputValue(inputName: string) {
    return this.credentialForm.controls[inputName]?.value;
  }

  onSubmitChanges(form: FormGroup) {
    const credentials = {
      email: form.controls['email'].value,
      password: form.controls['password'].value,
    };
    if (!this.isRegisterActive) {
      this.store.dispatch(AuthActions.login(credentials));
    } else {
      this.store.dispatch(AuthActions.register(credentials));
    }
  }

  updateCredentialForm() {
    this.credentialForm.reset();
    this.credentialForm.patchValue({
      ...this.credentialForm,
      authenticationAction: !this.isRegisterActive
        ? AuthenticationAction.Login
        : AuthenticationAction.Register,
      authenticationMessage: !this.isRegisterActive
        ? this.registerMessage
        : this.loginMessage,
    });
  }

  onChangeAuthAction() {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/authentication/${
          !this.isRegisterActive
            ? AuthenticationAction.Register
            : AuthenticationAction.Login
        }`,
      })
    );
  }

  isFormInvalid() {
    if (
      this.getInputValue('authenticationAction') ===
      AuthenticationAction.Register
    ) {
      return (
        this.isInvalidInput('email') === null ||
        this.isInvalidInput('password') === null ||
        this.isInvalidInput('confirmPassword') === null ||
        this.isInvalidInput('email') ||
        this.isInvalidInput('password') ||
        this.isInvalidInput('confirmPassword') ||
        this.credentialForm.errors?.['isMatchPasswords']
      );
    }
    return (
      this.isInvalidInput('email') === null ||
      this.isInvalidInput('password') === null ||
      this.isInvalidInput('email') ||
      this.isInvalidInput('password')
    );
  }

  onChangePasswordInputType() {
    this.isVisiblePassword = !this.isVisiblePassword;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }
}
