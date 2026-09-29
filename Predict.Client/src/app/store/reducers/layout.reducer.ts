import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface State {
  loading: boolean;
  minimumVisibleMs: number;
}

export const LayoutStore = signalStore(
  { providedIn: 'root' },
  withState<State>({ loading: false, minimumVisibleMs: 500 }),
  withMethods((state) => ({
    spinnerOn(minimumVisibleMs = 500): void {
      patchState(state, { loading: true, minimumVisibleMs });
    },
    spinnerOff(): void {
      patchState(state, { loading: false });
    },
  })),
);
