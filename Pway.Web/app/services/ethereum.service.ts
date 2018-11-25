import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergeMap';
import { Subscription } from "rxjs/Subscription";
import { Observable, BehaviorSubject } from "rxjs";
import 'rxjs/add/operator/map';
import { timer } from 'rxjs';
import { Observer } from 'rxjs/Rx';

import { AppContextService } from './appContext.service';
import { CommonService } from './common.service';
import { HelperService } from './helper.service';
import { ServiceEvent } from '../models/serviceEvent';
import { TransactionTracker } from '../helpers/transactionTracker';

declare let Web3: any;
declare let window: any;
declare let location: any;

@Injectable()
export class EthereumService extends CommonService implements OnDestroy {

    private networkId: number;
    public web3: any;

    public currentAccount: string = "";
    private isLedger: boolean = false;
    private refreshCount: number = 0;
    noWeb3: boolean;

    private stateChanged: BehaviorSubject<any> = new BehaviorSubject({ event: ServiceEvent.Idle });
    private subUpdateState: Subscription;

    constructor(
        _http: HttpClient,
        private _helperService: HelperService,
        public _appContext: AppContextService,
        private _zone: NgZone) {
        super(_http, _appContext);

        this.checkAndInstantiateWeb3();
        
    }

    public getNetwork(): string {
        switch (parseInt(this.networkId.toString())) {
            case 1: return "Mainnet";
            case 2: return "Morden(deprecated)";
            case 3: return "Ropsten";
            case 4: return "Rinkeby";
            case 42: return "Kovan";
            default: return "";
        }
    }

    public getAccount() {
        return this.currentAccount;
    }

    private checkAndInstantiateWeb3 = () => {

        //new metamask
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            // Request account access if needed
            window.ethereum.enable().then(() => {
                this.web3 = window.web3;
                this.networkId = this.web3.version.network;

                console.log("Network ", this.getNetwork());

                this._appContext.OnContextLoaded().subscribe(
                    result => {
                        if (result != null && result.TotalSupply) {
                            console.log(result);
                            if (this.getNetwork().toLowerCase() == this._appContext.ethereumNetwork.toLowerCase()) {
                                this.stateChanged.next({ event: ServiceEvent.MetamaskDetected });
                                this.subUpdateState = timer(400, 1000).subscribe(() => this.updateState());
                            } else {
                                this.stateChanged.next({ event: ServiceEvent.MetamaskDetectedWrongNetwork });
                                this.subUpdateState = timer(400, 1000).subscribe(() => this.updateState());
                            }
                        }
                    },
                    err => { });
            }).catch(() => {
                this.web3 = null;
                this._zone.run(() => this.stateChanged.next({ event: ServiceEvent.MetamaskNotDetected }));
            });
        }
        else if (typeof window.web3 !== 'undefined') {
            this.web3 = new Web3(window.web3.currentProvider);
            this.networkId = this.web3.version.network;
            this._zone.run(() => {
                console.log("Network ", this.getNetwork());

                this._appContext.OnContextLoaded().subscribe(
                    result => {
                        if (result != null && result.TotalSupply) {
                            console.log(result);
                            if (this.getNetwork().toLowerCase() == this._appContext.ethereumNetwork.toLowerCase()) {
                                this.stateChanged.next({ event: ServiceEvent.MetamaskDetected });
                                this.subUpdateState = timer(400, 1000).subscribe(() => this.updateState());
                            } else {
                                this.stateChanged.next({ event: ServiceEvent.MetamaskDetectedWrongNetwork });
                                this.subUpdateState = timer(400, 1000).subscribe(() => this.updateState());
                            }
                        }
                    },
                    err => { });
            });
        }
        else {

            const Web3Backup = require('web3');
            const ProviderEngine = require('web3-provider-engine');
            const RpcSubprovider = require('web3-provider-engine/subproviders/rpc');
            const Web3Ledger = require('ledger-wallet-provider');
            console.log(Web3Backup);
            console.log(Web3Ledger);
            var factory = Web3Ledger.default;
            var engine = new ProviderEngine();
            var web3local = new Web3Backup(engine);
            console.log('factory loading');
            const networkId = 4; // for rinkeby testnet
            factory(() => networkId, `44'/60'/0'/0`).then((instance: any) => {
                console.log('factory loaded');
                if (instance.isSupported) {
                    this.isLedger = true;
                    console.log('ledger supported');
                    instance.getAccounts(console.log);
                    this.web3 = web3local;
                    engine.addProvider(instance);
                    engine.addProvider(new RpcSubprovider({ rpcUrl: 'https://rinkeby.infura.io' })); // you need RPC endpoint
                    engine.start();

                    this._zone.run(() => {
                        this.stateChanged.next({ event: ServiceEvent.MetamaskDetected });
                        this.subUpdateState = timer(400, 1000).subscribe(() => this.updateState());
                    });
                } else {
                    console.log('ledger NOT supported');
                    this._zone.run(() => this.stateChanged.next({ event: ServiceEvent.MetamaskNotDetected }));
                }
            });
        }
    }

    sendEthToAddress = (address: string, amount: string, gasLimit: number): Observable<any> => {
        let from = this.currentAccount;

        return Observable.create((observer: Observer<any>) => {
            this.web3.eth.sendTransaction({
                gas: gasLimit,
                to: address,
                value: amount,
                from: from
            },  (err: any, hash: any) => {
                if (err) {
                    observer.error(err);
                }
                else {
                    observer.next({ tx: hash, status: 1 });

                    new TransactionTracker(hash, this, 720, 0, (err:any, result:number) => {
                        if (result > 0)
                            observer.error(err);
                        else {
                            observer.next({ status: 2 });
                            observer.complete();
                        }
                    });

                    
                }
            });
        });
    }
    
    signMsg = (msgParams: string): Observable<boolean> => {
        let from = this.currentAccount;

        return Observable.create((observer: Observer<string>) => {
            this.web3.currentProvider.sendAsync({
                method: 'personal_sign',
                params: ["0x" + this._helperService.toHex(msgParams), from],
                from: from,
            }, function (err: any, result: any) {
                if (result.error) {
                    observer.error(err);
                }
                else {
                    observer.next(result);
                    observer.complete();
                }
            })
        });
    }

    public getUserWithdrawCode = (email:string): Observable<string> => {
        var url = this.actionUrl + "api/EthData/getUserWithdrawCode";
        var json = JSON.stringify(email);
        return this.post<string>(url, json);
    }

    public checkUserWithdrawCode = (userId: string): Observable<string> => {
        var url = this.actionUrl + "api/EthData/checkUserWithdrawCode";
        var json = JSON.stringify(userId);
        return this.post<string>(url, json);
    }

    private updateState() {
        if (this._appContext.isReady && (this.isLedger == false || this.refreshCount == 0)) {
            this.refreshAccounts();
            this.refreshCount = this.refreshCount + 1;
        }
    }

    //0 - init
    //1 - metamask locked
    //2 - metamask unlocked
    //3 - metmakask error

    private internalState = 0;
    private refreshAccounts = () => {
        if (this.web3) {

            if (this.web3.version.network != this.networkId && this.networkId != undefined)
                location.reload();
                //this.networkId = this.web3.version.network;

            this.web3.eth.getAccounts((err: any, accs: any) => {
                if (err != null && this.internalState !=3) {
                    this.internalState = 3;
                    this._zone.run(() => {
                        this.currentAccount = "";
                        this.stateChanged.next({ event: ServiceEvent.AccountNotFound })
                    });
                }
                else if (accs.length == 0 && this.internalState != 1) {
                    this.internalState = 1;
                    this._zone.run(() => {
                        this.currentAccount = "";
                        this.stateChanged.next({ event: ServiceEvent.AccountNotFound })
                    });
                }
                else if (accs.length >0 && this.currentAccount !== accs[0]) {
                    this.internalState = 2;
                    this._zone.run(() => this.handleAccountChanged(accs));
                }
            });
        }
    }

    private handleAccountChanged(accs: any) {
        let lastAccount = this.currentAccount;
        this.currentAccount = accs[0];

        this.stateChanged.next({ event: ServiceEvent.AccountChanged, lastAccount: lastAccount, newAccount: this.currentAccount });
    }

    public OnStateChanged = () => {
        return this.stateChanged.asObservable();
    }

    ngOnDestroy = () => {
        this.subUpdateState.unsubscribe();
    }
}