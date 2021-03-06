﻿module Teva {
    enum DatePickerMode {
        Date,
        DateTime,
        Month,
        Time
    }

    export interface DatePickerLocaleProvider {
        MonthNames(): Array<string>;
        DayLetters(): Array<string>;
        PickYear(): string;
        PickMonth(): string;
        PickDay(): string;
        PickHour(): string;
        IsRTL(): boolean;
    }

    export class DatePicker_HE implements DatePickerLocaleProvider {
        DayLetters(): Array<string> {
            return ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
        }
        PickDay() {
            return "בחירת יום";
        }
        PickMonth() {
            return "בחירת חודש";
        }
        PickYear() {
            return "בחירת שנה";
        }
        PickHour() {
            return "בחירת שעה";
        }
        MonthNames() {
            return ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
        }
        IsRTL() {
            return true;
        }
    }

    export class DatePicker_EN implements DatePickerLocaleProvider {
        DayLetters(): Array<string> {
            return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        }
        PickDay() {
            return "Pick day";
        }
        PickMonth() {
            return "Pick month";
        }
        PickYear() {
            return "Pick year";
        }
        PickHour() {
            return "Pick time";
        }
        MonthNames() {
            return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        }
        IsRTL() {
            return false;
        }
    }

    export class DatePicker {
        static Init(): void {
            if ($("body").attr("dir") == "rtl")
                DatePicker.LocaleProvider = new DatePicker_HE();
            else
                DatePicker.LocaleProvider = new DatePicker_EN();
            $("body").on("click.datepicker, focus.datepicker", "input.datepicker, input.datetimepicker, input.timepicker, input.monthpicker", function (e) {
                e.stopPropagation();
                e.preventDefault();

                var Input = $(this);
                if (Input.data("datepicker") != null || Input.data("datepicker-ignoreevent"))
                    return;

                var Mode;
                if (Input.hasClass("datepicker"))
                    Mode = DatePickerMode.Date;
                else if (Input.hasClass("datetimepicker"))
                    Mode = DatePickerMode.DateTime;
                else if (Input.hasClass("monthpicker"))
                    Mode = DatePickerMode.Month;
                else if (Input.hasClass("timepicker"))
                    Mode = DatePickerMode.Time;

                var DatePicker = new Teva.DatePicker(Input, Mode);
                DatePicker.Show();
            });
            $("body").on("change.datepicker", "input.datepicker, input.datetimepicker, input.timepicker, input.monthpicker", function (e) {
                var Input = $(this);

                var Mode;
                if (Input.hasClass("datepicker"))
                    DatePicker.FixDate(Input);
                else if (Input.hasClass("datetimepicker"))
                    DatePicker.FixDateTime(Input);
                else if (Input.hasClass("monthpicker"))
                    DatePicker.FixMonth(Input);
                else if (Input.hasClass("timepicker"))
                    DatePicker.FixTime(Input);
            });

        }
        static PageLoad() {
            $(document).trigger("click.datepicker-hide");
        }

        constructor(Input, Mode?) {
            var DatePicker = this;
            DatePicker.Input = Input;
            DatePicker.Input.data("datepicker", this);
            if (Mode == null) {
                switch (DatePicker.Input.data("datepicker-mode")) {
                    case "DateTime":
                        DatePicker.Mode = DatePickerMode.DateTime;
                        break;
                    case "Month":
                        DatePicker.Mode = DatePickerMode.Month;
                        break;
                    case "Time":
                        DatePicker.Mode = DatePickerMode.Time;
                        break;
                    case "Date":
                    default:
                        DatePicker.Mode = DatePickerMode.Date;
                        break;
                }
            }
            else
                DatePicker.Mode = Mode;
            if (DatePicker.Input.val() != "") {
                switch (DatePicker.Mode) {
                    case DatePickerMode.DateTime:
                        Teva.DatePicker.FixDateTime(DatePicker.Input);
                        var Value = DatePicker.Input.val();
                        DatePicker.SelectedDay = Number(Value.substring(0, 2));
                        DatePicker.SelectedMonth = Number(Value.substring(3, 5));
                        DatePicker.SelectedYear = Number(Value.substring(6, 10));
                        DatePicker.SelectedHour = Number(Value.substring(11, 13));
                        DatePicker.SelectedMinute = Number(Value.substring(14, 16));
                        break;
                    case DatePickerMode.Date:
                        Teva.DatePicker.FixDate(DatePicker.Input);
                        var Value = DatePicker.Input.val();
                        DatePicker.SelectedDay = Number(Value.substring(0, 2));
                        DatePicker.SelectedMonth = Number(Value.substring(3, 5));
                        DatePicker.SelectedYear = Number(Value.substring(6, 10));
                        break;
                    case DatePickerMode.Month:
                        Teva.DatePicker.FixMonth(DatePicker.Input);
                        var Value = DatePicker.Input.val();
                        DatePicker.SelectedMonth = Number(Value.substring(0, 2));
                        DatePicker.SelectedYear = Number(Value.substring(3, 7));
                        break;
                    case DatePickerMode.Time:
                        Teva.DatePicker.FixTime(DatePicker.Input);
                        var Value = DatePicker.Input.val();
                        DatePicker.SelectedHour = Number(Value.substring(0, 2));
                        DatePicker.SelectedMinute = Number(Value.substring(3, 5));
                        break;
                }
            }
            else {
                var Now = new Date();
                DatePicker.SelectedDay = Now.getDate();
                DatePicker.SelectedMonth = Now.getMonth() + 1;
                DatePicker.SelectedYear = Now.getFullYear();
                DatePicker.SelectedHour = Now.getHours();
                DatePicker.SelectedMinute = Now.getMinutes();
            }

            DatePicker.VisibleMonth = DatePicker.SelectedMonth;
            DatePicker.VisibleYear = DatePicker.SelectedYear;
        }

        Show(): void {
            $(document).trigger("click.datepicker-hide");

            var DatePicker = this;
            DatePicker.Container = $("<div>")
                .data("datepicker", DatePicker)
                .addClass("teva-datepicker");

            if (window.innerWidth < 640) {
                DatePicker.Container.addClass("teva-datepicker-mobile");
                DatePicker.Input.blur();
            }

            if (DatePicker.Mode == DatePickerMode.Date || DatePicker.Mode == DatePickerMode.DateTime)
                DatePicker.ShowDatePicker();
            else if (DatePicker.Mode == DatePickerMode.Month)
                DatePicker.ShowMonthPicker();
            else if (DatePicker.Mode == DatePickerMode.Time)
                DatePicker.ShowTimePicker();

            $("body").append(DatePicker.Container);
            DatePicker.PositionContainer();
            $(window).on("resize.datepicker", function () {
                DatePicker.PositionContainer();
            });

            $(document).on("keydown.datepicker-hide", function () {
                DatePicker.Hide();
            });
            $(document).on("click.datepicker-hide", function (e) {
                if (DatePicker.DateContainer != null && $(e.target).closest(DatePicker.DateContainer).length != 0)
                    return;
                if (DatePicker.MonthCalendar != null && $(e.target).closest(DatePicker.MonthCalendar).length != 0)
                    return;
                if (DatePicker.YearCalendar != null && $(e.target).closest(DatePicker.YearContainer).length != 0)
                    return;
                if (DatePicker.TimeContainer != null && $(e.target).closest(DatePicker.TimeContainer).length != 0)
                    return;
                DatePicker.Hide();
            });
        }
        Hide(): void {
            var DatePicker = this;
            DatePicker.Container.remove();
            DatePicker.Container = null;
            DatePicker.DestoryDateContainer();
            DatePicker.DestoryMonthContainer();
            DatePicker.DestoryYearContainer();
            DatePicker.DestoryTimeContainer();
            DatePicker.Input.data("datepicker", null);
            $(document).off("click.datepicker-hide");
            $(document).off("keydown.datepicker-hide");
            $(window).off("resize.datepicker");
        }

        private PositionContainer() {
            var DatePicker = this;
            var Offset = DatePicker.Input.offset();
            var Top = Offset.top + DatePicker.Input.outerHeight();
            DatePicker.Container.css("top", Top + "px");
            var Left;
            if (Teva.DatePicker.LocaleProvider.IsRTL())
                Left = Offset.left + DatePicker.Input.outerWidth() - DatePicker.Container.outerWidth();
            else
                Left = Offset.left;
            DatePicker.Container.css("left", Left + "px");
        }

        private IncrementSelectedHour() {
            var DatePicker = this;
            if (DatePicker.SelectedHour == 23) {
                DatePicker.SelectedHour = 0;
                DatePicker.IncrementSelectedDay();
            }
            else
                DatePicker.SelectedHour++;
        }
        private DecrementSelectedHour() {
            var DatePicker = this;
            if (DatePicker.SelectedHour == 0) {
                DatePicker.SelectedHour = 23;
                DatePicker.DecrementSelectedDay();
            }
            else
                DatePicker.SelectedHour--;
        }
        private IncrementSelectedDay() {
            var DatePicker = this;
            if (new Date(DatePicker.SelectedYear, DatePicker.SelectedMonth - 1, DatePicker.SelectedDay + 1).getDate() != DatePicker.SelectedDay + 1) {
                DatePicker.IncrementSelectedMonth();
                DatePicker.SelectedDay = 1;
            }
            else
                DatePicker.SelectedDay++;
        }
        private DecrementSelectedDay() {
            var DatePicker = this;
            if (DatePicker.SelectedDay == 1) {
                DatePicker.DecrementSelectedMonth();
                DatePicker.SelectedDay = Teva.DatePicker.DaysInMonth(DatePicker.SelectedYear, DatePicker.SelectedMonth);
            }
            else
                DatePicker.SelectedDay--;
        }
        private IncrementVisibleMonth() {
            var DatePicker = this;
            if (DatePicker.VisibleMonth == 12) {
                DatePicker.VisibleMonth = 1;
                DatePicker.VisibleYear++;
            }
            else
                DatePicker.VisibleMonth++;
        }
        private DecrementVisibleMonth() {
            var DatePicker = this;
            if (DatePicker.VisibleMonth == 1) {
                DatePicker.VisibleMonth = 12;
                DatePicker.VisibleYear--;
            }
            else
                DatePicker.VisibleMonth--;
        }
        private IncrementSelectedMonth() {
            var DatePicker = this;
            if (DatePicker.SelectedMonth == 12) {
                DatePicker.SelectedMonth = 1;
                DatePicker.SelectedYear++;
            }
            else
                DatePicker.SelectedMonth++;
        }
        private DecrementSelectedMonth() {
            var DatePicker = this;
            if (DatePicker.SelectedMonth == 1) {
                DatePicker.SelectedMonth = 12;
                DatePicker.SelectedYear--;
            }
            else
                DatePicker.SelectedMonth--;
        }

        private CreateDateContainer() {
            var DatePicker = this;
            var DayNames = Teva.DatePicker.LocaleProvider.DayLetters();
            DatePicker.DateContainer = $("<div>")
                .addClass("teva-datepicker-date")
                .append($("<div>")
                    .addClass("teva-datepicker-date-header")
                    .text(Teva.DatePicker.LocaleProvider.PickDay())
                    )
                .append($("<div>")
                    .addClass("teva-datepicker-date-menu")
                    .append($("<div>").addClass("teva-datepicker-date-menu-previous").click(function () {
                        DatePicker.DecrementVisibleMonth();
                        DatePicker.RefreshDateCalendar();
                    }))
                    .append(DatePicker.DateHeader = $("<div>").addClass("teva-datepicker-date-menu-header").click(function (e) {
                        DatePicker.ShowMonthPicker();
                        e.stopPropagation();
                    }))
                    .append($("<div>").addClass("teva-datepicker-date-menu-next").click(function () {
                        DatePicker.IncrementVisibleMonth();
                        DatePicker.RefreshDateCalendar();
                    }))
                    )
                .append($("<div>")
                    .addClass("teva-datepicker-date-options")
                    .append($("<div>")
                        .append($("<div>").text(DayNames[0]))
                        .append($("<div>").text(DayNames[1]))
                        .append($("<div>").text(DayNames[2]))
                        .append($("<div>").text(DayNames[3]))
                        .append($("<div>").text(DayNames[4]))
                        .append($("<div>").text(DayNames[5]))
                        .append($("<div>").text(DayNames[6]))
                        .addClass("teva-datepicker-date-options-header")
                        )
                    .append(DatePicker.DateCalendar = $("<div>")
                        .addClass("teva-datepicker-date-options-calendar")
                        )
                    )
                .appendTo(DatePicker.Container);
        }
        private CreateMonthContainer() {
            var DatePicker = this;
            DatePicker.MonthContainer = $("<div>")
                .addClass("teva-datepicker-month")
                .append($("<div>")
                    .addClass("teva-datepicker-month-header")
                    .text(Teva.DatePicker.LocaleProvider.PickMonth())
                    )
                .append($("<div>")
                    .addClass("teva-datepicker-month-menu")
                    .append($("<div>").addClass("teva-datepicker-month-menu-previous").click(function (e) {
                        DatePicker.VisibleYear--;
                        DatePicker.RefreshMonthCalendar();
                        e.stopPropagation();
                    }))
                    .append(DatePicker.MonthHeader = $("<div>").addClass("teva-datepicker-month-menu-header").click(function (e) {
                        DatePicker.ShowYearPicker();
                        e.stopPropagation();
                    }))
                    .append($("<div>").addClass("teva-datepicker-month-menu-next").click(function (e) {
                        DatePicker.VisibleYear++;
                        DatePicker.RefreshMonthCalendar();
                        e.stopPropagation();
                    }))
                    )
                .append(DatePicker.MonthCalendar = $("<div>")
                    .addClass("teva-datepicker-month-calendar"))
                .appendTo(DatePicker.Container);
        }
        private CreateYearContainer() {
            var DatePicker = this;
            DatePicker.YearContainer = $("<div>")
                .addClass("teva-datepicker-year")
                .append($("<div>")
                    .addClass("teva-datepicker-year-header")
                    .text(Teva.DatePicker.LocaleProvider.PickYear())
                    )
                .append($("<div>")
                    .addClass("teva-datepicker-year-menu")
                    .append($("<div>").addClass("teva-datepicker-year-menu-previous").click(function () {
                        DatePicker.VisibleYear -= 12;
                        DatePicker.RefreshYearCalendar();
                    }))
                    .append(DatePicker.YearHeader = $("<div>").addClass("teva-datepicker-year-menu-header"))
                    .append($("<div>").addClass("teva-datepicker-year-menu-next").click(function () {
                        DatePicker.VisibleYear += 12;
                        DatePicker.RefreshYearCalendar();
                    }))
                    )
                .append(DatePicker.YearCalendar = $("<div>")
                    .addClass("teva-datepicker-year-calendar"))
                .appendTo(DatePicker.Container);
        }
        private CreateTimeContainer() {
            var DatePicker = this;
            var Mousedown = false;
            DatePicker.TimeContainer = $("<div>")
                .addClass("teva-datepicker-time")
                .append($("<div>")
                    .addClass("teva-datepicker-time-header")
                    .text(Teva.DatePicker.LocaleProvider.PickHour())
                    );

            if (DatePicker.Mode != DatePickerMode.Time) {
                DatePicker.TimeContainer.append($("<div>")
                    .addClass("teva-datepicker-time-menu")
                    .append($("<div>").addClass("teva-datepicker-time-menu-previous").click(function () {
                        DatePicker.DecrementSelectedDay();
                        DatePicker.RefreshInput();
                        DatePicker.RefreshTime();
                    }))
                    .append(DatePicker.TimeHeader = $("<div>").addClass("teva-datepicker-time-menu-header").click(function (e) {
                        DatePicker.ShowDatePicker();
                        e.stopPropagation();
                    }))
                    .append($("<div>").addClass("teva-datepicker-time-menu-next").click(function () {
                        DatePicker.IncrementSelectedDay();
                        DatePicker.RefreshInput();
                        DatePicker.RefreshTime();
                    }))
                    )
            }

            var HourPicker, MinutePicker;
            DatePicker.TimeContainer.append($("<div>").addClass("teva-datepicker-time-options")
                .append($("<div>")
                    .addClass("teva-datepicker-time-hour")
                    .append($("<div>")
                        .addClass("teva-datepicker-time-hour-up")
                        .append($("<div>").addClass("teva-datepicker-time-hour-up-text"))
                        .mousedown(function () {
                            Mousedown = true;
                            var RefreshFunction = function () {
                                if (!Mousedown)
                                    return;
                                DatePicker.IncrementSelectedHour();
                                DatePicker.RefreshTime();
                                DatePicker.RefreshInput();
                                if (Mousedown)
                                    setTimeout(RefreshFunction, 100);
                            };
                            RefreshFunction();
                        })
                        .mouseleave(function () {
                            Mousedown = false;
                        })
                        .mouseup(function () {
                            Mousedown = false;
                        })
                        )
                    .append($("<div>")
                        .addClass("teva-datepicker-time-hour-selected-container")
                        .append(HourPicker = $("<select>")
                            .addClass("teva-datepicker-time-hour-selected")
                            ))
                    .append($("<div>")
                        .addClass("teva-datepicker-time-hour-down")
                        .append($("<div>").addClass("teva-datepicker-time-hour-down-text"))
                        .mousedown(function () {
                            Mousedown = true;
                            var RefreshFunction = function () {
                                if (!Mousedown)
                                    return;
                                DatePicker.DecrementSelectedHour();
                                DatePicker.RefreshTime();
                                DatePicker.RefreshInput();
                                if (Mousedown)
                                    setTimeout(RefreshFunction, 100);
                            };
                            RefreshFunction();
                        })
                        .mouseleave(function () {
                            Mousedown = false;
                        })
                        .mouseup(function () {
                            Mousedown = false;
                        })
                        )
                    )
                .append($("<div>")
                    .addClass("teva-datepicker-time-seperator")
                    .text(":")
                    )
                .append($("<div>")
                    .addClass("teva-datepicker-time-minute")
                    .append($("<div>")
                        .addClass("teva-datepicker-time-minute-up")
                        .append($("<div>").addClass("teva-datepicker-time-minute-up-text"))
                        .mousedown(function () {
                            Mousedown = true;
                            var RefreshFunction = function () {
                                if (!Mousedown)
                                    return;
                                if (DatePicker.SelectedMinute == 59) {
                                    DatePicker.SelectedMinute = 0;
                                    DatePicker.IncrementSelectedHour();
                                }
                                else
                                    DatePicker.SelectedMinute++;
                                DatePicker.RefreshTime();
                                DatePicker.RefreshInput();
                                if (Mousedown)
                                    setTimeout(RefreshFunction, 100);
                            };
                            RefreshFunction();
                        })
                        .mouseup(function () {
                            Mousedown = false;
                        })
                        )
                    .append($("<div>")
                        .addClass("teva-datepicker-time-minute-selected-container")
                        .append(MinutePicker = $("<select>")
                            .addClass("teva-datepicker-time-minute-selected")
                            ))
                    .append($("<div>")
                        .addClass("teva-datepicker-time-minute-down")
                        .append($("<div>").addClass("teva-datepicker-time-minute-down-text"))
                        .mousedown(function () {
                            Mousedown = true;
                            var RefreshFunction = function () {
                                if (!Mousedown)
                                    return;
                                if (DatePicker.SelectedMinute == 0) {
                                    DatePicker.SelectedMinute = 59;
                                    DatePicker.DecrementSelectedHour();
                                }
                                else
                                    DatePicker.SelectedMinute--;
                                DatePicker.RefreshTime();
                                DatePicker.RefreshInput();
                                if (Mousedown)
                                    setTimeout(RefreshFunction, 100);
                            };
                            RefreshFunction();
                        })
                        .mouseup(function () {
                            Mousedown = false;
                        })
                        )
                    )
                )
                .appendTo(DatePicker.Container);
            for (var i = 0; i < 24; i++)
                HourPicker.append($("<option>").text(DatePicker.PadNumber(i, 2)));
            for (var i = 0; i < 60; i++)
                MinutePicker.append($("<option>").text(DatePicker.PadNumber(i, 2)));

        }

        private DestoryDateContainer() {
            var DatePicker = this;
            if (DatePicker.DateContainer != null)
                DatePicker.DateContainer.remove();
            DatePicker.DateCalendar = null;
            DatePicker.DateHeader = null;
            DatePicker.DateContainer = null;
        }
        private DestoryMonthContainer() {
            var DatePicker = this;
            if (DatePicker.MonthContainer != null)
                DatePicker.MonthContainer.remove();
            DatePicker.MonthCalendar = null;
            DatePicker.MonthHeader = null;
            DatePicker.MonthContainer = null;
        }
        private DestoryYearContainer() {
            var DatePicker = this;
            if (DatePicker.YearContainer != null)
                DatePicker.YearContainer.remove();
            DatePicker.YearCalendar = null;
            DatePicker.YearHeader = null;
            DatePicker.YearContainer = null;
        }
        private DestoryTimeContainer() {
            var DatePicker = this;
            if (DatePicker.TimeContainer != null)
                DatePicker.TimeContainer.remove();
            DatePicker.TimeHeader = null;
            DatePicker.TimeContainer = null;
        }

        ShowDatePicker(): void {
            var DatePicker = this;
            DatePicker.CreateDateContainer();
            DatePicker.DestoryMonthContainer();
            DatePicker.DestoryYearContainer();
            DatePicker.DestoryTimeContainer();

            DatePicker.RefreshDateCalendar();
        }
        ShowMonthPicker(): void {
            var DatePicker = this;
            DatePicker.CreateMonthContainer();
            DatePicker.DestoryDateContainer();
            DatePicker.DestoryYearContainer();
            DatePicker.DestoryTimeContainer();
            DatePicker.RefreshMonthCalendar();
        }
        ShowYearPicker(): void {
            var DatePicker = this;
            DatePicker.CreateYearContainer();
            DatePicker.DestoryDateContainer();
            DatePicker.DestoryMonthContainer();
            DatePicker.DestoryTimeContainer();
            DatePicker.RefreshYearCalendar();
        }
        ShowTimePicker(): void {
            var DatePicker = this;
            DatePicker.CreateTimeContainer();
            DatePicker.DestoryDateContainer();
            DatePicker.DestoryMonthContainer();
            DatePicker.DestoryYearContainer();
            DatePicker.RefreshTime();
        }

        private RefreshDateCalendar() {
            var DatePicker = this;
            DatePicker.DateHeader.text(DatePicker.PadNumber(DatePicker.VisibleMonth, 2) + " / " + DatePicker.VisibleYear);
            var DaysInMonth = Teva.DatePicker.DaysInMonth(DatePicker.VisibleMonth, DatePicker.VisibleYear);
            DatePicker.DateCalendar.empty();
            var CurrentYear = new Date().getFullYear();
            var CurrentMonth = new Date().getMonth() + 1;
            var CurrentDay = new Date().getDate();
            var FirstDayOfWeek = new Date(DatePicker.VisibleYear, DatePicker.VisibleMonth - 1, 1).getDay();
            for (var i = 0; i < FirstDayOfWeek; i++) {
                var FullDate = new Date(DatePicker.VisibleYear, DatePicker.VisibleMonth - 1, -FirstDayOfWeek + i + 1)
                DatePicker.DateCalendar.append($("<div>")
                    .addClass("teva-datepicker-date-options-calendar-item")
                    .data("datepicker-day", FullDate.getDate())
                    .data("datepicker-month", FullDate.getMonth() + 1)
                    .data("datepicker-year", FullDate.getFullYear())
                    .addClass("teva-datepicker-date-options-calendar-other")
                    .click(DatePicker.DatePicker_Selected)
                    .text(FullDate.getDate()));
            }
            for (var Day = 1; Day < DaysInMonth + 1; Day++) {
                DatePicker.DateCalendar.append($("<div>")
                    .addClass("teva-datepicker-date-options-calendar-item")
                    .data("datepicker-day", Day)
                    .toggleClass("teva-datepicker-date-options-calendar-selected", Day == DatePicker.SelectedDay && DatePicker.VisibleMonth == DatePicker.SelectedMonth && DatePicker.VisibleYear == DatePicker.SelectedYear)
                    .toggleClass("teva-datepicker-date-options-calendar-now", Day == CurrentDay && DatePicker.VisibleMonth == CurrentMonth && DatePicker.VisibleYear == CurrentYear)
                    .click(DatePicker.DatePicker_Selected)
                    .text(Day));
            }
            var LastDayOfWeek = new Date(DatePicker.VisibleYear, DatePicker.VisibleMonth, 0).getDay();
            for (var i = LastDayOfWeek; i < 6; i++) {
                var FullDate = new Date(DatePicker.VisibleYear, DatePicker.VisibleMonth, i - LastDayOfWeek + 1)
                DatePicker.DateCalendar.append($("<div>")
                    .addClass("teva-datepicker-date-options-calendar-item")
                    .data("datepicker-day", FullDate.getDate())
                    .data("datepicker-month", FullDate.getMonth() + 1)
                    .data("datepicker-year", FullDate.getFullYear())
                    .addClass("teva-datepicker-date-options-calendar-other")
                    .click(DatePicker.DatePicker_Selected)
                    .text(FullDate.getDate()));
            }
        }
        private RefreshMonthCalendar() {
            var DatePicker = this;
            DatePicker.MonthHeader.text(DatePicker.VisibleYear);
            DatePicker.MonthCalendar.empty();
            var CurrentYear = new Date().getFullYear();
            var CurrentMonth = new Date().getMonth() + 1;
            var MonthNames = Teva.DatePicker.LocaleProvider.MonthNames();
            for (var Month = 1; Month < 13; Month++) {
                DatePicker.MonthCalendar.append($("<div>")
                    .addClass("teva-datepicker-month-calendar-item")
                    .data("datepicker-month", Month)
                    .toggleClass("teva-datepicker-month-calendar-selected", Month == DatePicker.SelectedMonth && DatePicker.SelectedYear == DatePicker.VisibleYear)
                    .toggleClass("teva-datepicker-month-calendar-now", Month == CurrentMonth && DatePicker.VisibleYear == CurrentYear)
                    .click(DatePicker.MonthPicker_Selected)
                    .append($("<div>").addClass("teva-datepicker-month-calendar-item-number").text(Month))
                    .append($("<div>").addClass("teva-datepicker-month-calendar-item-text").text(MonthNames[Month - 1]))
                    );
            }
        }
        private RefreshYearCalendar() {
            var DatePicker = this;
            var Year_From = Math.floor(DatePicker.VisibleYear / 12) * 12;
            var Year_To = Year_From + 12 - 1;
            DatePicker.YearHeader.text(Year_From + " - " + Year_To);

            var CurrentYear = new Date().getFullYear();
            DatePicker.YearCalendar.empty();
            for (var Year = Year_From; Year < Year_To + 1; Year++) {
                DatePicker.YearCalendar.append($("<div>")
                    .addClass("teva-datepicker-year-calendar-item")
                    .data("datepicker-year", Year)
                    .toggleClass("teva-datepicker-year-calendar-selected", Year == DatePicker.SelectedYear)
                    .toggleClass("teva-datepicker-year-calendar-now", Year == CurrentYear)
                    .click(DatePicker.YearPicker_Selected)
                    .text(Year));
            }
        }
        private RefreshTime() {
            var DatePicker = this;
            if (DatePicker.TimeHeader != null)
                DatePicker.TimeHeader.text(DatePicker.PadNumber(DatePicker.SelectedDay, 2) + " / " + DatePicker.PadNumber(DatePicker.SelectedMonth, 2) + " / " + DatePicker.SelectedYear);
            $(".teva-datepicker-time-hour-selected", DatePicker.TimeContainer).val(DatePicker.PadNumber(DatePicker.SelectedHour, 2));
            $(".teva-datepicker-time-minute-selected", DatePicker.TimeContainer).val(DatePicker.PadNumber(DatePicker.SelectedMinute, 2));
        }

        private DatePicker_Selected(e) {
            var DayDiv = $(this);
            var DatePicker = <DatePicker>DayDiv.closest(".teva-datepicker").data("datepicker");
            DatePicker.SelectedYear = DatePicker.VisibleYear;
            DatePicker.SelectedMonth = DatePicker.VisibleMonth;
            DatePicker.SelectedDay = DayDiv.data("datepicker-day");
            if (DayDiv.data("datepicker-month")) {
                DatePicker.SelectedMonth = DayDiv.data("datepicker-month");
                DatePicker.VisibleMonth = DatePicker.SelectedMonth;
            }
            if (DayDiv.data("datepicker-year")) {
                DatePicker.SelectedYear = DayDiv.data("datepicker-year");
                DatePicker.VisibleYear = DatePicker.SelectedYear;
            }
            DatePicker.RefreshInput();

            if (DatePicker.Mode == DatePickerMode.DateTime)
                DatePicker.ShowTimePicker();
            else {
                DatePicker.Input.focus();
                DatePicker.Hide();
            }
            e.stopPropagation();
        }
        private MonthPicker_Selected(e) {
            var MonthDiv = $(this);
            var DatePicker = <DatePicker>MonthDiv.closest(".teva-datepicker").data("datepicker");
            DatePicker.VisibleMonth = MonthDiv.data("datepicker-month");
            if (DatePicker.Mode == DatePickerMode.Month) {
                DatePicker.SelectedYear = DatePicker.VisibleYear;
                DatePicker.SelectedMonth = DatePicker.VisibleMonth;
            }
            if (DatePicker.Mode == DatePickerMode.Month) {
                DatePicker.RefreshInput();
                DatePicker.Input.focus();
                DatePicker.Hide();
            }
            else
                DatePicker.ShowDatePicker();
            e.stopPropagation();
        }
        private YearPicker_Selected(e) {
            var YearDiv = $(this);
            var DatePicker = <DatePicker>YearDiv.closest(".teva-datepicker").data("datepicker");
            DatePicker.VisibleYear = YearDiv.data("datepicker-year");
            DatePicker.ShowMonthPicker();
            e.stopPropagation();
        }

        private RefreshInput() {
            var DatePicker = this;
            switch (DatePicker.Mode) {
                case DatePickerMode.Date:
                    DatePicker.Input.val(DatePicker.PadNumber(DatePicker.SelectedDay, 2) + "/" + DatePicker.PadNumber(DatePicker.SelectedMonth, 2) + "/" + DatePicker.SelectedYear);
                    break;
                case DatePickerMode.Month:
                    DatePicker.Input.val(DatePicker.PadNumber(DatePicker.SelectedMonth, 2) + "/" + DatePicker.SelectedYear);
                    break;
                case DatePickerMode.Time:
                    DatePicker.Input.val(DatePicker.PadNumber(DatePicker.SelectedHour, 2) + ":" + DatePicker.PadNumber(DatePicker.SelectedMinute, 2));
                    break;
                case DatePickerMode.DateTime:
                    DatePicker.Input.val(DatePicker.PadNumber(DatePicker.SelectedDay, 2) + "/" + DatePicker.PadNumber(DatePicker.SelectedMonth, 2) + "/" + DatePicker.SelectedYear + " " + DatePicker.PadNumber(DatePicker.SelectedHour, 2) + ":" + DatePicker.PadNumber(DatePicker.SelectedMinute, 2));
                    break;
            }
            DatePicker.Input.data("datepicker-skipfix", true).change().data("datepicker-skipfix", false)
        }

        private PadNumber(Value, Length) {
            var ToReturn = String(Value);
            while (ToReturn.length < Length)
                ToReturn = "0" + ToReturn;
            return ToReturn;
        }

        private static FixDateTime(Element): void {
            if ($(Element).data("datepicker-skipfix"))
                return;

            var Value = $(Element).val();
            if (Value.indexOf(' ') != -1) {
                var DatePart = Value.substring(0, Value.indexOf(' '));
                var TimePart = Value.substring(Value.indexOf(' ') + 1);
                DatePart = DatePicker.ExtractDate(DatePart);
                TimePart = DatePicker.ExtractTime(TimePart);
                if (DatePart != null && TimePart != null && Value != DatePart + " " + TimePart)
                    $(Element).val(DatePart + " " + TimePart);
            }
            else if (Value.indexOf('/') != -1 || Value.indexOf('-') != -1 || Value.indexOf('.') != -1)
            {
                var Value = $(Element).val();
                var Result = DatePicker.ExtractDate(Value);

                if (Result != null)
                    $(Element).val(Result + " 00:00");
            }
            else {
                TimePart = DatePicker.ExtractTime(Value);
                if (TimePart != null)
                    $(Element).val(DatePicker.GetDateAsString(new Date()) + " " + TimePart);
                else
                    DatePicker.FixDate(Element);
            }
        }
        private static FixDate(Element): void {
            if ($(Element).data("datepicker-skipfix"))
                return;

            var Value = $(Element).val();
            var Result = DatePicker.ExtractDate(Value);

            if (Result != null && Value != Result)
                $(Element).val(Result);
        }
        private static FixMonth(Element): void {
            if ($(Element).data("datepicker-skipfix"))
                return;

            var Value = $(Element).val();
            var Result;

            var SeperatorIndex = Value.indexOf('/');
            if (SeperatorIndex == -1)
                SeperatorIndex = Value.indexOf('-');
            if (SeperatorIndex == -1)
                SeperatorIndex = Value.indexOf('.');

            if (SeperatorIndex != -1) {
                if (Value.length == 7)
                    return;
                if (Value.length == 5 && SeperatorIndex == 2)
                    Result = DatePicker.GetMonthAsStringFromParts(Value.substring(0, 2), Value.substring(3, 5));
                else if (Value.length == 4 && SeperatorIndex == 1)
                    Result = DatePicker.GetMonthAsStringFromParts(Value.substring(0, 1), Value.substring(2, 4));
            }
            else {
                if (Value.length == 6)
                    Result = DatePicker.GetMonthAsStringFromParts(Value.substring(0, 2), Value.substring(2, 6));
                else if (Value.length == 4)
                    Result = DatePicker.GetMonthAsStringFromParts(Value.substring(0, 2), Value.substring(2, 4));
                else if (Value.length == 3)
                    Result = DatePicker.GetMonthAsStringFromParts(Value.substring(0, 1), Value.substring(1, 3));
            }
            if (Result != null && Value != Result)
                $(Element).val(Result);
        }
        private static FixTime(Element): void {
            if ($(Element).data("datepicker-skipfix"))
                return;

            var Value = $(Element).val();
            var Result = DatePicker.ExtractTime(Value);

            if (Result != null && Result != Value)
                $(Element).val(Result);
        }
        private static FixYear(Year): string {
            if (Number(Year) < 30)
                return "20" + Year;
            else
                return "19" + Year;
        }
        private static ExtractDate(Value): string {
            var Seperator = '/';
            var Seperator1 = Value.indexOf(Seperator);
            if (Seperator1 == -1) {
                Seperator = '-';
                Seperator1 = Value.indexOf(Seperator);
            }
            if (Seperator1 == -1) {
                Seperator = '.';
                Seperator1 = Value.indexOf(Seperator);
            }

            if (Seperator1 != -1) {
                var Seperator2 = Value.indexOf(Seperator, Seperator1 + 1);
                if (Seperator2 != -1) {
                    var Seperator3 = Value.indexOf(Seperator, Seperator2 + 1);
                    if (Seperator3 == -1)
                        return DatePicker.GetDateAsStringFromParts(Value.substring(0, Seperator1), Value.substring(Seperator1 + 1, Seperator2), Value.substring(Seperator2 + 1));
                }
                else
                    return DatePicker.GetDateAsStringFromParts(Value.substring(0, Seperator1), Value.substring(Seperator1 + 1), null);
            }
            else if (Value.indexOf(Seperator) == -1 && !isNaN(Value)) {
                if (Value.length == 3)
                    return DatePicker.GetDateAsStringFromParts(Value.substring(0, 1), Value.substring(1, 3), null);
                else if (Value.length == 4)
                    return DatePicker.GetDateAsStringFromParts(Value.substring(0, 2), Value.substring(2, 4), null);
                else if (Value.length == 6)
                    return DatePicker.GetDateAsStringFromParts(Value.substring(0, 2), Value.substring(2, 4), Value.substring(4, 6));
                else if (Value.length == 8)
                    return DatePicker.GetDateAsStringFromParts(Value.substring(0, 2), Value.substring(2, 4), Value.substring(4, 8));
            }
            return null;
        }
        private static ExtractTime(Value): string {
            var Seperator = Value.indexOf(':');
            if (Seperator != -1)
                return DatePicker.GetTimeAsStringFromParts(Value.substring(0, Seperator), Value.substring(Seperator + 1));
            if (!isNaN(Value)) {
                if (Value.length == 4)
                    return DatePicker.GetTimeAsStringFromParts(Value.substring(0, 2), Value.substring(2, 4));
                if (Value.length == 3)
                    return DatePicker.GetTimeAsStringFromParts(Value.substring(0, 1), Value.substring(1, 3));
                if (Value.length == 2 || Value.length == 1)
                    return DatePicker.GetTimeAsStringFromParts(Value, "0");
            }
            return null;
        }
        public static GetTimeAsString(Value: Date) {
            if (Value == null)
                return "";
            return DatePicker.GetTimeAsStringFromParts(Value.getHours().toString(), Value.getMinutes().toString());
        }
        public static GetDateAsString(Value: Date): string {
            if (Value == null)
                return "";
            return DatePicker.GetDateAsStringFromParts(Value.getDate().toString(), (Value.getMonth() + 1).toString(), Value.getFullYear().toString());
        }
        public static GetDateTimeAsString(Value: Date): string {
            if (Value == null)
                return "";
            return DatePicker.GetDateAsString(Value) + " " + DatePicker.GetTimeAsString(Value);
        }
        public static GetMonthAsString(Value: Date): string {
            if (Value == null)
                return "";
            return DatePicker.GetMonthAsStringFromParts((Value.getMonth() + 1).toString(), Value.getFullYear().toString());
        }
        public static GetTimeAsStringFromParts(Hour: string, Minute: string): string {
            if (Hour.length == 1)
                Hour = "0" + Hour;
            if (Minute.length == 1)
                Minute = "0" + Minute;
            return Hour + ":" + Minute;
        }
        public static GetMonthAsStringFromParts(Month: string, Year: string): string {
            if (Month.length == 1)
                Month = "0" + Month.substring(0, 1);
            if (Year == null)
                Year = new Date().getFullYear().toString();
            else if (Year.length == 1)
                Year = "200" + Year;
            else if (Year.length == 2)
                Year = DatePicker.FixYear(Year);

            return Month + "/" + Year;
        }
        public static GetDateAsStringFromParts(Day: string, Month: string, Year: string): string {
            if (Day.length == 1)
                Day = "0" + Day;
            if (Month.length == 1)
                Month = "0" + Month;
            if (Year == null)
                Year = new Date().getFullYear().toString();
            else if (Year.length == 1)
                Year = "200" + Year;
            else if (Year.length == 2)
                Year = DatePicker.FixYear(Year);

            return Day + "/" + Month + "/" + Year;
        }
        public static GetDateFromString(Value: String, Mode: DatePickerMode) {
            switch (Mode) {
                case DatePickerMode.DateTime:
                    var Day = Number(Value.substring(0, 2));
                    var Month = Number(Value.substring(3, 5));
                    var Year = Number(Value.substring(6, 10));
                    var Hour = Number(Value.substring(11, 13));
                    var Minute = Number(Value.substring(14, 16));
                    return new Date(Date.UTC(Year, Month - 1, Day, Hour, Minute));
                    break;
                case DatePickerMode.Date:
                    var Day = Number(Value.substring(0, 2));
                    var Month = Number(Value.substring(3, 5));
                    var Year = Number(Value.substring(6, 10));
                    return new Date(Date.UTC(Year, Month - 1, Day));
                case DatePickerMode.Month:
                    var Month = Number(Value.substring(0, 2));
                    var Year = Number(Value.substring(3, 7));
                    return new Date(Date.UTC(Year, Month - 1, 1));
                case DatePickerMode.Time:
                    var Hour = Number(Value.substring(0, 2));
                    var Minute = Number(Value.substring(3, 5));
                    var Now = new Date();
                    return new Date(Date.UTC(Now.getFullYear(), Now.getMonth(), Now.getDate(), Hour, Minute));
                    break;
                default:
                    console.error("Invalid Mode: " + Mode);
            }
        }

        public static ParseJsonDate(Value: string): Date {
            if (Value.indexOf("/Date(") == 0)
                return new Date(parseInt(Value.replace('/Date(', '')));
            else
                return new Date(Value);
        }

        static DaysInMonth(Month: number, Year: number): number {
            return new Date(Year, Month, 0).getDate();
        }
        private static LocaleProvider: Teva.DatePickerLocaleProvider;

        private Input;
        private Container;

        private DateContainer;
        private DateHeader;
        private DateCalendar;

        private MonthContainer;
        private MonthHeader;
        private MonthCalendar;

        private YearContainer;
        private YearHeader;
        private YearCalendar;

        private TimeContainer;
        private TimeHeader;

        private Mode: DatePickerMode;

        private VisibleYear;
        private VisibleMonth;

        private SelectedYear;
        private SelectedMonth;
        private SelectedDay;
        private SelectedHour;
        private SelectedMinute;
    }
}

$(function () {
    Teva.DatePicker.Init();
});