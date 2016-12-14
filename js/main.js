/**
 * Created by mattdeveney on 11/12/16.
 */

loadData();

var radialChart;
var timelineChart;
var closeUp;
var histVis;

function loadData() {

  d3.csv("data/oec-modified.csv", function(data){

    data.forEach(function(d){
        d.SemiMajorAxisAU = +d.SemiMajorAxisAU;
        d.PlanetaryMassJpt = +d.PlanetaryMassJpt;
        d.LongitudeDeg = +d.LongitudeDeg;
        d.AscendingNodeDeg = +d.AscendingNodeDeg;
        d.PeriastronDeg = +d.PeriastronDeg;
        d.InclinationDeg = +d.InclinationDeg;
        d.HostStarTempK = +d.HostStarTempK;
        d.HostStarRadiusSlrRad = +d.HostStarRadiusSlrRad;
        d.HostStarMetallicity = +d.HostStarMetallicity;
        d.HostStarMassSlrMass = +d.HostStarMassSlrMass;
        d.HostStarAgeGyr = +d.HostStarAgeGyr;
        d.Eccentricity = +d.Eccentricity;
        d.DistFromSunParsec = +d.DistFromSunParsec;
        d.PeriodDays = +d.PeriodDays;
        d.RadiusJpt = +d.RadiusJpt;
        d.SurfaceTempK = +d.SurfaceTempK;
    });

    // (3) Create event handler
    var selectionHandler = {};

    // first 100 planet objects
    radialChart = new RadialChart($("#radial-chart"), data, selectionHandler);

    timelineChart = new TimelineVis($("#timeline-chart"), data);

    spaceshipvis = new SpaceshipVis($("#spaceship-area"), data);

    closeUp = new CloseUp($("#closeup-vis"), data);

    histVis = new HistVis($("#hist-vis"), data);

    // Add mouseup listener to slider handles
    var handles = $('.noUi-handle');
    handles[0].addEventListener('mouseup', function () {
        timelineChart.updateVisualization();
    });
    handles[1].addEventListener('mouseup', function () {
        timelineChart.updateVisualization();
    });

    $(selectionHandler).bind("selectionChanged", function(e, planet){
      closeUp.updateSelection(planet);
    });
  });
}
