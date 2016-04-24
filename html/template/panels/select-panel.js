$(function () {
    $.widget("panel.selectPanel", $.dock.panel, {
        options: {
            panelType: "select",
            dropdownId: undefined,
            buttonContent: undefined,
            defaultOption: undefined
        },
        _create: function () {
            this._super();

            var dropdown = $("<div>", {id: this.options.dropdownId, class: "dropdown selector"})
                .append(
                    $("<button>", {
                        class: "btn btn-default dropdown-toggle selector-btn",
                        type: "button",
                        "data-toggle": "dropdown",
                        "aria-haspopup": "true",
                        "aria-expanded": "false"
                    }).append($("<span>", {class: "selector-btn-wrapper"})
                        .append(
                            $("<span>", {class: "selector-btn-content"}).append(this.options.buttonContent))
                        .append(
                            $("<span>", {class: "glyphicon glyphicon-chevron-down"})
                        )
                    )
                ).appendTo(this.panelBody);
                var dropdownMenu = $("<ul>", {class: "dropdown-menu", "aria-labelledby": "buttonId"}).appendTo(dropdown);

            if (this.options.defaultOption != undefined) {
                this.addSelectOption(this.options.defaultOption.toLowerCase().replace(" ", "-"), this.options.defaultOption);
                this.setButtonContent(this.options.defaultOption);
            }

            var self = this;
            dropdown.on('shown.bs.dropdown', function () {
                if (dropdownMenu.height() + dropdownMenu.offset().top > self.options.dock.height() + self.options.dock.offset().top) {
                    dropdownMenu.css({"position": "fixed", "top": dropdownMenu.offset().top, "left": dropdownMenu.offset().left, "width": dropdownMenu.outerWidth()});
                }
            });

            dropdown.on('hide.bs.dropdown', function () {
                if (dropdownMenu.height() + dropdownMenu.offset().top > self.options.dock.height() + self.options.dock.offset().top) {
                    dropdownMenu.css({"position": "absolute", "top": "100%", "left": 0, "width": "100%"});
                }
            });

            return this;
        },
        addSelectOption: function (optionId, optionContent) {
            var self = this;
            $("<li>").append(
                $("<a>", {href: "#" + optionId})
                    .append(optionContent)
                .click(function() {
                    var buttonContent = self.panelBody.find(".selector-btn-content");
                    buttonContent.empty();
                    buttonContent.append($(this).text());
                })).appendTo(this.panelBody.find(".dropdown-menu"));

            return this;
        },
        setButtonContent: function(content) {
            this.panelBody.find(".selector-btn-content").append(content);
        }
    })
});
