/// <reference path="../typings/references.ts" />
var Teva;
(function (Teva) {
    var Dropdown = (function () {
        function Dropdown() {
        }
        Dropdown.PageLoad = function () {
            $(document).trigger("click.dropdown");
        };
        Dropdown.Init = function () {
            $(document).on("click.dropdown", ".teva-dropdown-link", function (event) {
                var Link = $(this);
                var DropdownElement = $(this).closest(".teva-dropdown");
                var MenuElement = DropdownElement.attr("data-dropdown-menu");
                var MoveElement = true;
                if (MenuElement != null) {
                    MenuElement = $(MenuElement);
                    MoveElement = false;
                }
                else
                    MenuElement = DropdownElement.data("dropdown-menu");
                if (MenuElement == null)
                    MenuElement = DropdownElement.find(".teva-dropdown-menu");
                if (MenuElement.is(":visible")) {
                    $(document).trigger("click.dropdown");
                    return false;
                }
                $(document).trigger("click.dropdown");
                DropdownElement.data("dropdown-menu", MenuElement);
                if (MoveElement)
                    $("body").append(MenuElement);
                Dropdown.PositionDropdown(DropdownElement, MenuElement);
                $(window).on("resize.dropdown", function () {
                    Dropdown.PositionDropdown(DropdownElement, MenuElement);
                });
                $(document).one("click.dropdown", function () {
                    $(window).off("resize.dropdown");
                    MenuElement.fadeOut(200, function () {
                        if (MoveElement)
                            DropdownElement.append(MenuElement);
                    });
                });
                MenuElement.fadeIn(200);
                return false;
            });
        };
        Dropdown.PositionDropdown = function (DropdownElement, MenuElement) {
            var Top = DropdownElement.offset().top + DropdownElement.outerHeight();
            MenuElement.css("top", Top + "px");
            if ($("body").attr("dir") == "rtl") {
                var Left;
                if (DropdownElement.hasClass("teva-dropdown-far"))
                    Left = DropdownElement.offset().left;
                else
                    Left = DropdownElement.offset().left - MenuElement.outerWidth() + DropdownElement.outerWidth();
                MenuElement.css("left", Left + "px");
            }
            else {
                var Left;
                if (DropdownElement.hasClass("teva-dropdown-far"))
                    Left = DropdownElement.offset().left - MenuElement.outerWidth() + DropdownElement.outerWidth();
                else
                    Left = DropdownElement.offset().left;
                MenuElement.css("left", Left + "px");
            }
        };
        return Dropdown;
    })();
    Teva.Dropdown = Dropdown;
})(Teva || (Teva = {}));
//# sourceMappingURL=dropdown.js.map