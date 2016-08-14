RainbowMaze.prototype = {
	width	:	30,
	height	:	10,
	colors_amt	:	5,
	color_pool	:	
		[
			'#DB0000', //red
			'#FF7F00', //orange
			'#FFFF00', //yellow
			'#00BB27', //green
			'#03E',    //blue
			'#6F00FF', //purple
			'#CB0FFF', //pink?
		],
	autoload	:	false,
	started	:	false,
	moves	:	0,
	minutes	:	0,
	seconds	:	0,
	lock	:	false,
	x		:	0,
	y		:	0
}

/* Static 'Values' */ 
RainbowMaze.time = 500;
RainbowMaze.up = [0,-1];
RainbowMaze.right = [1,0];
RainbowMaze.down = [0,1];
RainbowMaze.left = [-1,0];
RainbowMaze.START = -1;
RainbowMaze.END = -2;

RainbowMaze.events =
	{
		keydown		:	'keydown.RainbowMaze',
		moveUpdate	:	'RainbowMaze_event_moveupdate',
		timeUpdate	:	'RainbowMaze_event_timeupdate',
		win			:	'RainbowMaze_event_win'
	};

RainbowMaze.classes =
	{
		base	:	'RainbowMaze',
		board	:	'RainbowMazeBoard',
		row		:	
			{
				base : 'RainbowMaze_row',
				id : 
					function(rid){
						return 'RainbowMaze_row_' + rid;
					},
			},
		tile	:	
			{
				base : 'RainbowMaze_tile', //loc
				id : 
					function(rid, cid){
						return 'RainbowMaze_row_' + rid
								+'_tile_' + cid;
					},
			},
		buttons	:	
			{
				main	:	'RainbowMaze_button',
				up		:	'RainbowMaze_button_up',
				right	:	'RainbowMaze_button_right',
				down	:	'RainbowMaze_button_down',
				left	:	'RainbowMaze_button_left',
			},
		player	:	'RainbowMaze_player'
	};

RainbowMaze.placeholder = '%d';
RainbowMaze.ids =
	{
		base :	
			function(id){
				return 'RainbowMaze' + id;
			}
	};
/* END Static 'Values' */ 	


/* Static Methods */ 
/**
 * Searches the neighbors at distance 'radius' of object at 'loc' in a 2D array 
 * of objects, returning the set of matches whose property
 * 'field' has the same value as the 'field' of the object at 'loc'
 * 
 * @param [[Object]] array The array (maze) of objects
 * @param Object loc Object with properties x and y as the location
 * @param String field Name of the object property to compare
 * @param Integer radius Distance from 'loc' at which to search
 * @return [Object] An array of objects with properties x, y for the location
 * of matches.
 */
RainbowMaze.borderSearch = function(array,loc,field,radius){
	var top = loc.y - radius, r_top = Math.max(top,0),
		bottom = loc.y + radius, r_bottom = Math.min(bottom, array.length - 1),
		left = loc.x - radius, r_left = Math.max(loc.x - radius,0),
		right = loc.x + radius, r_right = Math.min(loc.x + radius, array[0].length - 1);
	var matches = [];
	for(var i = r_top, ilen = r_bottom; i <= ilen; i++){
		if(i === top || i === bottom){
			for(var j = r_left, jlen = r_right; j <= jlen; j++){
				if(RainbowMaze.check(loc, array[i][j], field)){
					var p = {
						x : array[i][j].x,
						y : array[i][j].y
					};
					
					matches.push(p);
				}
			}
		}else{
			if(left === r_left){
				if(RainbowMaze.check(loc, array[i][r_left], field)){
					var p = {
						x : array[i][r_left].x,
						y : array[i][r_left].y
					};
					
					matches.push(p);
				}
			}
			if(right === r_right){
				if(RainbowMaze.check(loc, array[i][r_right], field)){
					var p = {
						x : array[i][r_right].x,
						y : array[i][r_right].y
					};
					
					matches.push(p);
				}
			}
		}
	}
	return matches;
};

/**
 * Checks if the same property on two objects has the same value
 * 
 * @param Object loc_a first object
 * @param Object loc_b second object
 * @param String field the name of the property to be compared
 * 
 */
RainbowMaze.check = function(loc_a, loc_b, field){
	return loc_a[field] === loc_b[field];
};

/**
 * Calculates the distance between two points according to RainbowMaze 
 * distance definition
 * 
 * @param Integer x1 Row coordinate of point 1
 * @param Integer y1 Column coordinate of point 1
 * @param Integer x2 Row coordinate of point 2
 * @param Integer y2 Column coordinate of point 2
 * @return Integer Distance between the points
 */
RainbowMaze.dist = function(x1, y1, x2, y2){
	return Math.max(Math.abs(x1 - x2),Math.abs(y1 - y2));
}

/**
 * Finds the center of an HTMLElement
 * 
 * @return Object Location object with x, y properties (pixels)
 */
RainbowMaze.getLocCenter = function(loc){
	var bbox = loc.get(0).getBoundingClientRect();
	return {
		x : Math.round(bbox.left + bbox.width/2),
		y : Math.round(bbox.top + bbox.height/2)
	};
};

/**
 * Searches an array of Objects for the nearest matches who have the same 
 * property value for property 'field' as the Object at location 'loc'
 * 
 * @param [[Object]] array The array (maze) of objects
 * @param Object loc Object with properties x and y as the location
 * @param String field Name of the object property to compare
 * @return [Object] Array of objects with x, y properties for locations
 */
RainbowMaze.nearestArray = function(array,loc,field){
	var matches = [],
		radius = 0,
		max_radius = Math.max(array.length, array[0].length); //can be optimized
	do{
		radius++;
		matches = RainbowMaze.borderSearch(array,loc,field,radius);
	}while(matches.length === 0 && radius <= max_radius);
	return matches;
};

RainbowMaze.sprintf = 
	function(str, a, b){
		b = b || null;
		return b === null
			? str.replace(RainbowMaze.placeholder, a)
			: str.replace(RainbowMaze.placeholder, a)
				.replace(RainbowMaze.placeholder, b)
		;
	};
/* END Static Methods */ 


function RainbowMaze (args){
	/*
	 *	Argument names as keys, whether they are required as values
	 */
	var arg_def = {
		"container_id"	:	true,
		"width"	:	false,
		"height"	:	false,
		"colors_amt"	:	false,
		"color_set"	:	false,
		"autoload"	:	false,
		"start"	:	false,
		"end"	:	false
	}
	
	var arg_names = Object.keys(arg_def);
	
	for(var i = 0, ilen = arg_names.length; i < ilen; i++){
		var name = arg_names[i];
		if(arg_def[name]){
			this[name] = args[name];
		}else{
			if(args[name] !== undefined){
				this[name] = args[name];
			}
		}
	}
	
	//further requirements
	//--color_set.length === colors_amt, if color_set is customized
	this.colors = [];
	var color_indices = [];
	if(args["color_set"] !== undefined){
		this.colors_amt = this.color_set.length;
		
		color_indices = array_sequence_1n(this.colors_amt);
		
		//Set color palette
		for(var i = 0, ilen = color_indices.length; i < ilen; i++){
			this.colors.push(this.color_set[color_indices[i]]);
		}
	}else{
		//get random set from pool
		if(this.colors_amt > this.color_pool.length){
			throw "Not enough colors in pool.";
		}
		
		color_indices = array_random_indices(this.color_pool.length);
		
		//Set color palette
		for(var i = 0, ilen = this.colors_amt; i < ilen; i++){
			this.colors.push(this.color_pool[color_indices[i]]);
		}
	}
	
	//--Set start and end if not set
	if(args["start"] === undefined){
		this.start = {
			x : rand_int(0, this.width),
			y : rand_int(0, this.height)
		};
		do{
			this.end = {
				x : rand_int(0, this.width),
				y : rand_int(0, this.height)
			};
		}while((this.end.x === this.start.x 
			&& this.end.y === this.start.y) ||
			(Math.abs(this.end.x - this.start.x) < this.width/3 
			|| Math.abs(this.end.y - this.start.y) < this.height/3));
	}
	
	this._init();
}

/**
 * Internal initialization function.  If this.autoload is TRUE, this.draw()
 * will be called at the end.
 */
RainbowMaze.prototype._init = function(){
	this.maze = [];
	var colors_amt = this.colors_amt;
	//build maze
	for(var i = 0, ilen = this.height; i < ilen; i++){
		this.maze.push([]);
		for(var j = 0, jlen = this.width; j < jlen; j++){
			var maze_loc = {
				x	:	j,
				y	:	i,
				color	:	rand_int(0, colors_amt),
				matches : [this.start]
			};
			this.maze[i].push(maze_loc);
		}
	}
	
	this.maze[this.start.y][this.start.x].color = RainbowMaze.START;
	this.maze[this.end.y][this.end.x].color = RainbowMaze.END;
	for(var i = 0, ilen = this.height; i < ilen; i++){
		for(var j = 0, jlen = this.width; j < jlen; j++){
			if(this.maze[i][j].color >= 0){
				var matches = RainbowMaze.nearestArray(this.maze,this.maze[i][j],"color");
				if(matches.length > 0){
					this.maze[i][j].matches = matches;
				}
			}
		}
	}
	if(this.autoload){
		this.draw();
	}
}

/**
 * Checks if a coordinate is within the maze bounds
 * 
 * @param Integer x Row coordinate
 * @param Integer y Column coordinate
 * @return Boolean Whether coordinate is in bounds
 */
RainbowMaze.prototype.checkPos = function(x,y){
	return !(x < 0 || x >= this.maze[0].length || y < 0 || y >= this.maze.length);
};

/**
 * Starts a timer for the maze
 * @param RainbowMaze rainbowMaze Enclosed maze object
 */ 
RainbowMaze.continueTimer = function(rainbowMaze){
	return function(){
		if(rainbowMaze.seconds === 59){
			rainbowMaze.minutes++;
		}
		rainbowMaze.seconds = (rainbowMaze.seconds + 1)%60;
		rainbowMaze.getRoot()
			.trigger(
				RainbowMaze.events.timeUpdate,
				{ 
					minutes : rainbowMaze.minutes,
					seconds : rainbowMaze.seconds
				}
			);
	}
};

/**
 * Draws the maze (adds it to HTML DOM)
 */
RainbowMaze.prototype.draw = function(){
	this.id = jQuery('.' + RainbowMaze.classes.base).length;
	
	var html =
		jQuery('<div>')
			.addClass(RainbowMaze.classes.base)
			.attr('id', RainbowMaze.ids.base(this.id))
		;
	var table = 
		jQuery('<table>')
			.addClass(RainbowMaze.classes.board)
		;
	var tbody = jQuery('<tbody>'); 
	for(var i = 0, ilen = this.maze.length; i < ilen; i++){
		var tr = 
			jQuery('<tr>')
				.addClass(RainbowMaze.classes.row.base)
				.addClass(RainbowMaze.classes.row.id(i))
			;
		for(var j = 0, jlen = this.maze[i].length; j < jlen; j++){
			var color = 
				(this.maze[i][j].color > 0)
					? this.colors[this.maze[i][j].color]
					: this.colors[0]
				;
			var td = 
				jQuery('<td>')
					.addClass(RainbowMaze.classes.tile.base)
					.addClass(RainbowMaze.classes.tile.id(i, j))
					.css('background', color)
					.append(
						jQuery('<div>')
							.addClass(RainbowMaze.classes.buttons.main)
					)
				;
			tr.append(td);
		}
		tbody.append(tr);
	}
	var rm = this;
	table
		.append(tbody)
		.on(
			'click',
			'.' + RainbowMaze.classes.buttons.up, 
			function(){rm.movePlayer(RainbowMaze.up);}
		)
		.on(
			'click',
			'.' + RainbowMaze.classes.buttons.right, 
			function(){rm.movePlayer(RainbowMaze.right);}
		)
		.on(
			'click',
			'.' + RainbowMaze.classes.buttons.down, 
			function(){rm.movePlayer(RainbowMaze.down);}
		)
		.on(
			'click',
			'.' + RainbowMaze.classes.buttons.left, 
			function(){rm.movePlayer(RainbowMaze.left);}
		)
	;
	html.append(table);
	
	
	jQuery(this.container_id)
		.empty()
		.append(html)
	;
	
	
	jQuery(this.container_id)	
		.hide(0)
		.fadeIn(RainbowMaze.time)
	;
	
	this.getLoc(this.start.x, this.start.y).css({'background':'#FFF','border':'1px solid #000'});
	
	this.getLoc(this.end.x, this.end.y).css({'background':'#000','border':'1px solid #000'});
	
	this.setPlayer(this.start.x, this.start.y);
	this.setKeyboardControls();
};

/**
 * End the timer
 */
RainbowMaze.prototype.endTimer = function(){
	window.clearInterval(this.timer);
}

/**
 * Returns a jQuery object for location in maze
 * 
 * @param Integer x The row
 * @param Integer y The column
 * @return jQueryObject Location to this maze
 */
RainbowMaze.prototype.getLoc = function(x, y){
	x = parseInt(x);
	y = parseInt(y);
	return this.getRoot()
		.find('.' + RainbowMaze.classes.tile.id(y, x))
	;
}

/**
 * Returns a jQuery object for the root element of this maze.
 * 
 * @return jQueryObject root to this maze
 */
RainbowMaze.prototype.getRoot = function(){
	return jQuery('#'+ RainbowMaze.ids.base(this.id));
};

/**
 * Animates the movement of the player in a cardinal direction.
 * 
 * @param [Integer] dir Indicates a direction of movement.
 */
RainbowMaze.prototype.movePlayer = function(dir){
	var player = this.getRoot().find('.' + RainbowMaze.classes.player);
	var nx = parseInt(this.x) + dir[0];
	var ny = parseInt(this.y) + dir[1];
	
	if(!this.checkPos(nx, ny)){
		this.lock = false;return;
	}
	var time = RainbowMaze.time;
	var e = this.getLoc(nx, ny);
	var center = RainbowMaze.getLocCenter(e);
	var player_pos = player.position();
	
	var vert = dir[1] * player.height();
	var horz = dir[0] * player.width();
	
	player
		.animate(
			{
				top : vert,
				left : horz
			}, 
			RainbowMaze.time
		)
	;
	this.x = nx;
	this.y = ny;
	
	this.getRoot()
		.trigger(
			RainbowMaze.events.moveUpdate,
			++this.moves
		);
	if(!this.started){
		this.startTimer();
		this.started = true;
	}
	
	if(this.maze[ny][nx].color === RainbowMaze.START){
		this.setPlayer(this.x,this.y);
		this.setButtons(this.x,this.y);
		this.lock = false;
	}else if(this.maze[ny][nx].color === RainbowMaze.END){
		this.win();
	}else{
		var target;
		if(this.maze[ny][nx].matches.length > 0){
			target = this.maze[ny][nx].matches[rand_int(0,this.maze[ny][nx].matches.length)];
		}else{
			target = this.start;
		}
		
		time += RainbowMaze.time*2;
		var closure = 
			function(rm,t){
				return function(){
					rm.teleport(t.x, t.y);
				};
			};
		setTimeout(closure(this, target),RainbowMaze.time);
	}
}

/**
 * Sets interface buttons around a location
 * 
 * @param Integer x Row coordinate
 * @param Integer y Column coordinate
 */
RainbowMaze.prototype.setButtons = function(x, y){
	var rm = this;
	
	this.getRoot().find('.' + RainbowMaze.classes.buttons.main)
		.not('.' + RainbowMaze.classes.player)
		.fadeOut(RainbowMaze.time)
		.promise()//waits til all are hidden
		.done(
			function(){
				rm.getRoot().find('.' + RainbowMaze.classes.buttons.main)
					.removeClass(RainbowMaze.classes.buttons.up)
					.removeClass(RainbowMaze.classes.buttons.right)
					.removeClass(RainbowMaze.classes.buttons.down)
					.removeClass(RainbowMaze.classes.buttons.left)
				;
				var dirs = 
					[{
						name : 'up',
						pos : [x + RainbowMaze.up[0], y + RainbowMaze.up[1]]
					},{
						name : 'left',
						pos : [x + RainbowMaze.left[0], y + RainbowMaze.left[1]]
					},{
						name : 'down',
						pos : [x + RainbowMaze.down[0], y + RainbowMaze.down[1]]
					},{
						name : 'right',
						pos : [x + RainbowMaze.right[0], y + RainbowMaze.right[1]]
					}];
				
				for(var i = 0, ilen = dirs.length; i < ilen; i++){
					var dir = dirs[i];
					if(rm.checkPos(dir.pos[0], dir.pos[1])){
						rm.getLoc(dir.pos[0], dir.pos[1])
							.children('.' + RainbowMaze.classes.buttons.main)
							.css({top : 0, left : 0})
							.addClass(RainbowMaze.classes.buttons[dir.name])
						;
					}
				}
				rm.getRoot().find('.' + RainbowMaze.classes.buttons.main)
					.fadeIn(RainbowMaze.time);
			}
		)
	;
}

/**
 * Binds all keyboard events to controls the maze
 */
RainbowMaze.prototype.setKeyboardControls = function(){
	var closure = function(rm){
		return function(e) {
			if(rm.lock){
				return;
			}
			rm.lock = true;
			switch(e.which) {
				case 37:
					rm.movePlayer(RainbowMaze.left);
					break;

				case 38:	
					rm.movePlayer(RainbowMaze.up);
					break;

				case 39:
					rm.movePlayer(RainbowMaze.right);
					break;

				case 40:
					rm.movePlayer(RainbowMaze.down);
					break;

				default: rm.lock = false;return;
			}
			
			e.preventDefault(); // prevent the default action (scroll / move caret)
		};
	};
	
	jQuery(document)
		.off(RainbowMaze.events.keydown)
		.on(RainbowMaze.events.keydown, closure(this))
	;
}


/**
 * Displays the player at the coordinates
 * 
 * @param Integer x Row coordinate
 * @param Integer y Column coordinate
 */
RainbowMaze.prototype.setPlayer = function(x, y){
	if(!this.checkPos(x,y)){
		return;
	}
	var e = this.getLoc(x, y);
	
	this.getRoot().find('.' + RainbowMaze.classes.player)
		.css({top : 0, left : 0})
		.removeClass(RainbowMaze.classes.player);
	e.children('.' + RainbowMaze.classes.buttons.main)
		//.css({top : 0, left : 0})
		.addClass(RainbowMaze.classes.player);
	var button = e.children('.' + RainbowMaze.classes.buttons.main);
	
	this.x = x;
	this.y = y;
	
	this.setButtons(x,y);
	
	this.lock = false;
}

/**
 * Starts a timer for the maze
 */ 
RainbowMaze.prototype.startTimer = function(){
	RainbowMaze.continueTimer(this);
	this.timer = setInterval(RainbowMaze.continueTimer(this),1000);
};

/**
 * Animates fadeIn, fadeOut of player from one location to the next
 * 
 * @param Integer x Row coordinate of new location
 * @param Integer y Column coordinate of new location
 */
RainbowMaze.prototype.teleport = function(x,y){
	var player = this.getRoot().find('.' + RainbowMaze.classes.player);
	var e = this.getLoc(x, y);
	var closure = 
		function(rm, p, tx, ty){
			return function(){
				rm.getRoot()
					.find('.' + RainbowMaze.classes.buttons.main)
					.css({
						top : 0,
						left : 0
					});
				
				rm.setPlayer(tx,ty); 
				
				rm.setButtons(tx, ty);
				
				p.show(0);
			};
		};
	player.fadeOut(RainbowMaze.time, closure(this, player, x, y));
};

/**
 * Calls win animations and events
 */
RainbowMaze.prototype.win = function(){
	this.getRoot()
		.find('.' + RainbowMaze.classes.tile.base)
		.animate({'opacity': 0.3}, RainbowMaze.time)
	;
	this.endTimer();
	this.getRoot()
		.trigger(
			RainbowMaze.events.win
		);
};
