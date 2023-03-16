import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/validators/custom-validator';
import { AuthenticationAction } from './models/authentication-actions.enum';
import * as fromAppStore from 'src/app/store/app-state.reducer';
import { Store } from '@ngrx/store';
import * as AuthActions from '../actions/authentication.actions';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent {
  credentialForm: FormGroup;
  registerMessage: string = `You do not have an account, start journey with us from`;
  loginMessage: string = `You already have an account, just log in from`;

  constructor(
    private store: Store<fromAppStore.AppState>,
    private formBuilder: FormBuilder
  ) {
    this.credentialForm = this.formBuilder.group({
      authenticationAction: new FormControl(AuthenticationAction.Login),
      authenticationMessage: new FormControl(this.registerMessage),
      email: new FormControl('', [CustomValidators.email]),
      password: new FormControl('', [CustomValidators.minLength(4)]),
    });
  }

  isValidateInputValue(inputName: string) {
    return (
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
    if (!this.isRegisterFromSelected()) {
      this.store.dispatch(AuthActions.login(credentials));
    } else {
      this.store.dispatch(AuthActions.register(credentials));
    }
  }

  onChangeAuthAction() {
    if (!this.isRegisterFromSelected()) {
      this.credentialForm.addControl(
        'confirmPassword',
        new FormControl(null, [CustomValidators.minLength(4)])
      );
      this.credentialForm.reset();
      this.credentialForm.patchValue({
        ...this.credentialForm,
        authenticationAction: AuthenticationAction.Register,
        authenticationMessage: this.loginMessage,
      });
    } else {
      this.credentialForm.removeControl('confirmPassword');
      this.credentialForm.reset();
      this.credentialForm.patchValue({
        ...this.credentialForm,
        authenticationAction: AuthenticationAction.Login,
        authenticationMessage: this.registerMessage,
      });
    }
  }

  isRegisterFromSelected() {
    return (
      this.getInputValue('authenticationAction') ===
      AuthenticationAction.Register
    );
  }
}
