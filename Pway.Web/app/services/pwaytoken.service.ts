import { Injectable, NgZone } from '@angular/core';

import { Observable} from "rxjs";
import 'rxjs/add/operator/map';
import { Observer } from 'rxjs/Observer';

import { EthereumService } from './ethereum.service';
import { AppContextService } from './appContext.service';
import { BigNumber } from 'bignumber.js';
import { TransactionTracker } from '../helpers/transactionTracker';

const pwayTokenAbi = require('../../abi/PwayToken.json');


@Injectable()
export class PwayTokenService {

    currentNetworkId: string;
    balance: string;

    private tokenInstance: any = undefined;

    constructor(
        private _zone: NgZone,
        private _ethereumService: EthereumService,
        private _appContext: AppContextService) {
    }

    private getContractInstance() {
        if (this._ethereumService.web3 != undefined && this._ethereumService.web3.currentProvider != undefined) {
            if (this.tokenInstance == undefined) {
                var tokenContract = this._ethereumService.web3.eth.contract(pwayTokenAbi);
                this.tokenInstance = tokenContract.at(this._appContext.pwayTokenAddress);
            }

            return this.tokenInstance;
        }
        else
            throw 'Web3 is not connected';
    }

    getPwayBalance = (): Observable<BigNumber> => {

        return Observable.create((observer: Observer<string>) => {
            this.getContractInstance().balanceOf(
                this._ethereumService.currentAccount, (err: any, value: any) => {
                    if (!err) {
                        this._zone.run(() => {
                            observer.next(value);
                            observer.complete();
                        });
                    }
                    else
                        this._zone.run(() => observer.error(err));
                });
        });
    }

    approve = (spender:string,  amount:string): Observable<any> => {
        return Observable.create((observer: Observer<any>) => {
            this.getContractInstance().approve(spender, amount, { from: this._ethereumService.currentAccount }, (err: any, tx: any) => {
                if (!err) {
                    this._zone.run(() => {
                        new TransactionTracker(tx, this._ethereumService, 180, 0, (err: any, result: number) => {
                            if (result > 0)
                                observer.error(err);
                            else {
                                observer.next({ status: 2, res: result});
                                observer.complete();
                            }
                        });
                        observer.next({ status: 1 });
                    });
                } else {
                    console.log(err);
                    this._zone.run(() => observer.error(err));
                }
            });
        });
    }

    allowance = (spender: string): Observable<BigNumber> => {
        return Observable.create((observer: Observer<string>) => {
            this.getContractInstance().allowance(this._ethereumService.currentAccount, spender, (err: any, value: any) => {
                if (!err) {
                    this._zone.run(() => {
                        observer.next(value);
                        observer.complete();
                    });
                } else {
                    console.log(err);
                    this._zone.run(() => observer.error(err));
                }
            });
        });
    }

    transfer = (to: string, amount: string): Observable<boolean> => {
        return Observable.create((observer: Observer<boolean>) => {
            this.getContractInstance().transfer(to, amount, { from: this._ethereumService.currentAccount }, (err: any, value: any) => {
                if (!err) {
                    this._zone.run(() => {
                            observer.next(true);
                            observer.complete();
                        });
                }
                else {
                    console.log(err);
                    this._zone.run(() => observer.error(err));
                }
            });
        });
    }
    

}