/**
 * Created by kokagaki on 12/7/16.
 */

SpaceshipVis = function(_parentElement, _parentData){
    this.parentElement = _parentElement;
    this.parentData = _parentData;
    this.displayData = [];
    this.nestedData = [];

    this.initVis();
};

SpaceshipVis.prototype.initVis = function () {
    var vis = this;

    // SVG drawing area
    vis.margin = {top: 25, right: 40, bottom: 60, left: 60};

    vis.width = 1000 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement.selector).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // scales
    vis.xScale = d3.scale.linear()
        .rangeRound([0, vis.width]);
    vis.yScale = d3.scale.linear()
        .range([vis.height, 0]);



    //axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.xScale)
        .orient("bottom");
    vis.yAxis = d3.svg.axis()
        .scale(vis.yScale)
        .orient("left");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");


    //d3 tip
     vis.tip = d3.tip()
         .attr("class", "scatter-tip")
         .offset([-10, 0])
         .html(function(d) {
             return "<h3 class='scatter-tip-title'>" + d.key + "</h3><br>" + Math.round(d.distance) + " parsec away";
         });

     vis.svg.call(vis.tip);

    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // Initialize data
    vis.wrangleData();

};

SpaceshipVis.prototype.wrangleData = function() {

    var vis = this;

    // nested data format for accessing 10 habitable planets
    vis.parentData.forEach(function(d){

        var json = {
            "key" : d.PlanetIdentifier,
            "orbit" : d.SemiMajorAxisAU,
            "period" : d.PeriodDays,
            "radius" : d.RadiusJpt,
            "temp" : d.SurfaceTempK,
            "distance" : d.DistFromSunParsec
        };

        vis.nestedData.push(json);

    });

    //get habitable planets from the data set
    var habitablePlanets = vis.getHabitablePlanets();
    vis.displayData = habitablePlanets;

    //adjust planetary distance to distance from earth
    vis.displayData.forEach(function (d) {
        if (d.key === "Earth") {
            //don't adjust distance for actual earth
        }
        else if (d.key === "Kepler-1229 b") {
            //fill in blank from dataset
            d.distance = 236 - 0.000005;
        }
        else {
            d.distance = d.distance - 0.000005;
        }

    });

    //radius domain
    vis.radiusDomain = d3.extent(vis.displayData, function (d) {
        return d.radius;
    });

    //radius scale
    vis.radiusScale = d3.scale.linear()
        .domain(vis.radiusDomain)
        .range([1,10]);

    vis.updateVisualization();
};

SpaceshipVis.prototype.updateVisualization = function () {

    var vis = this;

    //calculate domain of x scale for planetary distance (parsec)
    vis.xdomain = [0,d3.max(vis.displayData, function (d) {
        return d.distance;
    })];

    //update xdomain
    vis.xScale.domain(vis.xdomain);
    vis.yScale.domain([0, 10]);

    //call xaxis
    vis.xAxisG = vis.svg.select(".x-axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis);

    //x axis label
    vis.xAxisG.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", vis.width)
        .attr("y", 35)
        .attr("fill", "white")
        .text("Distance from Earth in Parsec");


    //create distance line
    vis.line = d3.svg.line()
        .x(function (d) {
            return vis.xScale(d.distance);
        })
        .y(function (d) {
            return 200;
        });

    //group for line
    vis.lineSvg = vis.svg.append("g");

    //append path
    vis.lineSvg.append("path")
        .attr("class", "spaceship-line");

    //update line
    vis.svg.select(".spaceship-line")
        .attr("d", vis.line(vis.nestedData))
        .attr("clip-path", "url(#clip)");


    //distance labels
    vis.staticDistanceText = vis.svg.append("text")
        .attr("fill", "coral")
        .attr("y", 0)
        .attr("x", 12)
        .html("Travel time from Earth for:");

    vis.apolloDistanceLabel = vis.svg.append("text")
        .attr("fill", "white")
        .attr("y", 25)
        .attr("x", 12)
        .html("Apollo 11 Shuttle (fastest manned vehicle): ");

    vis.junoDistanceLabel = vis.svg.append("text")
        .attr("fill", "white")
        .attr("y", 50)
        .attr("x", 12)
        .html("Juno Satellite (fastest unmanned vehicle): ");

    vis.enterpriseDistanceLabel = vis.svg.append("text")
        .attr("fill", "white")
        .attr("y", 75)
        .attr("x", 12)
        .html("Startrek Enterprise (70% speed of light): ");



    //mouseover
    vis.mouseG = vis.svg.append("g")
        .attr("class", "mouse-over-effects");

    //vertical line bisector
    vis.mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    vis.lines = document.getElementsByClassName('spaceship-line');

    vis.mousePerLine = vis.mouseG.selectAll(".mouse-per-line")
        .data(vis.displayData)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    vis.mousePerLine.append("text")
        .style("fill", "white")
        .attr("transform", "translate(10,3)");

    vis.mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', vis.width) // can't catch mouse events on a g element
        .attr('height', vis.height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() { // on mouse out hide line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
        })
        .on('mouseover', function() { // on mouse in show line, circles and text
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
        })
        .on('mousemove', function() { // mouse moving over canvas
            var mouse = d3.mouse(this);
            d3.select(".mouse-line")
                .attr("d", function() {
                    var d = "M" + mouse[0] + "," + vis.height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            d3.selectAll(".mouse-per-line")
                .attr("transform", function(d, i) {

                    var beginning = 0,
                        end = vis.lines[i].getTotalLength(),
                        target = null;

                    while (true){
                        target = Math.floor((beginning + end) / 2);
                        pos = vis.lines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0])      end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }

                    //parsec label
                    d3.select(this).select('text')
                        .text(vis.xScale.invert(pos.x).toFixed(2) + " Parsec")
                        .attr("transform", "translate(5," + -15 + ")");

                    //update distance labels
                    vis.apolloDistanceLabel.html("Apollo 11 Shuttle (fastest manned vehicle):&nbsp" + vis.calculateTravelTime(vis.xScale.invert(pos.x).toFixed(2))[1] + " years");
                    vis.junoDistanceLabel.html("Juno Satellite (fastest unmanned vehicle):&nbsp&nbsp&nbsp" + vis.calculateTravelTime(vis.xScale.invert(pos.x).toFixed(2))[0] + " years");
                    vis.enterpriseDistanceLabel.html("Startrek Enterprise (70% of speed of light):&nbsp&nbsp" + vis.calculateTravelTime(vis.xScale.invert(pos.x).toFixed(2))[2] + " years");

                    return "translate(" + mouse[0] + "," + pos.y +")";
                });
        });

    //tooltip circle data bind
    vis.tooltipCircle = vis.svg.selectAll("circle")
        .data(vis.displayData);

    //enter circle
    vis.tooltipCircle.enter()
        .append("circle")
        .attr("class", "tooltip-circle")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide);

    //update circle
    vis.tooltipCircle
        .attr("r", function (d) {
            return vis.radiusScale(d.radius);
        })
        .attr("cx", function (d) {
            return vis.xScale(d.distance);
        })
        .attr("cy", function (d) {
            return 200;
        });
};

SpaceshipVis.prototype.getHabitablePlanets = function(){

    var vis = this;

    // ID's of habitable planets
    var habitableIDs = [
        "Earth",
        "Alpha Centauri B c",
        "Gliese 667 C c",
        "Kepler-442 b",
        "Kepler-452 b",
        "Wolf 1061 c",
        "Kepler-1229 b",
        "Kapteyn b",
        "Kepler-62 f",
        'Kepler-186 f'
    ];

    var habitablePlanets = vis.nestedData.filter(function(d){

        var id = d.key;

        return (habitableIDs.indexOf(id) != -1);

    });

    return habitablePlanets;

};

SpaceshipVis.prototype.calculateTravelTime = function(distanceInParsec){

    var vis = this;

    //speeds of the different shuttles
    var junoSpeed = 0.00005256;
    var apolloSpeed = junoSpeed/5;
    var enterpriseSpeed = 2.146;


    //return array with travel time for all spacecraft
    return [numberWithCommas(Math.round(distanceInParsec/junoSpeed)), numberWithCommas(Math.round(distanceInParsec/apolloSpeed)), numberWithCommas(Math.round(distanceInParsec/enterpriseSpeed))];

};
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
