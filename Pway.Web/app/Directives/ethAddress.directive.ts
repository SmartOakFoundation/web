import { Directive, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';
import { HelperService } from '../services/helper.service';

@Directive({
    selector: '[ethAddress]',
    providers: [{ provide: NG_VALIDATORS, useExisting: EthAddressValidator, multi: true }]
})
export class EthAddressValidator implements Validator {
    @Input('ethAddress') forbiddenName: string;

    constructor(
        private _helperService: HelperService) {

    }

    validate(c: AbstractControl): ValidationErrors  {
        // self value
        let v = c.value;
        var isValid = this._helperService.isAddress(v);
        const message = {
            'invalidEthAddress': v + " is not valid ethereum address"
        };

        return isValid ? {} : message;
    }
}