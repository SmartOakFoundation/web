import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber } from 'bignumber.js';
import { strict } from 'assert';

@Pipe({ name: 'PwayTokenPrec' })
export class PwayTokenPrec implements PipeTransform {
    transform(value: BigNumber): string {
        let retVal = "";
        if (Object.prototype.toString.call(value) === '[object String]') {
            retVal = new BigNumber(value).div(new BigNumber(10).pow(11)).toString();
        }
        else if (value != undefined)
            retVal = value.div(new BigNumber(10).pow(11)).toString();
        else
            return "";
        if (retVal.indexOf('.') != -1 && retVal.indexOf('.') < retVal.length - 2) {
            retVal = retVal.substr(0, retVal.indexOf('.') + 3);
        }
        return retVal;
    }
}