import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export namespace CustomValidatorsUtil {
  const emailRegex = new RegExp(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,4})+$/);

  export const email = (control: AbstractControl): ValidationErrors | null => {
    const forbidden = !emailRegex.test(control?.value);
    return forbidden
      ? {
          value: 'Please enter a valid email address',
        }
      : null;
  };

  export const minLength = (min: number): ValidatorFn | null => {
    return (control: AbstractControl): { [key: string]: string } | null => {
      if (control?.value?.length < min) {
        return { value: `Please enter password longer then ${min} characters` };
      }
      return null;
    };
  };
}
