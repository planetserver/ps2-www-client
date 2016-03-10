# es2-service-template
##EarthServer 2 service template

###General Info
####Widget Initialization
A widget can be initialized with the following command:
```javascript
var widget = $("<div>").widgetName({option: optionValue});
```
Any widget method can be called like this:
```javascript
widget.widgetName("methodName", params);
```
In order to avoid passing the method name as a string argument, one can get the widget instance, using the
```javascript
var widgetInstance = widget.widgetName("instance");
```
and then call any method in the following way:
```javascript
widgetInstance.methodName(params);
```

###Creating the main dock
By calling
```javascript
$("<div>").mainDock().mainDock("instance");
```
you can create the main dock.
By default the dock will contain three panels; projections, coverages and query terminal.
In order to override this option, you can initialize the widget with one of projections, coverages or queryTerminal option set to false, like in the example below.
```javascript
$("<div>").mainDock({queryTerminal: false}).mainDock("instance");
```
You can also create an empty panel and fill it with custom content by calling the method addEmptyPanel() of the mainDock.

###Creating secondary docks
"Secondary" docks are the ones shown in the right hand side of the screen.
The most common is the info dock which is creating by calling the
```javascript
$("<div>").infoDock().infoDock("instance");
```
which creates an empty info panel.
Then by getting the infoPanel instance (.getInfoPanel) from the infoDock you can add content in tabs, by calling the addTab() method, as following:
```javascript
infoDock.getInfoPanel()
  .addTab(tabId, tabText, tabContentTitle, tabContentSubtitle, tabContentBody);
```
Custom empty secondary dock can be created by initializing a secondaryDock widget and adding empty panels.

###GIS Toolbar
The GIS toolbar is created as follows:
```javascript
var gisToolbar = $("<div>").gisToolbar().gisToolbar("instance");
```
The desired click behaviour for each tool can be defined by adding a click handler. For example:
```javascript
gisToolbar.addClickHandler(toolId, function() {
      /* Click behaviour */
    });
```

###Coordinates Overlay
The coordinates overlay is initialized as follows:
```javascript
var coordinates = $("<div>").coordinateOverlay().coordinateOverlay("instance");
```

            
###API
####mainDock Widget
#####Methods
######addProjectionSelectPanel()
Optional argument: callback called on select
######addAvailableCoveragesPanel()
Optional argument: callback called on select
######addQueryTerminalPanel()
