import { Injectable, Injector } from '@angular/core';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import {
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(
        private injector: Injector
    ) { }

    private handleAuthError(err: HttpErrorResponse): Observable<any> {
        //handle your auth error or rethrow
        if (err.status === 401 || err.status === 403) {
            let auth = this.injector.get(AuthService);
            //navigate /delete cookies or whatever
            auth.logOut();
            // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
            return Observable.of(err.message);
        }
        return Observable.throw(err);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let auth = this.injector.get(AuthService);

        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${auth.getToken()}`
            }
        });
        return next.handle(request).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                //var hed = event.headers.keys();
                //if (event.headers.has(this._configuration.HeaderUpdateToken)) {
                //    this.auth.setToken(event.headers.get(this._configuration.HeaderUpdateToken));
                //}
            };
        }).catch(err => this.handleAuthError(err));
    }




}