/// <reference path="../typings/references.ts" />

module Teva {
    export class Storage {
        static Cookie_Set(Name, Value, Days): void {
            var d = new Date();
            d.setTime(d.getTime() + (Days * 24 * 60 * 60 * 1000));
            document.cookie = Name + "=" + Value + "; expires=" + d.toISOString();
        }

        static Cookie_Get(Name): string {
            var cookie_name = Name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(cookie_name) != -1) return c.substring(cookie_name.length, c.length);
            }
            return "";
        }

        static LocalStorage_Set(Key, Value, Serialize = true): void {
            if (Serialize && Value != null)
                Value = JSON.stringify(Value);
            localStorage.setItem(Key, Value);
        }

        static LocalStorage_Get(Key, Deserialize = true): any {
            var ToReturn = localStorage.getItem(Key);
            if (Deserialize && ToReturn != null)
                return JSON.parse(ToReturn);
            return ToReturn;
        }
    }
}