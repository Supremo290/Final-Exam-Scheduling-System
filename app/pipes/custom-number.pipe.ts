import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'customNumber'
})
export class CustomNumberPipe implements PipeTransform {

  constructor(private decimalPipe: DecimalPipe) {}

  transform(value: number | null, digitsInfo: string = '1.2-2'): string | null {
    if (value === 0) {
      // Handle zero as a special case
      return '0.00';
    }
    // Use the default Angular decimal pipe for other cases
    return this.decimalPipe.transform(value, digitsInfo);
  }

}
