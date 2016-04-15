var startTour = function(){

  var intro = introJs();
  //define the steps of the tour

  intro.setOptions({
    steps: [
      {
        element: '#mCSB_1_container', // '#ui-id-2'
        intro: 'Welcome to PlanetServer-2! This tour will guide you through the basics of PS-2. Press "next" to start the tour.',
        position:'left'
      },
      {
        element: '#ui-id-2', // '#ui-id-2'
        intro: 'This is the main menu. Here you will find the Projections, Available coverages, WCPS console, Selected coverages and the RGB combinator',
        position:'right'
      },
      {
        element: '#projection-selector > div.panel-body > div.dropdown.selector',
        intro: 'Clicking on the dropdown menu will show the available projections',
        position:'right'
      },
      {
        element: '#basemaps-selector > div.panel-body > div.dropdown.selector',
        intro: 'Here you can select the available datasets',
        position:'right'
      },
      // {
      //   element: '#custom-query-selector > button',
      //   intro: 'Here you can select the preloaded WCPS queries',
      //   position:'right'
      // },
      // {
      //   element: '#ui-id-3 > div.CodeMirror.cm-s-default.CodeMirror-wrap.CodeMirror-simplescroll.CodeMirror-empty',
      //   intro: 'In the console you can write your own WCPS queries',
      //   position:'right'
      // },
      {
        element: '#rgb-combinator > div.panel-heading',
        intro: 'Here you find RGB combinator. Select one coverage, select the bands you want in each channel and press submit.',
        position:'right'
      },
      {
        element: '#mCSB_1_container > div.no-select.dock-toggle.right-dock-toggle',
        intro: 'Here you find the info menu. An about PlanetServer-2 and contact info is given here.',
        position:'left'
      },
      {
        element: '#mCSB_3_container > div.no-select.dock-toggle.right-dock-toggle',
        intro: 'Here you find the plot menu. When an image is loaded and you click on it, the graph will be shown here.',
        position:'left'
      }

    ],
    showStepNumbers: false,
    exitOnEsc:true,
    showBullets: true,
    scrollToElement:true,
    nextLabel: 'Next',
    prevLabel: 'Prev',
    skipLabel: 'End tour',
    doneLabel: 'Done'
  });



  //open menus
  intro.onbeforechange(function(targetElement){
    if (targetElement.id === 'mCSB_1_container'){
      $(".info-dock").infoDock("close");
      $(".left-dock").mainDock("open");
    }
    // if (targetElement.id === 'mCSB_1_container'){
    //   $(".left-dock").mainDock("close");
    // }
  });

  // intro.onafterchange(function(targetElement){
  //     if (targetElement.id === 'mCSB_1_container'){
  //     $(".left-dock").mainDock("close");
  //   }
  // });


  //start the tour
   intro.start();

};
