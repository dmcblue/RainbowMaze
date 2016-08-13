var lock = false;
var timer;
RainbowMaze.prototype = {
	width	:	30,
	height	:	10,
	colors_amt	:	5,
	color_pool	:	
		[
			'#DB0000',
			'#FF7F00',
			'#FFFF00',
			'#00BB27',
			'#03E',
			'#6F00FF',
			'#CB0FFF',
		],
	autoload	:	false,
	started	:	false
}

RainbowMaze.time = 500;
RainbowMaze.up = [0,-1];
RainbowMaze.right = [1,0];
RainbowMaze.down = [0,1];
RainbowMaze.left = [-1,0];
RainbowMaze.START = -1;
RainbowMaze.END = -2;

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
	this.init();
}

RainbowMaze.prototype.init = function(){
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

RainbowMaze.check = function(loc_a, loc_b, field){
	return loc_a[field] === loc_b[field];
};

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

RainbowMaze.prototype.getLoc = function(x, y){
	x = parseInt(x);
	y = parseInt(y);
	return jQuery('#RainbowMaze'+this.id+' #RainbowMaze'+this.id+'_row_'+y+' #RainbowMaze'+this.id+'_loc_'+x);
}

RainbowMaze.prototype.draw = function(){
	this.id = jQuery('.RainbowMaze').length;
	var html = '<div class="RainbowMaze" id="RainbowMaze'+this.id+'">';
	for(var i = 0, ilen = this.maze.length; i < ilen; i++){
		html += '<div class="RainbowMaze_row" id="RainbowMaze'+this.id+'_row_'+i+'">';
		for(var j = 0, jlen = this.maze[i].length; j < jlen; j++){
			html += '<div class="RainbowMaze_loc RainbowMaze'+this.id+'_loc" '
				+'id="RainbowMaze'+this.id+'_loc_'+j+'" '
				+'style="background:'+((this.maze[i][j].color > 0)?this.colors[this.maze[i][j].color]: this.colors[0])+';">'
				/*+this.maze[i][j].color*/+'</div>';
		}
		html += '</div>';
	}
	html += '<div class="RainbowMaze_player" id="RainbowMaze'+this.id+'_player"><div></div></div>'
		+'<div class="RainbowMaze_console" id="RainbowMaze'+this.id+'_console"></div>'
		+'<div class="RainbowMaze_timer" id="RainbowMaze'+this.id+'_console"><span id="min">00</span>:<span id="sec">00</span></div>'
		+'<div>Moves: <span class="RainbowMaze_moves" id="RainbowMaze'+this.id+'_moves">0</span></div>'
		+'</div>'//overall inner container
		;
	jQuery(this.container_id).css('position','relative').empty().append(html).hide(0).fadeIn(RainbowMaze.time);
	
	this.getLoc(this.start.x, this.start.y).css({'background':'#FFF','border':'1px solid #000'});
	
	this.getLoc(this.end.x, this.end.y).css({'background':'#000','border':'1px solid #000'});
	
	this.setPlayer(this.start.x, this.start.y);
	this.controls();
};

RainbowMaze.prototype.controls = function(){
	var closure = function(rm){
		return function(e) {
			if(lock){
				return;
			}
			lock = true;
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

				default: lock = false;return;
			}
			if(e.which >= 37 && e.which <= 40){
				jQuery('#RainbowMaze'+rm.id+'_moves').text(parseInt(jQuery('#RainbowMaze'+rm.id+'_moves').text())+1);
				if(!rm.started){
					startTimer();
					rm.started = true;
				}
			}
			e.preventDefault(); // prevent the default action (scroll / move caret)
		};
	};
	jQuery(document).unbind('keydown').keydown(closure(this));
}

RainbowMaze.prototype.setPlayer = function(x, y){
	if(x < 0 || x >= this.maze[0].length || y < 0 || y >= this.maze.length){
		return;
	}
	var e = this.getLoc(x, y);
	var pos = e.position();
	var size = e.outerWidth();
	var player = jQuery('#RainbowMaze'+this.id+'_player');
	var offset = parseInt(e.css('margin-left').replace('px'));
	player
		.css({
			'top':(pos.top)+'px', 
			'left':(pos.left+offset)+'px'
		}).data(
			'x',x
		).data(
			'y',y
		);
}

RainbowMaze.prototype.movePlayer = function(dir){
	var player = jQuery('#RainbowMaze'+this.id+'_player');
	var nx = parseInt(player.data('x')) + dir[0];
	var ny = parseInt(player.data('y')) + dir[1];
	if(!this.checkPos(nx, ny)){
		lock = false;return;
	}
	var time = RainbowMaze.time;
	var e = this.getLoc(nx, ny);
	//console.log(e);
	var pos = e.position();
	var player_pos = player.position();
	var vert = pos.top - player_pos.top;
	if(vert < 0){
		vert = vert * -1;
		vert = '-='+vert;
	}else{
		vert = '+=' + vert;
	}
	var offset = parseInt(e.css('margin-left').replace('px'));
	var horz = (pos.left + offset) - player_pos.left;
	if(horz < 0){
		horz = horz * -1;
		horz = '-='+horz;
	}else{
		horz = '+=' + horz;
	}
	player
		.animate(
			{
				top : vert,
				left : horz
			}, 
			RainbowMaze.time
		)
		.data(
			'x',nx
		)
		.data(
			'y',ny
		);
	if(this.maze[ny][nx].color === RainbowMaze.START){
		;
	}else if(this.maze[ny][nx].color === RainbowMaze.END){
		console.log('Win!');this.win();
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
					rm.teleport(t.x, t.y)
				};
			};
		setTimeout(closure(this, target),RainbowMaze.time);
	}
	
	setTimeout(function(){lock = false;},time);
}

RainbowMaze.prototype.teleport = function(x,y){
	var player = jQuery('#RainbowMaze'+this.id+'_player');
	var e = this.getLoc(x, y);
	var pos = e.position();
	var closure = 
		function(rm, p, tx, ty){
			return function(){
				rm.setPlayer(tx,ty);
				p
					.fadeIn(RainbowMaze.time)
					.data(
						'x',tx
					)
					.data(
						'y',ty
					);
			};
		};
	player.fadeOut(RainbowMaze.time, closure(this, player, x, y));
};

RainbowMaze.prototype.checkPos = function(x,y){
	return !(x < 0 || x >= this.maze[0].length || y < 0 || y >= this.maze.length);
};

RainbowMaze.dist = function(x1,y1,x2,y2){
	return Math.max(Math.abs(x1 - x2),Math.abs(y1 - y2));
}

RainbowMaze.prototype.win = function(){
	jQuery('#RainbowMaze'+this.id+'_console').text('You Won!');
	jQuery('.RainbowMaze'+this.id+'_loc').animate({'opacity': 0.3}, RainbowMaze.time);
	endTimer();
};

var startTimer = function(){
	continueTimer();
	timer = setInterval(continueTimer,1000);
};

var continueTimer = function(){
	var min = parseInt(jQuery('#min').text());
	var sec = parseInt(jQuery('#sec').text());
	if(sec === 59){
		min++;
	}
	sec = (sec + 1)%60;
	min = (min > 9) ? min : '0'+min;
	sec = (sec > 9) ? sec : '0'+sec;
	jQuery('#min').text(min);
	jQuery('#sec').text(sec);
};
var endTimer = function(){
	window.clearInterval(timer);
	//timer_go = false;
}