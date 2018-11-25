import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Observer } from 'rxjs/Observer';
import { HttpClient } from "@angular/common/http";
import 'rxjs/add/operator/map';
import { EthereumService } from "./ethereum.service";
import { AppContextService } from './appContext.service';
import { CommonService } from './common.service';

@Injectable()
export class UserService extends CommonService {

    constructor(
        _http: HttpClient,
        _appContext: AppContextService,
        private _ethService: EthereumService) {
        super(_http, _appContext)
    }

    changeAddress = (address: string) : Observable<any> => {
        var url = this.actionUrl + "api/account/changeAddress/" + address ;
        return this.get<any>(url);
    };

    authenticateUser = (): Observable<boolean> => {
        return Observable.create((observer: Observer<boolean>) => {
            var url = this.actionUrl + "api/login/getmessagetosign";
            var urlVerify = this.actionUrl + "api/login/validate/" + this._ethService.currentAccount + "/";

            this.get<string>(url).subscribe((firstResult) => {
                this._ethService.signMsg(firstResult).subscribe((secondResult: any) => {
                    urlVerify = urlVerify + secondResult.result;
                    this.get<boolean>(urlVerify).subscribe((thirdResult) => {
                        observer.next(thirdResult);
                        observer.complete();
                    }, (err) => {
                        observer.error(err);
                    });
                }, (err) => {
                    observer.error(err);
                });
            }, (err) => {
                observer.error(err);

            });
        });
    }

    isUserAuthenticated = (): Observable<boolean> => {
        var url = this.actionUrl + "api/login/isuserauthenticated/" + this._ethService.currentAccount;
        return this.get<boolean>(url)
    }

}