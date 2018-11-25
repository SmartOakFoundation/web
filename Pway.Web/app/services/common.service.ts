import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { JsonResponse, JsonResponseStatus } from "../models/jsonResponse.model";
import { AppContextService } from "./appContext.service";
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/catch';

export abstract class CommonService {
    protected actionUrl: string;

    constructor(
        protected _http: HttpClient,
        protected _appContext: AppContextService) {

        this.actionUrl = _appContext.hostname;
    }

    public get<T>(url:string) : Observable<T> {
        const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        var result = this._http.get<JsonResponse>(url, { headers: headers });
        return result.map(response => {
            return this.handleResponse(response);
        }).catch((err: HttpErrorResponse) => {
            throw this.handleNetworkError(err)
        });
    }
   
    public post<T>(url: string, data:string): Observable<T> {
        const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        return this._http.post<JsonResponse>(url, data, { headers: headers }).map(response => {
            return this.handleResponse(response);
        }).catch((err: HttpErrorResponse) => {
            throw this.handleNetworkError(err)
        });
       
    }

    public postFunc<T>(url: string, data: string, successFunc:any): Observable<T> {
        const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        return this._http.post<JsonResponse>(url, data, { headers: headers }).map(response => {
            if (response.status == JsonResponseStatus.OK) 
                successFunc(JSON.parse(response.data));
            return this.handleResponse(response);
        }).catch((err: HttpErrorResponse) => {
            throw this.handleNetworkError(err)
        });;
    }

    private handleResponse(response: JsonResponse): any {
        if (response.status == JsonResponseStatus.OK) {
            if (response.data)
                return JSON.parse(response.data);
            else
                return 0;
        }
            
        else if (response.status == JsonResponseStatus.Error) {
            if (response.messages)
                throw JSON.parse(response.messages);
            else
                throw 'Ups something goes wrong (JSON error)...';
        }
    }

    private handleNetworkError(error: HttpErrorResponse) {
        if (typeof error === "string")
            return error; //catched internal error 
        else if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return 'Ups something goes wrong (networking error)...';
    };
}