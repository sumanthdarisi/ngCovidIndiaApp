import { Pipe, PipeTransform } from '@angular/core';
import { APIService } from '../Services/api.service';

@Pipe({
  name: 'stateName'
})
export class StateNamePipe implements PipeTransform {

  constructor(private _serv: APIService) {}

  transform(value: string): any {
    return this._serv.getPipeStateName(value);
  }

}
