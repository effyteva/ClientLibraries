/// <reference path="../typings/references.ts" />
module Teva {
    export interface ResizableOptions {
        Container: any;
        HandleClass?: string;
        MinWidth?: number;
        MinHeight?: number;
        MaxWidth?: number;
        MaxHeight?: number;
        PreventOverClass?: string;
        IsRTL?: boolean;
        Interval?: number;
        OnStart?: any;
        OnResize?: any;
        OnStop?: any;
    }

    export class Resizable {
        static GetDefaults(): ResizableOptions {
            return <ResizableOptions> {
                Container: "body",
                HandleClass: "teva-resizable-resizer",
                MinWidth: 10,
                MinHeight: 10,
                MaxWidth: null,
                MaxHeight: null,
                PreventOverClass: null,
                IsRTL: $("body").attr("dir") == "rtl",
                Interval: 10,
                OnStart: null,
                OnResize: null,
                OnStop: null,
            };
        }

        static Enable(Elements, Options: ResizableOptions) {
            Options = $.extend({}, Resizable.GetDefaults(), Options);
            Options.Container = $(Options.Container);

            $.each($(Elements), function (Index, Element) {
                Resizable.InnerEnable($(Element), Options);
            });
        }
        private static InnerEnable(Element, Options: ResizableOptions) {
            if (Element.data("resizable") == "1")
                return;

            Element.data("resizable", "1");
            if (Options.MinWidth != null && Options.MaxWidth != null && Options.MaxWidth != 0 && Options.MinWidth == Options.MaxWidth
                && Options.MinHeight != null && Options.MaxHeight != null && Options.MaxHeight != 0 && Options.MinHeight == Options.MaxHeight) {
                return;
            }
            if ($("> ." + Options.HandleClass, Element).length == 0)
                Element.append($("<div />").addClass(Options.HandleClass));
            var Handle = $("> ." + Options.HandleClass, Element);

            var StartPosition;
            var StartWidth;
            var StartHeight;

            var MouseDown = function (e) {
                StartPosition = Resizable.GetPositionInContainer(Options, e.clientX, e.clientY);
                StartWidth = Element.width();
                StartHeight = Element.height();
                $(document).on('mousemove.resizable', MouseMove).on('mouseup.resizable', MouseUp);
                Element.addClass("teva-resizable-cursor").parents().addClass("teva-resizable-cursor");

                //Element.addClass("resizable");
                if (Options.OnStart != null)
                    Options.OnStart();
                event.stopPropagation();
            };

            var MouseMove = function (e) {
                if (Options.OnResize != null)
                    Options.OnResize();

                var Position = Resizable.GetPositionInContainer(Options, e.clientX, e.clientY);

                var NewWidth;
                var NewHeight;

                // Mouse position
                if (Options.IsRTL)
                    NewWidth = Resizable.GetRounding(Options, StartWidth + StartPosition.Left - Position.Left);
                else
                    NewWidth = Resizable.GetRounding(Options, StartWidth + Position.Left - StartPosition.Left);
                NewHeight = Resizable.GetRounding(Options, StartHeight + Position.Top - StartPosition.Top);

                // Constraints
                if (Options.MinWidth != null)
                    NewWidth = Math.max(NewWidth, Options.MinWidth);
                if (Options.MaxWidth != null && Options.MaxWidth != 0)
                    NewWidth = Math.min(NewWidth, Options.MaxWidth);
                if (Options.MinHeight != null)
                    NewHeight = Math.max(NewHeight, Options.MinHeight);
                if (Options.MaxHeight != null && Options.MaxHeight != 0)
                    NewHeight = Math.min(NewHeight, Options.MaxHeight);

                // Over other elements
                if (Resizable.IsOverElement(Options, Element, Resizable.OuterWidth(Element, NewWidth), Resizable.OuterHeight(Element, NewHeight))) {
                    event.stopPropagation();
                    return;
                }

                // Container dimensions
                if (Options.IsRTL)
                    NewWidth = Math.min(NewWidth, Element.position().left + Element.width());
                else
                    NewWidth = Math.min(NewWidth, Options.Container.width() - Element.position().left - Resizable.OuterWidth(Element));
                NewHeight = Math.min(NewHeight, Options.Container.height() - Element.position().top - Resizable.OuterHeight(Element));

                Element.width(NewWidth);
                Element.height(NewHeight);

                event.stopPropagation();
            };

            var MouseUp = function (e) {
                if (Options.OnStop != null)
                    Options.OnStop();
                $(document).off('mousemove.resizable', MouseMove).off('mouseup.resizable', MouseUp);
                Element.removeClass("teva-resizable-cursor").parents().removeClass("teva-resizable-cursor");
                Element.removeClass("resizable");
                event.stopPropagation();
            };

            Handle.on('mousedown', MouseDown);
        }

        private static OuterLeft(Element: JQuery): number {
            return parseInt(Element.css("padding-left")) + parseInt(Element.css("margin-left")) + parseInt(Element.css("border-left-width"));
        }
        private static OuterRight(Element: JQuery): number {
            return parseInt(Element.css("padding-right")) + parseInt(Element.css("margin-right")) + parseInt(Element.css("border-right-width"));
        }
        private static OuterTop(Element: JQuery): number {
            return parseInt(Element.css("padding-top")) + parseInt(Element.css("margin-top")) + parseInt(Element.css("border-top-width"));
        }
        private static OuterBottom(Element: JQuery): number {
            return parseInt(Element.css("padding-bottom")) + parseInt(Element.css("margin-bottom")) + parseInt(Element.css("border-bottom-width"));
        }
        private static OuterWidth(Element: JQuery, Width: number = 0): number {
            return Width + Resizable.OuterLeft(Element) + Resizable.OuterRight(Element);
        }
        private static OuterHeight(Element: JQuery, Height: number = 0): number {
            return Height + Resizable.OuterTop(Element) + Resizable.OuterBottom(Element);
        }

        private static IsOverElement(Options: ResizableOptions, CurrentElement, NewWidth, NewHeight): boolean {
            if (Options.PreventOverClass == null)
                return;

            var Current_Right;
            var Current_Left;
            if (Options.IsRTL) {
                Current_Right = CurrentElement.position().left + CurrentElement.outerWidth(true);
                Current_Left = Current_Right - NewWidth;
            }
            else {
                Current_Left = CurrentElement.position().left;
                Current_Right = Current_Left + NewWidth;
            }
            var Current_Top = CurrentElement.position().top;
            var Current_Bottom = Current_Top + NewHeight;

            var ToReturn = false;
            $(Options.PreventOverClass, Options.Container).each(function () {
                if (this == CurrentElement[0])
                    return;

                var OtherElement = $(this);
                var Other_Left = OtherElement.position().left;
                var Other_Right = Other_Left + OtherElement.outerWidth(true);
                var Other_Top = OtherElement.position().top;
                var Other_Bottom = Other_Top + OtherElement.outerHeight(true);

                var Over_X = Resizable.IsIntersecting(Current_Left, Current_Right, Other_Left, Other_Right);
                var Over_Y = Resizable.IsIntersecting(Current_Top, Current_Bottom, Other_Top, Other_Bottom);

                if (Over_X && Over_Y)
                    ToReturn = true;
            });
            return ToReturn;
        }

        private static IsIntersecting(Range1_From, Range1_To, Range2_From, Range2_To) {
            if (Range1_To <= Range2_From)
                return false;
            if (Range1_From >= Range2_To)
                return false;
            return true;
        }

        private static GetRounding(Options: ResizableOptions, Number: number): number {
            return Math.round(Number / Options.Interval) * Options.Interval;
        }

        private static GetPositionInContainer(Options: ResizableOptions, ClientX, ClientY) {
            var Container_Left = Options.Container.offset().left;
            var Container_Right = Container_Left + Options.Container.width();
            var Container_Top = Options.Container.offset().top;
            var Container_Bottom = Container_Top + Options.Container.height();

            if (ClientX < Container_Left)
                ClientX = Container_Left;
            else if (ClientX > Container_Right)
                ClientX = Container_Right;
            if (ClientY < Container_Top)
                ClientY = Container_Top;
            else if (ClientY > Container_Bottom)
                ClientY = Container_Bottom;
            ClientX -= Container_Left;
            ClientY -= Container_Top;
            return { Left: Resizable.GetRounding(Options, ClientX), Top: Resizable.GetRounding(Options, ClientY) };
        }
    }
}