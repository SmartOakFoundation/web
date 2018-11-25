import { EthereumService } from "../services/ethereum.service";
import { interval, Subscription } from "rxjs";

export class TransactionTracker {
    private subscribtion: Subscription;

    private checkBlock = false;
    private txBlockNumber = 0;

    constructor(
        public txID: string,
        protected _ethereum: EthereumService,
        private timeout: number,
        private blockConfirmationNumber: number,
        public callback: any
    ) {

        this.subscribtion = interval(1000).subscribe(() => this.refreshStatus())
    }

    refreshStatus() {
        if (!this.checkBlock)
            this.readTransaction();
        else
            this.readBlock();
    }

    private readTransaction() {
        this._ethereum.web3.eth.getTransaction(this.txID, (err: any, result: any) => {
            if (err != null) {
                this.subscribtion.unsubscribe();
                this.callback("Cant get transaction", 1);
            }
            else if (result != null) {
                if (result.blockNumber) {
                    this.txBlockNumber = result.blockNumber;

                    this._ethereum.web3.eth.getTransactionReceipt(this.txID, (err: any, recipe: any) => {
                        console.log(recipe)
                        if (recipe.gasUsed < 100) {
                            this.subscribtion.unsubscribe();
                            this.callback("Code not executed. Out of gas.", 1);
                        }
                        else if (recipe.status != 1) {
                            console.error("Revert");
                            this.subscribtion.unsubscribe();
                            this.callback("Execution failed", 1);
                        }
                        else {
                            if (this.blockConfirmationNumber == 0) {
                                this.subscribtion.unsubscribe();
                                this.callback(err, 0);
                            }
                            else
                                this.checkBlock = true;
                        }
                    });
                }
            }
            else if (this.timeout <= 0) {
                this.subscribtion.unsubscribe();
                this.callback("Timout", 1);
            }

            this.timeout--;
        });
    }

    private readBlock() {
        this._ethereum.web3.eth.getBlock("latest", (err: any, result: any) => {
            if (err) {
                this.subscribtion.unsubscribe();
                this.callback(err, 1);
            }
            else {
                if (this.txBlockNumber + this.blockConfirmationNumber <= result.number) {
                    this.subscribtion.unsubscribe();
                    this.callback(null, 0);
                }
            }
        });
    }

}
