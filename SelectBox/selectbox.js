/// <reference path="../typings/references.ts" />
var Teva;
(function (Teva) {
    var SelectBox = (function () {
        function SelectBox(Input, Options) {
            this.RequestThrottleDelay = 250; // Delay in MS
            var Instance = this;
            Input.data("SelectBox", this);
            Instance.Input = Input;
            Instance.Options = Options;
            Instance.QueryMethod = Options.Query;
            if (Instance.QueryMethod == null)
                Instance.ConvertFromSelect();
            Instance.CreateElements();
            Instance.BindEvents();
            if (!Options.Enabled)
                Instance.Disable();
        }
        SelectBox.Enable = function (Selector, Options) {
            Options = $.extend({}, SelectBox.GetDefaults(), Options);
            $(Selector).each(function () {
                var Input = $(this);
                if (Input.data("SelectBox") != null)
                    return Input.data("SelectBox");
                if (Options.Query == null && Input.prop("tagName") != "SELECT") {
                    console.warn("Missing Query");
                    return null;
                }
                new SelectBox(Input, Options);
            });
        };
        SelectBox.GetInstance = function (Input) {
            return $(Input).data("SelectBox");
        };
        SelectBox.GetDefaults = function () {
            return {
                Query: null,
                PlaceHolderText: "",
                AllowManualValues: false,
                AllowClear: true,
                AllowSearch: true,
                Enabled: true,
                EnableCaching: true,
                EnableCachingPartialReduce: true,
                FormatResultItem: null,
                MinimumLength: null,
                ShowArrows: true,
                ShowSearchIcon: true,
                Inline: true,
                OnChange: null,
            };
        };
        SelectBox.prototype.ClearCache = function () {
            this.HideResults();
            this.DisableScroll();
            this.Cache = null;
            this.VisibleTerms = null;
            this.VisiblePageIndex = null;
        };
        SelectBox.prototype.HideResults = function (Focus) {
            if (Focus === void 0) { Focus = false; }
            var Instance = this;
            if (!Instance.Container.hasClass("teva-selectbox-open"))
                return;
            if (Focus)
                Instance.Label.focus();
            Instance.SearchContainer.stop().fadeOut(200, function () {
                Instance.Container.removeClass("teva-selectbox-open");
                Instance.Container.append(Instance.SearchContainer);
                if (Instance.Options.AllowSearch)
                    Instance.SearchTermsInput.val("");
                if (Focus)
                    Instance.Label.focus();
            });
            $(document).off("mousedown.SelectBox");
            $(window).off("resize.SelectBox");
        };
        SelectBox.prototype.PositionResults = function () {
            var Instance = this;
            var Top = Instance.Label.offset().top;
            if (!Instance.Options.Inline)
                Top += Instance.Label.outerHeight();
            var Left;
            if ($("body").attr("dir") == "rtl")
                Left = Instance.Label.offset().left + Instance.Label.outerWidth() - Instance.SearchContainer.outerWidth();
            else
                Left = Instance.Label.offset().left;
            Instance.SearchContainer.css("top", Top + "px");
            Instance.SearchContainer.css("left", Left + "px");
        };
        SelectBox.prototype.ShowResults = function (Terms) {
            if (Terms === void 0) { Terms = ""; }
            var Instance = this;
            Instance.Container.addClass("teva-selectbox-open");
            Instance.PositionResults();
            $(window).on("resize.SelectBox", function () {
                Instance.PositionResults();
            });
            $("body").append(Instance.SearchContainer);
            $(document).on("mousedown.SelectBox", function (e) {
                if (e.which != 1)
                    return;
                if ($(e.target).closest(Instance.SearchContainer).length != 0)
                    return;
                Instance.HideResults();
            });
            Instance.SearchContainer.fadeIn(200);
            if (Instance.Options.AllowSearch) {
                Instance.SearchTermsInput.focus();
                Instance.SearchTermsInput.val(Terms);
            }
            Instance.RefreshResults(Terms);
        };
        SelectBox.prototype.Enable = function () {
            this.Container.removeClass("teva-selectbox-disabled");
        };
        SelectBox.prototype.Disable = function () {
            this.Container.addClass("teva-selectbox-disabled");
        };
        SelectBox.prototype.IsDisabled = function () {
            return this.Container.hasClass("teva-selectbox-disabled");
        };
        SelectBox.prototype.SetValue = function (ID, Text, Data) {
            if (Data === void 0) { Data = null; }
            var Instance = this;
            Instance.Input.val(ID);
            Instance.LabelText.text(Text);
            Instance.SelectedValue = ID;
            Instance.SelectedText = Text;
            Instance.SelectedData = Data;
            Instance.Input.change();
            if (Instance.Options.OnChange != null)
                Instance.Options.OnChange(ID, Text, Data, Instance);
        };
        SelectBox.prototype.ClearValue = function () {
            this.SetValue("", this.Options.PlaceHolderText, null);
        };
        SelectBox.prototype.ConvertFromSelect = function () {
            var Instance = this;
            var QueryData = Instance.GetQueryFromSelect(Instance.Input);
            Instance.QueryMethod = function (Terms, PageIndex, Callback) {
                Callback({ results: QueryData });
            };
            var NewInput = $("<input />").attr("type", "hidden").attr("name", Instance.Input.attr("name")).attr("id", Instance.Input.attr("id")).data("SelectBox", Instance).insertAfter(Instance.Input);
            var Selected = $("option:selected", Instance.Input);
            if (Selected.length > 0) {
                NewInput.val(Selected.val());
                NewInput.attr("data-text", Selected.text());
            }
            Instance.Input.remove();
            Instance.Input = NewInput;
        };
        SelectBox.prototype.GetQueryFromSelect = function (Container) {
            var Instance = this;
            var ToReturn = new Array();
            $("> *", Container).each(function () {
                if ($(this).prop("tagName") == "OPTION") {
                    ToReturn.push({
                        id: $(this).val(),
                        text: $(this).text(),
                        cssClass: $(this).attr("class"),
                        data: $(this).data()
                    });
                }
                else if ($(this).prop("tagName") == "OPTGROUP") {
                    ToReturn.push({
                        text: $(this).attr("label"),
                        cssClass: $(this).attr("class"),
                        children: Instance.GetQueryFromSelect($(this))
                    });
                }
            });
            return ToReturn;
        };
        SelectBox.prototype.CreateElements = function () {
            var Instance = this;
            Instance.Input.attr("type", "hidden");
            Instance.Container = $("<div>").addClass("teva-selectbox").insertBefore(Instance.Input);
            if (Instance.Options.ShowArrows)
                Instance.Container.addClass("teva-selectbox-arrows");
            if (Instance.Options.Inline)
                Instance.Container.addClass("teva-selectbox-inline");
            Instance.Label = $("<a>").attr("href", "#").attr("onclick", "return false;").addClass("teva-selectbox-label").appendTo(Instance.Container);
            Instance.LabelText = $("<div>").addClass("teva-selectbox-label-text").appendTo(Instance.Label);
            if (Instance.Input.val() != null && Instance.Input.val() != "") {
                if (Instance.Input.attr("data-text") != null)
                    Instance.LabelText.text(Instance.Input.attr("data-text"));
                else
                    Instance.LabelText.text(Instance.Input.val());
            }
            else
                Instance.LabelText.text(Instance.Options.PlaceHolderText);
            Instance.SearchContainer = $("<div>").addClass("teva-selectbox-search").appendTo(Instance.Container);
            if (Instance.Options.Inline)
                Instance.SearchContainer.addClass("teva-selectbox-search-inline");
            if (Instance.Options.ShowSearchIcon)
                Instance.SearchContainer.addClass("teva-selectbox-search-icon");
            if (Instance.Options.AllowSearch) {
                Instance.SearchTerms = $("<div>").addClass("teva-selectbox-search-terms").appendTo(Instance.SearchContainer);
                Instance.SearchTermsInput = $("<input>").addClass("teva-selectbox-search-terms-input").appendTo(Instance.SearchTerms);
            }
            Instance.SearchResults = $("<div>").addClass("teva-selectbox-search-results").appendTo(Instance.SearchContainer);
            Instance.SearchResultsLoading = $("<div>").addClass("teva-selectbox-search-results-searching").text("מחפש...").appendTo(Instance.SearchResults);
            Instance.SearchResultsEmpty = $("<div>").addClass("teva-selectbox-search-results-empty").text("לא נמצאו תוצאות").appendTo(Instance.SearchResults);
            if (Instance.Options.MinimumLength != null) {
                Instance.SearchResultsMinimum = $("<div>").addClass("teva-selectbox-search-results-minimum").text("הטקסט קצר מדי").appendTo(Instance.SearchResults);
            }
        };
        SelectBox.prototype.BindEvents = function () {
            var Instance = this;
            Instance.Label.mouseup(function (e) {
                if (Instance.IsDisabled())
                    return true;
                if (e.which != 1)
                    return true;
                if (Instance.SearchContainer.is(":visible"))
                    Instance.HideResults(true);
                else
                    Instance.ShowResults();
                e.preventDefault();
                e.stopPropagation();
            });
            Instance.Label.keydown(function (e) {
                if (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            Instance.Label.keyup(function (e) {
                if (Instance.IsDisabled())
                    return true;
                if (e.ctrlKey || e.altKey)
                    return true;
                if (e.keyCode == 9)
                    return true;
                if (Instance.Container.hasClass("teva-selectbox-open"))
                    Instance.Keyup_Results(e.keyCode);
                else if (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40)
                    Instance.ShowResults();
                else
                    return true;
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            Instance.Label.keypress(function (e) {
                if (Instance.IsDisabled())
                    return true;
                if (e.ctrlKey || e.altKey)
                    return true;
                Instance.ShowResults(String.fromCharCode(e.charCode));
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            if (Instance.Options.AllowSearch) {
                Instance.SearchTermsInput.keydown(function (e) {
                    if (e.keyCode == 38 || e.keyCode == 40) {
                        Instance.Keyup_Results(e.keyCode);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
                Instance.SearchTermsInput.keyup(function (e) {
                    if (e.keyCode == 38 || e.keyCode == 40) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                    if (Instance.Keyup_Results(e.keyCode))
                        Instance.RefreshResults(Instance.SearchTermsInput.val());
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                });
            }
        };
        SelectBox.prototype.Keyup_Results = function (KeyCode) {
            var Instance = this;
            if (KeyCode == 38 || KeyCode == 40) {
                var Active = $(".teva-selectbox-search-results-result-active", Instance.SearchResults);
                var ElementToFocus = null;
                if (KeyCode == 38)
                    ElementToFocus = Active.prevAll(".teva-selectbox-search-results-result:not(.teva-selectbox-search-results-result-disabled):not(.teva-selectbox-search-results-result-parent):first");
                else
                    ElementToFocus = Active.nextAll(".teva-selectbox-search-results-result:not(.teva-selectbox-search-results-result-disabled):not(.teva-selectbox-search-results-result-parent):first");
                if (ElementToFocus.length != 0) {
                    Active.removeClass("teva-selectbox-search-results-result-active");
                    ElementToFocus.addClass("teva-selectbox-search-results-result-active");
                    Instance.FocusOnActiveResult();
                }
                return false;
            }
            else if (KeyCode == 13) {
                var Active = $(".teva-selectbox-search-results-result-active", Instance.SearchResults);
                if (Active.length == 0) {
                    if (!Instance.Options.AllowManualValues)
                        return false;
                    Instance.SetValue(Instance.SearchTermsInput.val(), Instance.SearchTermsInput.val(), null);
                    Instance.HideResults(true);
                }
                else if (Active.hasClass("teva-selectbox-search-results-result-remove")) {
                    Instance.ClearValue();
                    this.HideResults(true);
                }
                else
                    Instance.SelectResult(Active);
                return false;
            }
            else if (KeyCode == 27) {
                Instance.HideResults(true);
                return false;
            }
            return true;
        };
        SelectBox.prototype.SelectResult = function (Result) {
            var ID = Result.data("SelectBox-id");
            var Text = Result.data("SelectBox-text");
            this.SetValue(ID, Text, Result.data("SelectBox-data"));
            this.HideResults(true);
        };
        SelectBox.prototype.AppendResultItem = function (Item) {
            var Instance = this;
            var Div = $("<div>").addClass("teva-selectbox-search-results-result").addClass(Item.cssClass).data("SelectBox-id", Item.id).data("SelectBox-text", Item.text).data("SelectBox-data", Item.data).appendTo(Instance.SearchResults);
            if (Instance.Options.FormatResultItem != null)
                Div.append(Instance.Options.FormatResultItem(Item));
            else
                Div.text(Item.text);
            if (Item.children)
                Div.addClass("teva-selectbox-search-results-result-parent");
            else if (Item.disabled)
                Div.addClass("teva-selectbox-search-results-result-disabled");
            else {
                Div.mouseup(function (e) {
                    if (e.which != 1)
                        return;
                    Instance.SelectResult($(this));
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
            if (Item.children != null)
                for (var i = 0; i < Item.children.length; i++)
                    Instance.AppendResultItem(Item.children[i]);
        };
        SelectBox.prototype.FocusOnActiveResult = function () {
            var Instance = this;
            var Element = $(".teva-selectbox-search-results-result-active", Instance.SearchResults);
            if (Element.length == 0)
                return;
            var Position_Top = Instance.SearchResults.scrollTop() + Element.position().top;
            var Position_Bottom = Position_Top + Element.outerHeight();
            var Visible_Top = Instance.SearchResults.scrollTop();
            var Visible_Bottom = Visible_Top + Instance.SearchResults.height();
            if (Visible_Bottom < Position_Bottom)
                Instance.SearchResults.scrollTop(Position_Top - Instance.SearchResults.height() + Element.outerHeight());
            else if (Position_Top < Visible_Top)
                Instance.SearchResults.scrollTop(Position_Top);
        };
        SelectBox.prototype.FocusByInput = function () {
            var Instance = this;
            var Value = Instance.Input.val();
            $(".teva-selectbox-search-results-result-active", Instance.SearchResults).removeClass("teva-selectbox-search-results-result-active");
            var Result = $(".teva-selectbox-search-results-result", Instance.SearchResults).filter(function () {
                return $(this).data("SelectBox-id") == Value;
            });
            if (Result.length == 0)
                Result = $(".teva-selectbox-search-results-result:visible:not(.teva-selectbox-search-results-result-disabled):not(.teva-selectbox-search-results-result-parent):first", Instance.SearchResults);
            Result.addClass("teva-selectbox-search-results-result-active");
            Instance.FocusOnActiveResult();
        };
        SelectBox.prototype.RefreshResultsData = function (Terms, Data) {
            var Instance = this;
            Instance.SearchResultsEmpty.toggle(Data.results.length == 0);
            if (Instance.Options.AllowClear) {
                Instance.SearchResultsRemove = $("<div>").addClass("teva-selectbox-search-results-result").addClass("teva-selectbox-search-results-result-remove").mouseup(function (e) {
                    if (e.which != 1)
                        return;
                    Instance.ClearValue();
                    Instance.HideResults(true);
                    e.preventDefault();
                    e.stopPropagation();
                }).text("<ריק>").appendTo(Instance.SearchResults).toggle(Terms == "" && Instance.Input.val() != "");
            }
            for (var i = 0; i < Data.results.length; i++) {
                var Item = Data.results[i];
                Instance.AppendResultItem(Item);
            }
        };
        SelectBox.prototype.EnableScroll = function () {
            var Instance = this;
            Instance.SearchResults.on("scroll.SelectBox", function () {
                var CurrentScroll = Instance.SearchResults.scrollTop();
                var MaximumScroll = Instance.SearchResults[0].scrollHeight - Instance.SearchResults.outerHeight();
                if (CurrentScroll >= MaximumScroll - 10)
                    Instance.LoadResults(Instance.VisibleTerms, Instance.VisiblePageIndex + 1);
            });
        };
        SelectBox.prototype.DisableScroll = function () {
            this.SearchResults.off("scroll.SelectBox");
        };
        SelectBox.prototype.ShowLoading = function (PageIndex) {
            this.SearchContainer.addClass("teva-selectbox-search-loading");
            if (PageIndex == 0)
                this.SearchResultsLoading.show();
        };
        SelectBox.prototype.HideLoading = function () {
            this.SearchResultsLoading.hide();
            this.SearchContainer.removeClass("teva-selectbox-search-loading");
        };
        SelectBox.prototype.RefreshResults = function (Terms) {
            var Instance = this;
            if (Instance.Options.AllowClear && Instance.SearchResultsRemove != null)
                Instance.SearchResultsRemove.toggle(Terms == "" && Instance.Input.val() != "");
            if (Instance.VisibleTerms == Terms) {
                Instance.FocusByInput();
                return;
            }
            if (Instance.Options.MinimumLength != null) {
                if (Instance.Options.MinimumLength > Terms.length) {
                    $(".teva-selectbox-search-results-result", Instance.SearchResults).remove();
                    if (Instance.SearchResultsEmpty != null)
                        Instance.SearchResultsEmpty.hide();
                    Instance.SearchResultsMinimum.show();
                    return;
                }
                Instance.SearchResultsMinimum.hide();
            }
            Instance.SearchResultsEmpty.hide();
            $(".teva-selectbox-search-results-result", Instance.SearchResults).remove();
            Instance.LoadResults(Terms, 0);
        };
        SelectBox.prototype.LoadResults = function (Terms, PageIndex) {
            var Instance = this;
            Instance.ShowLoading(PageIndex);
            if (Instance.Options.EnableCaching) {
                Instance.ThrottleQuery(Terms, PageIndex, 0, function (Data) {
                    if (Data.more)
                        Instance.EnableScroll();
                    else
                        Instance.DisableScroll();
                    Instance.RefreshResultsData(Terms, Data);
                    Instance.VisiblePageIndex = PageIndex;
                    Instance.VisibleTerms = Terms;
                    Instance.HideLoading();
                    if (PageIndex == 0)
                        Instance.FocusByInput();
                });
            }
            else {
                Instance.QueryMethod(Terms, PageIndex, function (Data) {
                    if (Data.more)
                        Instance.EnableScroll();
                    else
                        Instance.DisableScroll();
                    Instance.RefreshResultsData(Terms, Data);
                    Instance.VisiblePageIndex = PageIndex;
                    Instance.VisibleTerms = Terms;
                    Instance.HideLoading();
                    if (PageIndex == 0)
                        Instance.FocusByInput();
                });
            }
        };
        SelectBox.prototype.ThrottleQuery = function (Term, PageIndex, LeadingResultsCount, Callback) {
            var Instance = this;
            if (Instance.Cache == null)
                Instance.Cache = [];
            var CachedData = Instance.Cache[Term + "////" + PageIndex];
            if (CachedData) {
                Callback(CachedData);
                return;
            }
            if (Instance.Options.EnableCachingPartialReduce) {
                var PartialTerm = Term;
                while (PartialTerm.length > 0) {
                    PartialTerm = PartialTerm.substring(0, PartialTerm.length - 1);
                    CachedData = Instance.Cache[PartialTerm + "////" + PageIndex];
                    if (CachedData) {
                        if (CachedData.more == true)
                            break;
                        var ToReturn = {
                            more: false,
                            results: []
                        };
                        for (var i = 0; i < CachedData.results.length; i++) {
                            var Result = CachedData.results[i];
                            if (Result.children != null && Result.children.length > 0) {
                                var FilteredChildren = [];
                                for (var j = 0; j < Result.children.length; j++) {
                                    var Child = Result.children[j];
                                    if (!Child.disabled && Child.text.toLowerCase().indexOf(Term.toLowerCase()) != -1)
                                        FilteredChildren.push(Child);
                                }
                                if (FilteredChildren.length > 0) {
                                    ToReturn.results.push({
                                        text: Result.text,
                                        cssClass: Result.cssClass,
                                        children: FilteredChildren
                                    });
                                }
                            }
                            else {
                                if (i < LeadingResultsCount || Result.text.toLowerCase().indexOf(Term.toLowerCase()) != -1)
                                    ToReturn.results.push(Result);
                            }
                        }
                        Callback(ToReturn);
                        return;
                    }
                }
            }
            Instance.RequestThrottleAdd(function () {
                Instance.QueryMethod(Term, PageIndex, function (Data) {
                    Instance.Cache[Term + "////" + PageIndex] = Data;
                    Callback(Data);
                });
            });
        };
        SelectBox.prototype.RequestThrottleAdd = function (NewRequest) {
            var Instance = this;
            Instance.RequestThrottleNextRequest = NewRequest;
            if (Instance.RequestThrottlePending)
                return;
            Instance.RequestThrottlePending = true;
            setTimeout(function () {
                Instance.RequestThrottleDoRequest();
            }, Instance.RequestThrottleDelay);
        };
        SelectBox.prototype.RequestThrottleDoRequest = function () {
            var Action = this.RequestThrottleNextRequest;
            this.RequestThrottleNextRequest = null;
            this.RequestThrottlePending = false;
            Action();
        };
        return SelectBox;
    })();
    Teva.SelectBox = SelectBox;
})(Teva || (Teva = {}));
//# sourceMappingURL=selectbox.js.map