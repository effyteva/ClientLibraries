/// <reference path="../typings/references.ts" />
var Teva;
(function (Teva) {
    var Storage = (function () {
        function Storage() {
        }
        Storage.Cookie_Set = function (Name, Value, Days) {
            var d = new Date();
            d.setTime(d.getTime() + (Days * 24 * 60 * 60 * 1000));
            document.cookie = Name + "=" + Value + "; expires=" + d.toISOString();
        };
        Storage.Cookie_Get = function (Name) {
            var cookie_name = Name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ')
                    c = c.substring(1);
                if (c.indexOf(cookie_name) != -1)
                    return c.substring(cookie_name.length, c.length);
            }
            return "";
        };
        Storage.LocalStorage_Set = function (Key, Value, Serialize) {
            if (Serialize === void 0) { Serialize = true; }
            if (Serialize && Value != null)
                Value = JSON.stringify(Value);
            localStorage.setItem(Key, Value);
        };
        Storage.LocalStorage_Get = function (Key, Deserialize) {
            if (Deserialize === void 0) { Deserialize = true; }
            var ToReturn = localStorage.getItem(Key);
            if (Deserialize && ToReturn != null)
                return JSON.parse(ToReturn);
            return ToReturn;
        };
        return Storage;
    })();
    Teva.Storage = Storage;
})(Teva || (Teva = {}));
//# sourceMappingURL=storage.js.map