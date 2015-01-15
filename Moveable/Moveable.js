var Teva;
(function (Teva) {
    var Moveable = (function () {
        function Moveable() {
        }
        Moveable.Enable = function (Elements, Options) {
            Options = $.extend({}, Moveable.GetDefaults(), Options);
            Options.Container = $(Options.Container);
            $.each($(Elements), function (Index, Element) {
                Moveable.InnerEnable($(Element), Options);
            });
        };
        Moveable.InnerEnable = function (Element, Options) {
            if (Element.data("moveable") == "1")
                return;
            Element.data("moveable", "1");
            var Handle;
            if (Options.Handle === null)
                Handle = Element;
            else
                Handle = Element.find(Options.Handle);
            Handle.addClass("teva-moveable-cursor");
            var Dragged;
            var Cloned;
            var ThresholdPassed;
            var Dragged_OriginalTop;
            var Dragged_OriginalLeft;
            var Dragged_OriginalZIndex;
            var RemoveOnRollback;
            Handle.on("mousedown", function (e) {
                if (e.which != 1)
                    return;
                RemoveOnRollback = false;
                if (Handle[0] == Element[0] && Element.attr("onclick") != null) {
                    Element.data("onclick", Element.attr("onclick"));
                    Element.attr("onclick", null);
                }
                Dragged = $(this);
                if (Options.Helper != null) {
                    //var HelperClass = Dragged.closest("div").attr("data-widget-helper");
                    Dragged = Options.Helper(); //Dragged.clone(false, false);
                    //Dragged.appendTo(Options.Container);
                    Moveable.Enable(Dragged, {
                        Container: Options.Container,
                        Interval: Options.Interval,
                        Handle: Options.Handle,
                        IsRTL: Options.IsRTL,
                        OnStart: Options.OnStart,
                        OnStop: Options.OnStop,
                        PreventOverClass: Options.PreventOverClass,
                        Threshold: Options.Threshold
                    });
                }
                if (Dragged.closest(Options.Container).length == 0) {
                    Options.Container.append(Dragged);
                    Dragged.css("left", "0px");
                    Dragged.css("top", "0px");
                    Dragged_OriginalLeft = e.pageX - Options.Container.offset().left - Dragged.width() / 2;
                    Dragged_OriginalTop = e.pageY - Options.Container.offset().top - Dragged.height() / 2;
                    RemoveOnRollback = true;
                }
                else {
                    Dragged_OriginalLeft = Dragged.position().left;
                    Dragged_OriginalTop = Dragged.position().top;
                }
                // Cloned.appendTo($(".DesktopDashboard.dashboard-widget-links"));
                Dragged_OriginalZIndex = Dragged.css('z-index');
                var Dragged_Width = Dragged.outerWidth(true);
                var Dragged_Height = Dragged.outerHeight(true);
                ThresholdPassed = false;
                var Dragged_X;
                var Dragged_Y;
                /*if (Options.Helper == "Clone") {
                    if (Options.IsRTL)
                        Dragged_X = Dragged_OriginalLeft + (Dragged_Width / 2) - e.pageX;
                    else
                        Dragged_X = Dragged_OriginalLeft + (Dragged_Width * 2) - e.pageX;
                    Dragged_Y = Dragged_OriginalTop - e.pageY;
                }
                else {*/
                Dragged_X = Dragged_OriginalLeft + Dragged_Width - e.pageX;
                Dragged_Y = Dragged_OriginalTop + Dragged_Height - e.pageY;
                //}
                if (Options.Handle === null)
                    Dragged = Dragged.addClass("teva-moveable-dragged");
                else
                    Dragged = Dragged.addClass('active-handle').parent().addClass("teva-moveable-dragged");
                $(document).on("mousemove.moveable", function (e) {
                    if (Dragged == null)
                        return;
                    var CurrentTop = Moveable.GetRounding(Options, e.pageY + Dragged_Y - Dragged_Height);
                    var CurrentLeft = Moveable.GetRounding(Options, e.pageX + Dragged_X - Dragged_Width);
                    if (CurrentTop < 0)
                        CurrentTop = 0;
                    if (CurrentLeft < 0)
                        CurrentLeft = 0;
                    if (CurrentTop > Options.Container.height() - Dragged_Height)
                        CurrentTop = Options.Container.height() - Dragged_Height;
                    if (CurrentLeft > Options.Container.width() - Dragged_Width)
                        CurrentLeft = Options.Container.width() - Dragged_Width;
                    if (!ThresholdPassed) {
                        if (Options.IsRTL)
                            ThresholdPassed = Options.Threshold <= Math.abs(Dragged_OriginalLeft - CurrentLeft);
                        else
                            ThresholdPassed = Options.Threshold <= Math.abs(CurrentLeft - Dragged_OriginalLeft);
                        if (ThresholdPassed && Options.OnStart != null)
                            Options.OnStart();
                    }
                    if (Options.IsRTL)
                        Dragged.css("right", (Options.Container.width() - CurrentLeft - Dragged.outerWidth(true)) + "px").css("left", "auto");
                    else
                        Dragged.css("left", CurrentLeft + "px").css("right", "auto");
                    Dragged.css("top", CurrentTop + "px").css("z-index", 1001);
                });
                e.preventDefault();
            });
            var MouseUp = function () {
                if (Dragged == null)
                    return;
                $(document).off("mousemove.moveable");
                if (!ThresholdPassed && Element.data("onclick") != null) {
                    Element.attr("onclick", Element.data("onclick"));
                }
                if (Options.Handle === null)
                    Dragged.removeClass("teva-moveable-dragged");
                else
                    Dragged.removeClass("active-handle").parent().removeClass("teva-moveable-dragged");
                var Rollback = Moveable.IsOverElement(Options, Dragged);
                if (Rollback) {
                    if (RemoveOnRollback) {
                        Dragged.remove();
                        Dragged = null;
                    }
                    else {
                        Dragged.animate({
                            left: Options.IsRTL ? null : Dragged_OriginalLeft,
                            right: Options.IsRTL ? Options.Container.width() - Dragged_OriginalLeft - Dragged.outerWidth(true) : null,
                            top: Dragged_OriginalTop
                        }, {
                            duration: 500,
                            complete: function () {
                                $(Dragged).css('z-index', Dragged_OriginalZIndex);
                                Dragged = null;
                            }
                        });
                    }
                }
                else {
                    $(Dragged).css('z-index', Dragged_OriginalZIndex);
                    if (Options.OnStop != null)
                        Options.OnStop(Dragged);
                    Dragged = null;
                }
                /*if (Options.Helper == "Clone") {
                    var Click = Dragged;
                    Dragged = null
                    if (Options.OnStop != null)
                        Options.OnStop(Click);
                    Click.click();
                    Click.remove();
                }
                else */
            };
            $(document).on("mouseup", function (e) {
                MouseUp();
                event.stopPropagation();
                //var ThresholdPassed;
                //if (Options.IsRTL)
                //    ThresholdPassed = Dragged.position().left + Options.Threshold <= Dragged_StartLeft;
                //else
                //    ThresholdPassed = Dragged.position().left - Options.Threshold >= Dragged_StartLeft;
                //if (!ThresholdPassed)
            });
            Handle.on("mouseup", function () {
                MouseUp();
                //if (Options.StopEvent != null)
                //    Options.StopEvent();
            });
        };
        Moveable.GetDefaults = function () {
            return {
                Container: "body",
                Handle: null,
                Helper: null,
                IsRTL: $("body").attr("dir") == "rtl",
                Interval: 10,
                Threshold: 10,
                PreventOverClass: null,
                OnStart: null,
                OnStop: null,
            };
        };
        Moveable.IsOverElement = function (Options, CurrentElement) {
            if (Options.PreventOverClass == null)
                return;
            var Current_Left = CurrentElement.position().left;
            var Current_Right = Current_Left + CurrentElement.outerWidth(true);
            var Current_Top = CurrentElement.position().top;
            var Current_Bottom = Current_Top + CurrentElement.outerHeight(true);
            var ToReturn = false;
            $(Options.PreventOverClass, Options.Container).each(function () {
                if (this == CurrentElement[0])
                    return;
                var OtherElement = $(this);
                var Other_Left = OtherElement.position().left;
                var Other_Right = Other_Left + OtherElement.outerWidth(true);
                var Other_Top = OtherElement.position().top;
                var Other_Bottom = Other_Top + OtherElement.outerHeight(true);
                var Over_X = Moveable.IsIntersecting(Current_Left, Current_Right, Other_Left, Other_Right);
                var Over_Y = Moveable.IsIntersecting(Current_Top, Current_Bottom, Other_Top, Other_Bottom);
                if (Over_X && Over_Y)
                    ToReturn = true;
            });
            return ToReturn;
        };
        Moveable.IsIntersecting = function (Range1_From, Range1_To, Range2_From, Range2_To) {
            if (Range1_To <= Range2_From)
                return false;
            if (Range1_From >= Range2_To)
                return false;
            return true;
        };
        Moveable.GetRounding = function (Options, Number) {
            return Math.round(Number / Options.Interval) * Options.Interval;
        };
        return Moveable;
    })();
    Teva.Moveable = Moveable;
})(Teva || (Teva = {}));
//# sourceMappingURL=moveable.js.map