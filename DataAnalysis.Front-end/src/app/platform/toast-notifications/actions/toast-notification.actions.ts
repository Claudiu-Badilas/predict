import { createAction, props } from '@ngrx/store';
import { ToastType } from '../models/toast-type.model';

export const showToast = createAction(
  '[Toast] Show Toast',
  props<{ message: string; toastType?: ToastType }>()
);
