var Teva;
(function (Teva) {
    var Sortable = (function () {
        function Sortable() {
        }
        Sortable.GetDefaults = function () {
            return {
                ItemSelector: "> tr",
                HandleSelector: null,
            };
        };
        Sortable.Enable = function (Elements, Options) {
            Options = $.extend({}, Sortable.GetDefaults(), Options);
            $.each($(Elements), function (Index, Element) {
                Sortable.InnerEnable($(Element), Options);
            });
        };
        Sortable.InnerEnable = function (Element, Options) {
            if (Element.data("sortable") == "1")
                return;
            Element.data("sortable", "1");
            var Dragged;
            var Cloned;
            var Dragged_OriginalZIndex;
            var MovedElement;
            var StartIndex;
            var CurrentIndex;
            Element.closest("table").css("position", "relative");
            Element.css("position", "relative");
            Element.on("mousedown", Options.HandleSelector, function (e) {
                if (e.which != 1)
                    return;
                var Map = Sortable.GetMap(Options, Element);
                MovedElement = $(this).parentsUntil(Element).last(); //$(this).closest(Options.ItemSelector);
                var IsTable = MovedElement.prop("tagName") == "TR";
                if (IsTable) {
                    Cloned = $("<tr>").addClass("tom-sortable-cloned").css("width", MovedElement.width()).css("height", MovedElement.height()).insertAfter(MovedElement);
                    $("> td", MovedElement).each(function () {
                        Cloned.append($("<td>").css("width", $(this).outerWidth()).css("height", $(this).outerHeight()));
                        $(this).data("original-width", $(this).css("width")).css("min-width", $(this).outerWidth());
                    });
                }
                else {
                    Cloned = $("<div>").addClass("tom-sortable-cloned").css("width", MovedElement.width()).css("height", MovedElement.height()).insertAfter(MovedElement);
                }
                MovedElement.css("top", MovedElement.position().top);
                MovedElement.css("position", "absolute");
                StartIndex = Sortable.GetIndex(Map, e.pageY - Element.offset().top);
                var StartTop = MovedElement.position().top;
                var StartY = e.pageY;
                CurrentIndex = StartIndex;
                $(document).on("mousemove.sortable", function (e) {
                    var NewIndex = Sortable.GetIndex(Map, e.pageY - Element.offset().top);
                    MovedElement.css("top", e.pageY - StartY + StartTop);
                    if (CurrentIndex == NewIndex)
                        return;
                    if (CurrentIndex == NewIndex - 1)
                        MovedElement.insertAfter($($("> :not(.tom-sortable-cloned)", Element)[NewIndex]));
                    else
                        MovedElement.insertBefore($($("> :not(.tom-sortable-cloned)", Element)[NewIndex]));
                    Cloned.insertAfter(MovedElement);
                    CurrentIndex = NewIndex;
                });
                e.preventDefault();
            });
            var MouseUp = function () {
                if (Cloned != null) {
                    Cloned.remove();
                    Cloned = null;
                }
                if (MovedElement != null) {
                    MovedElement.css("top", "");
                    MovedElement.css("position", "");
                    $("> td", MovedElement).each(function () {
                        $(this).css("width", $(this).data("original-width") == null ? "" : $(this).data("original-width")).data("original-width", null);
                    });
                    MovedElement = null;
                }
                $(document).off("mousemove.sortable");
                $(Dragged).css('z-index', Dragged_OriginalZIndex);
                if (Options.OnChange != null && CurrentIndex != StartIndex)
                    Options.OnChange();
                StartIndex = null;
                CurrentIndex = null;
                Dragged = null;
            };
            $(document).on("mouseup", function (e) {
                MouseUp();
                event.stopPropagation();
            });
            Element.on("mouseup", Options.HandleSelector, function () {
                MouseUp();
            });
        };
        Sortable.GetMap = function (Options, Element) {
            var Map = new Array();
            var Top = 0;
            $(Options.ItemSelector, Element).each(function () {
                Map.push({
                    Element: $(this),
                    Top: Top,
                    Height: $(this).outerHeight()
                });
                Top += $(this).outerHeight();
            });
            return Map;
        };
        Sortable.GetIndex = function (Map, Top) {
            if (Top < Map[0].Top)
                return 0;
            for (var i = 0; i < Map.length; i++) {
                if (Top >= Map[i].Top && Top < Map[i].Top + Map[i].Height)
                    return i;
            }
            return Map.length - 1;
        };
        return Sortable;
    })();
    Teva.Sortable = Sortable;
})(Teva || (Teva = {}));
//# sourceMappingURL=sortable.js.map