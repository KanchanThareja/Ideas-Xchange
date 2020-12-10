import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/user/';
@Injectable({providedIn: "root"})
export class AuthService {
  private token: string;
  private authStatusListener = new Subject<boolean>();
  private userAuthenticated: boolean = false;
  private tokenTimer: any;
  private userId: string;
  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getAuthStatus() {
    return this.userAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  createUser(email, password) {
    const authData: AuthData = {email: email, password: password};
    this.http.post(BACKEND_URL + "signup", authData)
    .subscribe(response =>
      console.log(response));
  }

  login(email: string, password: string) {
    const authData: AuthData = {email: email, password: password};
    this.http.post<{token: string, expiresIn: number, userId: string}>(BACKEND_URL + "login", authData)
    .subscribe(response =>{
      this.token = response.token;
      if(this.token) {
        const expiresInDuration = response.expiresIn;

        this.setAuthTimer(expiresInDuration);
        this.userId = response.userId;
        this.userAuthenticated = true;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationTime = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(this.token, expirationTime, this.userId);
        this.router.navigate(['/']);
      }
    });
  }

  setAuthTimer(expiresInDuration) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expiresInDuration * 1000);
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    const now = new Date();

    let expiresIn = 0;
    if(authInfo)
    expiresIn = authInfo.expirationDate.getTime() - now.getTime();

    if(expiresIn > 0) {
      this.token = authInfo.token;
      this.userAuthenticated = true;
      this.userId = authInfo.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.userAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if(!token || !expirationDate) return;

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    };
  }
}
