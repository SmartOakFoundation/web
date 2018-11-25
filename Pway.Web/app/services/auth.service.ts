import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders,} from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { JwtHelperService } from '@auth0/angular-jwt';
import { JsonResponse, JsonResponseStatus } from "../models/jsonResponse.model";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { User } from "../models/user.model";
import { AppContextService } from "./appContext.service";
import { CommonService } from "./common.service";

@Injectable()
export class AuthService extends CommonService {

    jwtHelper :JwtHelperService = new JwtHelperService();

    private onLoginChanged: BehaviorSubject<User> = new BehaviorSubject<User>(this.getUser());
    public OnLoginChanged = (): Observable<User> => {
        return this.onLoginChanged.asObservable();
    }

    constructor(
        _http: HttpClient,
        private _router: Router,
        private _route: ActivatedRoute,
        _appContext: AppContextService) {

        super(_http, _appContext);

        this._route.queryParams.subscribe(params => this.handleParameters(params));
    }

    private handleParameters(params: any) {
        var code = params["code"];
        var userId = params["userId"];

        if (userId != undefined && code != undefined)
            this.confirmEmail(userId, code).subscribe(result => this.handleEmailConfirmation(result));
    }

    private handleEmailConfirmation(result: any) {
        this.setToken(result);
        this.onLoginChanged.next(this.getUser());
    }

    public updateAddress(token: string) {
        this.setToken(token);
        this.onLoginChanged.next(this.getUser());
    }

    public createAccount(email: string, password: string, ethereumAccount: string) {

        var url = this.actionUrl + "api/account/signup";
        var json = JSON.stringify({ email: email, password: password, ethereumAccount: ethereumAccount });
        return this.post<boolean>(url, json);
    }

    public signIn(email: string, password: string) {
        var url = this.actionUrl + "api/account/signIn";
        var json = JSON.stringify({ email: email, password: password});
        return this.postFunc<JsonResponse>(url, json, (result:any) => {
            this.setToken(result);
            this.onLoginChanged.next(this.getUser());
        });
    }

    public getUser(): User {
        if (this.isLogged()) {
            var token = this.getToken();
            var decodedToken = this.jwtHelper.decodeToken(token);
            return <User>{ email: decodedToken.userId, account: decodedToken.account, isAdmin: decodedToken.isAdmin=='1' };
        }
        else
            return <User>{ email: "", account: ""};
    }

    public confirmEmail = (userId:string, code:string): Observable<boolean> => {
        var url = this.actionUrl + "api/account/ConfirmEmail/";
        var json = JSON.stringify({ userId,  code });
        return this.post<boolean>(url, json);
    }

    public recoverPassword(userId:string, password: string, repeatPassword: string, token:string)  {
        var url = this.actionUrl + "api/account/recoverPassword";
        var json = JSON.stringify({ userId, password, token });
        return this.postFunc<JsonResponse>(url, json,(result: any) => {
            this.setToken(result);
            this.onLoginChanged.next(this.getUser());
        });
    }

    public resetPassword = (email:string): Observable<boolean> => {
        var url = this.actionUrl + "api/account/resetPassword";
        var json = JSON.stringify(email);
        return this.post<boolean>(url, json);
    }

    public getToken(): any {
        return localStorage.getItem('token');
    }
    public setToken(token: string) {
      
        localStorage.setItem('token', token);
    }

    public logOut = () => {
        localStorage.removeItem('token');
        this.onLoginChanged.next(<User>{ email: "", account: "" });
        this._router.navigateByUrl("/home");
    }

    public isAdmin(): boolean {
        if (this.isLogged()) {
            return this.getUser().isAdmin;
        }
        else
            return false;
    }

    public isLogged(): boolean {
        var token = this.getToken();
        if (token)
            return true;//jwt.tokenNotExpired(token);
        else
            return false;
    }
    
}