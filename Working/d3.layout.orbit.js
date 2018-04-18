d3.layout.orbit = function() {
	var currentTickStep = 0;
	var orbitNodes;
	var orbitSize = [1,1];
	var nestedNodes;
	var flattenedNodes = [];
	var tickRadianStep = 0.004363323129985824;
    var orbitDispatch = d3.dispatch('tick');
    var tickInterval;
    var childrenAccessor = function(d) {return d.children};
    var tickRadianFunction = function() {return 1};
    var orbitRadius = function() {return 1};

	// returns instance of _orbitLayout
	// useful to change layout of this instance from another file
	// not used in this project
	function _orbitLayout() {
		return _orbitLayout;
	}

	// function to power the animation
	_orbitLayout.start = function() {
		tickInterval = setInterval(
			function() {
			currentTickStep++; // increment which tick we're on
			flattenedNodes.forEach(function(_node){ // for each planet
				if (_node.parent) { // if this planet has a parent (so it's not the center point)
					// animate it spinning around the parent
					// calculate the new x and y to draw the planet
					_node.x = _node.parent.x + ( orbitRadius(_node) * Math.sin( _node.angle + (currentTickStep * tickRadianStep * tickRadianFunction(_node))) );
					_node.y = _node.parent.y + ( orbitRadius(_node) * Math.cos( _node.angle + (currentTickStep * tickRadianStep * tickRadianFunction(_node))) );
				}
			})
			orbitDispatch.tick(); // send a message to the html to redraw the planets
		}, 
		1);
	}

	// function to stop the spinning
	_orbitLayout.stop = function() {
		clearInterval(tickInterval);
	}

	// can be used to adjust the speed of all the points
	_orbitLayout.speed = function(_degrees) {
		if (!arguments.length) return tickRadianStep / (Math.PI / 360);
		tickRadianStep = tickRadianStep = _degrees * (Math.PI / 360);
		return this;
	}

	// function to set the size of the visualization
	_orbitLayout.size = function(_value) {
		if (!arguments.length) return orbitSize;
		orbitSize = _value;
		return this;
	}

	// function to set the speed of the orbits
	_orbitLayout.revolution = function(_function) {
		if (!arguments.length) return tickRadianFunction;
		tickRadianFunction = _function;
		return this
	}

	// function to set the orbit Radius of the planets
	_orbitLayout.totallyrad = function(_function) {
		if (!arguments.length) return orbitRadius;
		orbitRadius = _function;
		return this
	}

	// function to transform the original data by calling calculateNodes
	_orbitLayout.nodes = function(_data) {
    	if (!arguments.length) return flattenedNodes;
		nestedNodes = _data;
		// find children and transform the data
    	calculateNodes();
		return this;
	}

	// function to set the function used to calculate how many children nodes there are
	_orbitLayout.children = function(_function) {
    	if (!arguments.length) return childrenAccessor;
    	childrenAccessor = _function;
    	return this;
	}

	// used to send new locations to html on tick to be redrawn
	d3.rebind(_orbitLayout, orbitDispatch, "on");
	
	// return the instance of the orbit class to the html
	return _orbitLayout;

	function calculateNodes() {
		var _data = nestedNodes; 
		//If you have an array of elements, then create a root node (center)
		orbitNodes = {key: "root", values: _data}
		orbitNodes.x = orbitSize[0] / 2; // finds the center of the visualization
		orbitNodes.y = orbitSize[1] / 2; // finds the center of the visualization
		orbitNodes.depth = 0; // the root node (the center) has depth 0

		// add this data with a new center as the key to flattenedNodes
		flattenedNodes.push(orbitNodes);

		// sends this data to traverseNestedData
		traverseNestedData(orbitNodes);

		// for each child of the current object, we will add the starting position to be drawn,
		// the identity of the parent, and the depth of 1 for each
		function traverseNestedData(_node) {
			if(childrenAccessor(_node)) { // if there are children of this data (i.e. planets, moons)
				var totalChildren = childrenAccessor(_node).length; // how many children
				// for each child
				for (var x = 0; x<totalChildren;x++) {
					// set the random starting point
					childrenAccessor(_node)[x].angle = Math.random()*360;
					// set the parent of this child
					childrenAccessor(_node)[x].parent = _node;
					// set the depth of this child to be 1
					childrenAccessor(_node)[x].depth = 1;
					// add this planet to the flattenedNodes so it can be animated orbiting it's parent
					flattenedNodes.push(childrenAccessor(_node)[x]);
				}

			}
		}

	}

}