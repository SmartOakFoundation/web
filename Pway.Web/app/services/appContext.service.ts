import { Injectable, Injector, NgZone } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Observable,  BehaviorSubject } from 'rxjs';
import { EthereumService } from './ethereum.service';


@Injectable()
export class AppContextService  {

    public pwayStoreAddress: string;
    public pwayCompanyAddress: string;
    public pwayTokenAddress: string;

    public hostname: string;
    
    public ethereumNetwork: string;

    public isReady = false;

    private onContextLoaded: BehaviorSubject<any> = new BehaviorSubject<any>(this.isReady);
    public OnContextLoaded = (): Observable<any> => {
        return this.onContextLoaded.asObservable();
    }

    constructor(private injector: Injector,
        private _zone: NgZone) {
        this.hostname = window.location.origin + "/";
    }

    public init = (_ethereumService: EthereumService) => {
        let http = this.injector.get(HttpClient) as HttpClient;
        const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        http.get<any>(this.hostname + 'api/EthData/getAddr', { headers: headers }).subscribe(result=> {

            if (result.status) {
                //TODO error handling
            }
            else {
                var data = JSON.parse(result.data);
                this.pwayStoreAddress = data.PwayStoreAddress;
                this.pwayCompanyAddress = data.PwayCompanyAddress;
                this.pwayTokenAddress = data.PwayTokenAddress;
                this.ethereumNetwork = data.EthereumNetwork;

                this.isReady = true;
                this.handleICOData(result)
            }
        });

        
    }

    public isProd() {
        return this.ethereumNetwork == 'mainnet';
    }

    private handleICOData(_icoData: any) {
        this._zone.run(() => {
            this.onContextLoaded.next(_icoData);
        });
    }

}