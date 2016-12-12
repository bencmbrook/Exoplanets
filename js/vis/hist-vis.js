/**
 * Created by mattdeveney on 11/27/16.
 */

HistVis = function(_parentElement, _parentData){
    this.parentElement = _parentElement;
    this.parentData = _parentData;
    this.displayData = [];

    this.initVis();
};


HistVis.prototype.initVis = function () {
    var vis = this;

    // SVG drawing area

    vis.margin = {top: 25, right: 40, bottom: 60, left: 80};

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement.selector).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // scales
    vis.xScale = d3.scale.linear()
        .rangeRound([20, vis.width]);

    vis.yScale = d3.scale.linear()
        .range([vis.height -20 , 0]);

    vis.radiusScale = d3.scale.linear()
        .range([2, 20]);

    // x-axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.xScale)
        .orient("bottom");

    // y-axis
    vis.yAxis = d3.svg.axis()
        .scale(vis.yScale)
        .orient("left");


    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(0,0)");


    //define clipping
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // Initialize data
    vis.wrangleData();

};

HistVis.prototype.wrangleData = function() {

    var vis = this;

    vis.xCategory = d3.select("#scat-xCategory").property("value");
    vis.yCategory = d3.select("#scat-yCategory").property("value");
    vis.radCategory = d3.select("#scat-radiusCategory").property("value");

    // get data specific to category
    vis.catData = vis.parentData.map(function(d){

        var xRaw = +d[vis.xCategory];
        var yRaw = +d[vis.yCategory];
        var radRaw = +d[vis.radCategory];

        var xConverted;
        var yConverted;
        var radConverted;

        // convert to appropriate units
        if (vis.xCategory == "PlanetaryMassJpt") {
            // earth masses
            xConverted = xRaw * 317.8;
        } else if (vis.xCategory == "RadiusJpt") {
            // earth radii
            xConverted = xRaw * 11.209;
        } else {
            xConverted = xRaw;
        }

        // convert to appropriate units
        if (vis.yCategory == "PlanetaryMassJpt") {
            // earth masses
            yConverted = yRaw * 317.8;
        } else if (vis.yCategory == "RadiusJpt") {
            // earth radii
            yConverted = yRaw * 11.209;
        } else {
            yConverted = yRaw;
        }

        // convert to appropriate units
        if (vis.radCategory == "PlanetaryMassJpt") {
            // earth masses
            radConverted = radRaw * 317.8;
        } else if (vis.xCategory == "RadiusJpt") {
            // earth radii
            radConverted = radRaw * 11.209;
        } else {
            radConverted = radRaw;
        }

        var converted = {
            planet : d.PlanetIdentifier,
            xCat : convertCategory(vis.xCategory),
            yCat : convertCategory(vis.yCategory),
            radCat : convertCategory(vis.radCategory),
            x : xConverted,
            y : yConverted,
            rad: radConverted
        };

        return converted;
    });

    vis.nonNullData = vis.catData.filter(function(d){
        return (d.x !== 0 && d.y !== 0 && d.rad !== 0);
    });

    vis.displayData = vis.nonNullData;

    vis.updateVisualization();
};

HistVis.prototype.updateVisualization = function () {

    var vis = this;

    // vis.svg.selectAll("text").remove();

    vis.generateTooltips();

    console.log(d3.max(vis.displayData, function (d){
        return d.y;
    }));

    vis.xScale.domain([0, d3.max(vis.displayData, function(d){
        return d.x;
    })]);

    vis.yScale.domain([0,d3.max(vis.displayData, function (d){
        return d.y;
    })]);

    vis.radiusScale.domain([0,d3.max(vis.displayData, function (d){
        return d.rad;
    })]);

    vis.dot = vis.svg.selectAll(".dot")
        .data(vis.displayData, function(d){return d.planet;});

    vis.dot
        .enter().append("circle")
        .attr("class", "dot")
        .attr("fill","rgba(185,185,185, 0.5)")
        .attr("stroke", "rgb(185,185,185)")
        .attr("r", function(d){
            return vis.radiusScale(d.rad);
        })
        .attr("cx", function(d){
            return vis.xScale(d.x);})
        .attr("cy", function(d){return vis.yScale(d.y);})
        .on("mouseover", vis.tip.show)
        .on("mouseout", vis.tip.hide);

    vis.dot
        .transition(400)
        .attr("r", function(d){
            return vis.radiusScale(d.rad);
        })
        .attr("cx", function(d){
            return vis.xScale(d.x);})
        .attr("cy", function(d){return vis.yScale(d.y);});

    vis.dot.exit().remove();

    vis.svg.select(".x-axis")
        .call(vis.xAxis);

    vis.svg.selectAll(".ax-label").remove();

    vis.svg.select(".x-axis")
        .append("text")
        .attr("class","ax-label")
        .attr("x", vis.width / 2 - 10)
        .attr("y", 50)
        .text(convertCategory(vis.xCategory));

    vis.svg.select(".y-axis")
        .call(vis.yAxis);

    vis.svg.select(".y-axis")
        .append("text")
        .attr("class","ax-label")
        .attr("y", -50)
        .attr("x", -220)
        .text(convertCategory(vis.yCategory))
        .attr("transform", "rotate(-90)");

};

HistVis.prototype.generateTooltips = function() {

    var vis = this;

    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .attr("class", "scatter-tip")
        .offset([-10,0])
        .html(function (d){

            var planet = vis.parentData.filter(function(d1){
               return (d1.PlanetIdentifier == d.planet);
            })[0];

            var str = "";

            str += "<h3 class='scatter-tip-title'>Planet: " + planet.PlanetIdentifier + "</h3>";

            if (planet.PlanetaryMassJpt) {
                str += "<p>Mass: " + (planet.PlanetaryMassJpt * 317.8).toFixed(1) + " Earth Masses";
            }
            if (planet.SurfaceTempK) {
                str += "<p>Surface Temperature: " + planet.SurfaceTempK.toFixed(0) + " K";
            }
            if (planet.RadiusJpt) {
                str += "<p>Planetary Radius: " + (planet.RadiusJpt * 11.209).toFixed(1) + " Earth Radii";
            }
            if (planet.PeriodDays) {
                str += "<p>Length of Year: " + planet.PeriodDays.toFixed(1) + " days";
            }
            if (planet.SemiMajorAxisAU) {
                str += "<p>Orbital Radius: " + planet.SemiMajorAxisAU.toFixed(2) + " AU";
            }


            return str;
        });

    vis.svg.call(vis.tip);
};


function convertCategory(category) {
    if (category == "PlanetaryMassJpt") {
        // earth masses
        return "Mass (in Earth Masses)";
    } else if (category == "RadiusJpt") {
        // earth radii
        return "Radius (in Earth Radii)";
    } else if (category == "PeriodDays") {
        return "Orbital Period (Days)";
    } else if (category == "SurfaceTempK") {
        return "Surface Temperature (Kelvin)";
    } else if (category == "AgeGyr") {
        return "Age (Billions of years)";
    } else {
        return "Orbital Radius (AU)";
    }
}
