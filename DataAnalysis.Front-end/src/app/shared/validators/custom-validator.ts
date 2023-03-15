import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CustomValidatorsUtil } from '../utils/custom-validator.util';

export namespace CustomValidators {
  export const email = (control: AbstractControl): ValidationErrors | null =>
    CustomValidatorsUtil.email(control);

  export const minLength = (min: number): ValidatorFn =>
    CustomValidatorsUtil.minLength(min);
}
