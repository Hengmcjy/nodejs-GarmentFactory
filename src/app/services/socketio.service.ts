
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io } from 'socket.io-client';

import { environment } from '../../environments/environment';

import { UserService } from './user.service';
import { UserRequestNodeLoginWaiting } from '../models/iosocket.model';

const SOCKETIO = environment.SOCKET_ENDPOINT;

@Injectable({ providedIn: 'root' })
export class SocketIOService {
    socket = io(SOCKETIO);
    socketID = '';
    public msgio: BehaviorSubject<string> = new BehaviorSubject('');

    public msgIONodeRequestLogin: BehaviorSubject<string> = new BehaviorSubject('');
    public msgIONodeResponseLogin: BehaviorSubject<string> = new BehaviorSubject('');

    constructor(
        private userService: UserService
    ) {}

    setupSocketConnection() {
        // this.socket = io(SOCKETIO);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    public sendMessage(msgIO: any, ioClass: string, section: string, mode: string) {
        // console.log(this.socket.id);
        // console.log(this.userService.ioID+'/'+ioClass +'/'+section+'/'+mode);
        // this.socket.emit(ioClass +'/'+section+'/'+mode, msgIO);
        this.socket.emit(this.userService.ioID+'/'+ioClass +'/'+section+'/'+mode, msgIO);
    }



    public getNewMessage = () => {
        this.socket.on(this.userService.ioID+'/iomessage/user', (msgio: any) => {
            this.socketID = this.socket.id;
            this.msgio.next(msgio);
        });
        return this.msgio.asObservable();
    };

    // ## request login node station
    // ## sendPath =
    public getIORequestLoginNode = () => {
        // console.log('getIORequestLoginNode');
        // console.log(this.userService.ioID);
        this.socket.on(this.userService.ioID+'/iomessage/koj/node/request/login', (msgio: any) => {
            this.socketID = this.socket.id;
            // console.log(msgio);
            this.msgIONodeRequestLogin.next(msgio);
        });
        return this.msgIONodeRequestLogin.asObservable();
    };

    // ## response login node station
    public getIOResponseLoginNode = () => {
        this.socket.on(this.userService.ioID+'/iomessage/koj/node/response/login', (msgio: any) => {
            this.socketID = this.socket.id;
            this.msgIONodeResponseLogin.next(msgio);
        });
        return this.msgIONodeResponseLogin.asObservable();
    };


}
