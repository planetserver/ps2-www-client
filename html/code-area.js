$(function () {
    $.widget("earthserver.codeArea", {
        options: {

        },
        _create: function () {
            var lineNumbers = $("<div>", {class: "line-numbers"}).appendTo(this.element);
        }
    })
});