$(function () {
    $.widget("earthserver.codeArea", {
        options: {
            content: undefined
        },
        _create: function () {
            this.element.attr("id", "code-area");
            this.mobile = this._isMobile();
            if (!this.mobile) {
                this.codeArea = CodeMirror.fromTextArea(document.getElementById("code-area"), {
                    lineNumbers: true,
                    lineWrapping: true,
                    scrollbarStyle: "simple",
                    styleActiveLine: true,
                    placeholder: "Insert WCPS Query here..."
                });
            } else {
                this.codeArea = this.element;
                this.codeArea.attr({placeholder: "Insert WCPS Query here..."});
            }

            if (this.options.content != undefined) {
                this.setValue(this.options.content);
            }
        },
        getValue: function() {
            return this.mobile ? this.codeArea.val() : this.codeArea.getValue().replace(/\n/g, " ").replace(/\s\s+/g, " ");
        },
        setValue: function(content) {
            this.mobile ? this.codeArea.val(content) : this.codeArea.setValue(content);
        },
        reset: function() {
            if (this.mobile) {
                this.codeArea.val("");
            } else {
                this.codeArea.setValue("");
                this.codeArea.clearHistory();
            }
        },
        _isMobile: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        }
    })
});