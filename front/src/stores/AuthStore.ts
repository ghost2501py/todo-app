import { makeAutoObservable } from 'mobx';

export class AuthStore {
  isAuthenticated = false;
  user: any = null;

  constructor() {
    makeAutoObservable(this);
  }

  setAuthenticated(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
  }

  setUser(user: any) {
    this.user = user;
  }
}

export const authStore = new AuthStore();

