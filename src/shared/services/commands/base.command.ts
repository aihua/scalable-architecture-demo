import {Observable} from 'rxjs/Observable';
import {CommandPayload} from './payloads/base.command-payload';
import {Gateway} from '../gateways/base.gateway';
import {Observer} from 'rxjs/Observer';

export enum CommandState {
  IDLE,
  EXECUTING,
  INVOKED
};

export interface CommandResult {
  command: Command;
  payload: any;
}

export abstract class Command {
  static _id: number = 0;
  protected _state: CommandState;
  protected _payload: CommandPayload;
  protected _commands: Command[] = [];
  private _method: any;
  private _gateway: Gateway;
  private _id: number = 0;
  constructor(payload?: CommandPayload) {
    this._payload = payload;
    Command._id += 1;
    this._id = Command._id;
  }
  get id(): number {
    return this._id;
  }
  get payload(): CommandPayload {
    return this._payload;
  }
  set payload(value: CommandPayload) {
    this._payload = value;
  }
  get method(): any {
    return this._method;
  }
  set method(value: any) {
    this._method = value;
  }
  set gateway(value: Gateway) {
    this._gateway = value;
  }
  get mimeType() {
    return this._payload.mimeType;
  }
  concat(command: Command): void {
    this._payload.concat(command.payload);
  }
  serialize(): string | Blob | ArrayBuffer {
    return this._payload.serialize();
  }
  parse(response: any): any {
    return this._payload.parse(response);
  };
  invoke(context?: Command): Observable<CommandResult> {
    context = context || this;
    context.state = CommandState.EXECUTING;
    let result = new Observable<CommandResult>((observer: Observer<CommandResult>) => {
      this._gateway.send(context).subscribe(response => {
        context.state = CommandState.INVOKED;
        observer.next({
          command: context,
          payload: context.parse(response)
        });
      }, (error: any) => {
        debugger;
        observer.error(error);
      }, () => observer.complete());
    });
    return result;
  }
  set state(value: CommandState) {
    this._state = value;
  }
  get state(): CommandState {
    return this._state;
  }
}