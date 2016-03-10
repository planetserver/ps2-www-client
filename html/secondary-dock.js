$(function () {
    $.widget("dock.secondaryDock", $.earthserver.dock, {
        options: {
            position: "right"
        },
        _create: function () {
            this._super();
        }
    })
});