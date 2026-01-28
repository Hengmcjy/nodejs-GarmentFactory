/* eslint-disable arrow-body-style */
/* eslint-disable prefer-const */
import { JsonPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { NodeUUID } from '../models/storage.model';
// import { Storage } from '@ionic/storage';
// import { HttpClient } from '@angular/common/http';

// // ## app use ionic storage
// import { Storage as StorageC} from '@capacitor/storage';  // ## store in local storage , capacitor
// import { Storage as StorageI } from '@ionic/storage-angular';  // ## store in indexDB

// export interface Item {
//   id: number;
//   title: string;
//   value: string;
//   modified: number;
// }

// const XITEM_KEY = 'my-items';
// const LANG_KEY = 'lang';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    langInit = {
        id: 1,
        title: 'lang',
        value: 'en', // ## default language : en
        modified: 1,
    };

    themeInit = {
        id: 1,
        title: 'theme',
        value: 'light', // ## default language : light
        modified: 1,
    };

    constructor() // private storageI: StorageI,
    {}

    // #################################################################
    // #################################################################
    // ##  general

    clrNodeValue() {  //
        return {id: '1', uuid: ''};
    }

    // ##  general
    // #################################################################
    // #################################################################

    // #################################################################
    // #################################################################
    // ##  local storage other data

    // ## key
    // ## key=nUUIDL  for node workstation login

    async setData(key: string, value: any) {
        localStorage.removeItem(key);
        const dataValue = JSON.stringify(value);
        await localStorage.setItem(key, dataValue);
    }

    // ## nUUID = data of node workstation for next auto login  {id: '', uuid: ''}
    async getData(mode: string, key: string) {
        let value = '';
        const dataValue = await localStorage.getItem(key);
        // console.log(dataValue);
        if (!dataValue) {
            return null;
        }
        if (mode === 'nUUIDL') {
            // ## nUUID = data of node workstation for next auto login
            const nUUIDValue: NodeUUID = JSON.parse(dataValue);
            return nUUIDValue.uuid;
        }

        return JSON.parse(dataValue).value;
    }

    clearData(key: string) {
        localStorage.removeItem(key);
    }

    //   async transformData(mode: string, value: any) {
    //     let dataValue: string = '';
    //     // ## mode
    //     // ## nUUID = data of node workstation for next auto login
    //     if (mode === 'nUUID') { // ## nUUID = data of node workstation for next auto login

    //     }
    //     return dataValue;
    //   }

    // ##  local storage other data
    // #################################################################
    // #################################################################

    // #################################################################
    // #################################################################
    // ##  local storage

    async saveAuthData() {
        // console.log('saveAuthData()');
        await localStorage.setItem('langInit', JSON.stringify(this.langInit));
        await localStorage.setItem('themeInit', JSON.stringify(this.themeInit));
        await localStorage.setItem('userID', '');
        // JSON.stringify(this.themeInit)
    }

    clearAuthData() {
        localStorage.removeItem('langInit');
        localStorage.removeItem('themeInit');
        localStorage.removeItem('userID');
    }

    async getAuthData() {
        const langInit = await localStorage.getItem('langInit');
        const themeInit = await localStorage.getItem('themeInit');
        const userID = await localStorage.getItem('userID');
        // if (!token || !expirationDate) {
        //   return null;
        // }
        // return {
        //   token,
        //   expirationDate: new Date(expirationDate),
        //   userID
        // };
        // console.log('getAuthData()');
        // console.log(langInit, themeInit, userID);
    }

    async setLangData(langSet: any) {
        this.langInit = langSet;
        this.genLangData();
    }

    async getLangData() {
        const langInit = await localStorage.getItem('langInit');
        if (!langInit) {
            return null;
        }
        return JSON.parse(langInit).value;
    }

    async genLangData() {
        await localStorage.setItem('langInit', JSON.stringify(this.langInit));
        return this.langInit.value;
    }

    // ## local storage
    // #################################################################
    // #################################################################

    // #################################################################
    // #################################################################
    // ## session storage

    ssaveAuthData() {
        // console.log('ssaveAuthData()');
        sessionStorage.setItem('langInit', JSON.stringify(this.langInit));
        sessionStorage.setItem('themeInit', JSON.stringify(this.themeInit));
        sessionStorage.setItem('userID', 'userID');
        // JSON.stringify(this.themeInit)
    }

    sgetAuthData() {
        const langInit = sessionStorage.getItem('langInit');
        const themeInit = sessionStorage.getItem('themeInit');
        const userID = sessionStorage.getItem('userID');
        // if (!token || !expirationDate) {
        //   return null;
        // }
        // return {
        //   token,
        //   expirationDate: new Date(expirationDate),
        //   userID
        // };
        // console.log('sgetAuthData()');
        // console.log(langInit, themeInit, userID);
    }

    // ## session storage
    // #################################################################
    // #################################################################

    // #################################################################
    // #################################################################
    // ## cookies

    // ## cookies
    // #################################################################
    // #################################################################

    //   addItem(item: Item): Promise<any> {
    //     return this.storage.get(ITEM_KEY).then((items: Item[]) => {
    //       if (items) {
    //         items.push(item);
    //         return this.storage.set(ITEM_KEY, items);
    //       } else {
    //         return this.storage.set(ITEM_KEY, [item]);
    //       }
    //     });
    //   }

    //   getItem(): Promise<Item[]> {
    //     console.log('service getItem');
    //     return this.storage.get(ITEM_KEY);
    //   }

    //   updateItem(item: Item): Promise<any> {
    //     return this.storage.get(ITEM_KEY).then((items: Item[]) => {
    //       if (!items || items.length === 0) {
    //         return null;
    //       }
    //       const newItems: Item[] = [];
    //       for (const i of items) {
    //         if (i.id === item.id) {
    //           newItems.push(item);
    //         } else {
    //           newItems.push(i);
    //         }
    //       }
    //       return this.storage.set(ITEM_KEY, newItems);
    //     });
    //   }

    //   deleteItem(id: number) {
    //     return this.storage.get(ITEM_KEY).then((items: Item[]) => {
    //       if (!items || items.length === 0) {
    //         return null;
    //       }
    //       const toKeep: Item[] = [];
    //       for (const i of items) {
    //         if (i.id === id) {
    //           toKeep.push(i);
    //         }
    //       }
    //       return this.storage.set(ITEM_KEY, toKeep);
    //     });
    //   }
}
