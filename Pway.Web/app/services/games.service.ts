import { Injectable, NgZone } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Observer } from 'rxjs/Observer';
import { HttpClient } from "@angular/common/http";
import 'rxjs/add/operator/map';
import { Game } from '../models/game.model';
import { GameKey } from '../models/gamekey.model';
import { EthereumService } from "./ethereum.service";
import { AppContextService } from './appContext.service';
import { CommonService } from './common.service';
import { TransactionTracker } from '../helpers/transactionTracker';

const pwayGamesStoreAbi = require('../../abi/PwayGamesStore.json');


@Injectable()
export class GamesService extends CommonService {

    private storeInstance: any = undefined;

    constructor(
        _http: HttpClient,
        private _zone: NgZone,
        private _ethereumService: EthereumService,
        _appContext: AppContextService) {
        super(_http, _appContext);

    }

    private getContractInstance() {
        if (this._ethereumService.web3 != undefined && this._ethereumService.web3.currentProvider != undefined) {
            if (this.storeInstance == undefined) {
                var storeContract = this._ethereumService.web3.eth.contract(pwayGamesStoreAbi);
                this.storeInstance = storeContract.at(this._appContext.pwayStoreAddress);
            }

            return this.storeInstance;
        }
        else
            throw 'Web3 is not connected';
    }
    public buyGame(gameId: number): Observable<any> {
        return Observable.create((observer: Observer<any>) => {

            this.getContractInstance().buyGame.estimateGas(gameId, { from: this._ethereumService.currentAccount },
                (err: any, gasEstimation: any) => {
                    if (!err) {
                        console.log(gasEstimation);

                        if (gasEstimation === 10000000) {
                            this._zone.run(() => observer.error(err));
                        } else {
                            this.getContractInstance().buyGame(gameId, { from: this._ethereumService.currentAccount },
                                (err: any, tx: any) => {
                                    if (!err) {
                                        observer.next({ status: 1 });
                                        new TransactionTracker(tx, this._ethereumService, 240, 0, (err: any, result: number) => {
                                            if (result > 0)
                                                observer.error(err);
                                            else {
                                                observer.next({ status: 2 });
                                                observer.complete();
                                            }
                                        });
                                       
                                    }
                                    else
                                        observer.error(err);
                                });
                        }
                    }
                    else
                        this._zone.run(() => observer.error(err));

                });
        });
    }

    public changePwayRate(pwayRate: number): Observable<boolean> {
        return Observable.create((observer: Observer<boolean>) => {
            this.getContractInstance().changePwayRate(pwayRate, { from: this._ethereumService.currentAccount },
                (err: any, result: any) => {
                    if (!err)
                        this._zone.run(() => {
                            observer.next(true);
                            observer.complete();
                        });
                    else
                        this._zone.run(() => observer.error(err));
                });

        });
    }

    public getPwayRate(): Observable<number> {
        return Observable.create((observer: Observer<number>) => {
            this.getContractInstance().numberOfUSDfor1000PWay({ from: this._ethereumService.currentAccount },
                (err: any, result: any) => {
                    if (!err)
                        this._zone.run(() => {
                            observer.next(result);
                            observer.complete();
                        });
                    else
                        this._zone.run(() => observer.error(err));
                });

        });
    }

    getGamesList = (): Observable<Game[]> => {
        var url = this.actionUrl + "api/games";
        return this.get<Game[]>(url)
    }

    getGame = (id: number): Observable<Game> => {
        var url = this.actionUrl + "api/games/" + id;
        return this.get<Game>(url);
    }

    getGameKeys = (_game: Game): Observable<GameKey[]> => {
        var url = this.actionUrl + "api/games/gamekeys/" + _game.EthereumId;
        return this.get<GameKey[]>(url);
    }

    getUsersGames = (): Observable<Game[]> => {
        var url = this.actionUrl + "api/games/usersgames";
        return this.get<Game[]>(url);
    }

}