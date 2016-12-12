# Exoplanets: The Search for New Worlds
###### Ben Brook, Matt Deveney, Kenny Okagaki and Hunter Simmons
###### Project Website:
###### Screencast Video:
###### Process Book:

### Project Overview
Our project set out to explore the history and current status of exoplanet discovery. We progress from the way exoplanets are discovered, to the characteristics of known exoplanets, to the limitations of current scientific knowledge and the future of exoplanet discovery.

1. Exoplanet Discovery
    * Visualizations of two main discovery methods for exoplanets
    * Historical chart with number of discoveries by year
2. Exoplanet Characteristics
    * Scatterplot of exoplanet characteristics with encoding for x-axis, y-axis and dot radius
3. Earth-like Planets
    * Super-imposed "solar system" (orbit visualization) of the ten most likely-habitable planets
        * Encodes for planet size, orbital radius, orbital velocity, and temperature
        * Note: Orbital Radius is not to scale (this is due to a limitation of the d3 orbit layout library that spaces orbital rings uniformly rather than on a linear scale.
    * Close-up visualization of the ten habitable planets with 3D color-texture map and planet statistics
4. The Journey Ahead
    * Custom "spaceship" visualization that simulates travel to an exoplanet in distance and years for multiple real and fictional spacecraft

### File Documentation
Our main JavaScript file is main.js, which loads the data, preprocesses it, and calls each of our original visualizations. Each visualization is contained in its own separate JS file, as follows
* timeline-vis.js: contains code for the line chart of historical exoplanet discovery

* hist-vis.js: contains code for the scatterplot for characteristics of all exoplanets

* radial-vis.js: contains code for the dynamic orbiting visualization of the ten earthlike planets, with a temperature color scale

* closeup-vis.js: contains code for the earthlike planet closeup visualization, that displays planet characteristics and a 3-dimensional texture map of the planet's likely visual appearance

* spaceship-vis.js: contains code for the custom "spaceship journey" visualization that calculates how long it would take for different spacecraft to reach certain exoplanets

Our project also contains several non-original visualizations to supplement our own.
* The embedded animations for wobbling and dimming stars are mp4 files borrowed from NASA's exoplanet exploration project.

* The video describing the "Habitable Zone" was taken from the following source: https://gfycat.com/ifr/BaggySpottedKakarikis'%20frameborder='0'%20scrolling='no'%20width='840'%20height='461

* The 3D color-texture maps used in the closeup visualization were taken from various online image sources.
