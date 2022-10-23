'use strict';
function Application(options) {
	const mainCanvas = document.getElementById(options.canvasId);
	mainCanvas.width = 640;
	mainCanvas.height = 480;
	const mainContext = mainCanvas.getContext('2d', {alpha: false});
	// Create offscreen canvas
	const backCanvas = document.createElement('canvas');
	backCanvas.width = mainCanvas.width;
	backCanvas.height = mainCanvas.height;
	const ctx = backCanvas.getContext('2d', {alpha: false});
	ctx.font = "14px serif";

	function isTouchDevice() {
		return (('ontouchstart' in window) ||
			(navigator.maxTouchPoints > 0) ||
			(navigator.msMaxTouchPoints > 0));
	}
	function AnimationClip(options) {
		this.duration = options.duration || alert('duration is not set');
		this.time = 0;
		this.enabled = options.enabled || false;
		this.callback = options.callback;
		this.context = options.context;
		this.start = function() {
			this.enabled = true;
		};
		this.stop = function() {
			this.enabled = false;
		};
		this.update = function(seconds) {
			if (this.enabled) {
				this.time += seconds;
				if (this.expired()) {
					this.time = 0;
					this.enabled = false;
					if (this.callback)
						this.callback.call(this.context);
				}
			}
		};
		this.fraction = function() {
			return this.time / this.duration;
		};
		this.expired = function() {
			return this.time > this.duration;
		};
	}

	const isTouch = isTouchDevice();
	const discreteMovement = true;
	const pascalColors = {
		0:  '#000000',
		1:  '#0000aa',
		2:  '#00aa00',
		3:  '#00aaaa',
		4:  '#aa0000',
		5:  '#aa00aa',
		6:  '#aa5500',
		7:  '#aaaaaa',
		8:  '#555555',
		9:  '#5555ff',
		10: '#55ff55',
		11: '#55ffff',
		12: '#ff5555',
		13: '#ff55ff',
		14: '#ffff55',
		15: '#ffffff',
	};
	const Scenes = {
		kInitial: 0,
		kGame: 1,
		kGameOver: 2,
	};
	const keyStates = {
		stepLeft: false,
		stepRight: false,
		moveLeft: false,
		moveRight: false,
	};
	const zoid = {
		x: 320,
		y: 359,
		lives: 3,
		score: 0,
		rank: '',
		velocity: 100,
		step: 27,
		canMoveLeft: function(){
			return this.x > 50;
		},
		canMoveRight: function(){
			return this.x < 590;
		},
		stepLeft: function(){
			this.x -= this.step;
		},
		stepRight: function(){
			this.x += this.step;
		},
		moveLeft: function(seconds){
			this.x -= this.velocity * seconds;
		},
		moveRight: function(seconds){
			this.x += this.velocity * seconds;
		},
	};
	const degToRad = Math.PI / 180;
	const bomb = {
		x: 0,
		y: 0,
		velocity: 50,
		velocityMin: 75,
		velocityMax: 150,
		getVelocity: function(f){
			return this.velocityMin + (this.velocityMax - this.velocityMin)*f;
		},
		size: 10,
		lost: false,
		caught: false,
	};
	const bowl = {
		sizeX: 80,
		sizeY: 35,
		height: 339, // y-20
	};
	const groundY = 450;
	var scene = Scenes.kInitial;
	var j;
	const getRank = function(score) {
		if (score<=5) return 'Great Noob';
		if (score>5 && score<=10) return 'Noob';
		if (score>10 && score<=15) return 'Little Noob';
		if (score>15 && score<=20) return 'Great Bot';
		if (score>20 && score<=25) return 'Bot';
		if (score>25 && score<=30) return 'Little Bot';
		if (score>30 && score<=35) return 'Great Looser';
		if (score>35 && score<=40) return 'Looser';
		if (score>40 && score<=45) return 'Little Looser';
		if (score>45 && score<=60) return 'Goblin';
		if (score>60 && score<=80) return 'Child';
		if (score>80 && score<=105) return 'Teen';
		if (score>105 && score<=135) return 'Adult';
		if (score>135 && score<=170) return 'Young';
		if (score>170 && score<=210) return 'Novice';
		if (score>210 && score<=255) return 'Player';
		if (score>255 && score<=305) return 'Extended';
		if (score>305 && score<=360) return 'Cool boy';
		if (score>360 && score<=420) return 'Smart boy';
		if (score>420 && score<=485) return 'Crazy boy';
		if (score>485 && score<=555) return 'Mega Gamer';
		if (score>555 && score<=630) return 'Father';
		if (score>630 && score<=710) return 'Master';
		if (score>710 && score<=795) return 'Craftsman';
		if (score>795 && score<=885) return 'Expert';
		if (score>885 && score<=980) return 'Ace';
		if (score>980) return 'Winner';
	};
	const spawnNewBomb = function() {
		bomb.x = (Math.random()*20)*27+40;
		bomb.y = 40;
		bomb.lost = false;
		bomb.caught = false;
		bomb.velocity = bomb.getVelocity(zoid.score / 1000);
	};
	const onBombExploded = function() {
		--zoid.lives;
		if (zoid.lives == 0) {
			zoid.rank = getRank(zoid.score);
			scene = Scenes.kGameOver;
		} else {
			spawnNewBomb.call(this);
		}
	};
	var explosionClip = new AnimationClip({
		duration: 0.5,
		enabled: false,
		callback: onBombExploded,
		context: this,
	});
	var finalExplosionClip = new AnimationClip({
		duration: 2.0,
		enabled: true,
	});
	const init = function() {
		zoid.lives = 3;
		zoid.score = 0;
		zoid.x = 320;
		zoid.y = 359;
		explosionClip.enabled = false;
		explosionClip.time = 0;
		finalExplosionClip.enabled = true;
		finalExplosionClip.time = 0;
		spawnNewBomb.call(this);
	};
	const restart = function() {
		scene = Scenes.kGame;
		init.call(this);
	};
	init.call(this);

	this.load = function() {
		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));
		window.addEventListener("touchstart", this.onTouchStart.bind(this));
		window.addEventListener("touchend", this.onTouchEnd.bind(this));
		window.addEventListener("touchmove", this.onTouchMove.bind(this));
		window.addEventListener("touchcancel", this.onTouchCancel.bind(this));
		window.addEventListener("mousedown", this.onMouseDown.bind(this));
		window.addEventListener("mouseup", this.onMouseUp.bind(this));
		window.addEventListener("mousemove", this.onMouseMove.bind(this));
	};
	this.unload = function() {
		// window.removeEventListener("keydown", this.onKeyDown.bind(this));
	};
	var _processKeyStates = function(seconds) {
		if (keyStates.stepLeft) {
			keyStates.stepLeft = false;
			if (zoid.canMoveLeft() && !bomb.caught)
				zoid.stepLeft();
		}
		if (keyStates.stepRight) {
			keyStates.stepRight = false;
			if (zoid.canMoveRight() && !bomb.caught)
				zoid.stepRight();
		}
		if (keyStates.moveLeft) {
			keyStates.moveLeft = false;
			if (zoid.canMoveLeft() && !bomb.caught)
				zoid.moveLeft(seconds);
		}
		if (keyStates.moveRight) {
			keyStates.moveRight = false;
			if (zoid.canMoveRight() && !bomb.caught)
				zoid.moveRight(seconds);
		}
	};
	this.update = function(seconds) {
		_processKeyStates.call(this, seconds);
		if (scene == Scenes.kInitial) {
			// Nothing to do
		} else if (scene == Scenes.kGame) {
			explosionClip.update(seconds);
			if (bomb.y + bomb.size < groundY) {
				// The bomb is flying
				bomb.y += bomb.velocity * seconds;
				if (!bomb.caught && !bomb.lost) {
					if (bomb.y >= bowl.height - bowl.sizeY) {
						if (Math.abs(bomb.x-zoid.x) <= bowl.sizeX/2 - bomb.size) { // caught
							bomb.caught = true;
						} else { // lost
							bomb.lost = true;
						}
					}
				} else if (bomb.caught) {
					if (bowl.height - bomb.y <= bomb.size) { // bomb at bottom of the bowl
						++zoid.score;
						spawnNewBomb.call(this);
					}
				}
			} else {
				// The bomb has fallen
				if (!explosionClip.enabled)
					explosionClip.start();
			}
		} else if (scene == Scenes.kGameOver) {
			finalExplosionClip.update(seconds);
		}
	};
	var _prepare = function() {
		ctx.clearRect(0, 0, backCanvas.width, backCanvas.height);
	};
	var _setColor = function(c) {
		ctx.strokeStyle = pascalColors[c];
	};
	var _line = function(x1, y1, x2, y2) {
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
	};
	var _arc = function(x, y, startAngle, endAngle, radius) {
		var a1 = startAngle * degToRad;
		var a2 = endAngle * degToRad;
		ctx.moveTo(x + radius*Math.cos(a1), y + radius*Math.sin(a1));
		ctx.arc(x, y, radius, a1, a2);
	};
	var _circle = function(x,y,r) {
		ctx.moveTo(x + r, y);
		ctx.arc(x, y, r, 0, 2 * Math.PI);
	};
	// https://www.freepascal.org/docs-html/rtl/graph/bar.html
	var _renderOriginalBowl = function(x, y) {
		ctx.beginPath();
		_setColor(8);
		_line(x-23,y-25,x-15,y-20);
		_line(x+23,y-25,x+15,y-20);
		_line(x-15,y-20,x+15,y-20);
		_line(x-23,y-25,x-40,y-55);
		_line(x+23,y-25,x+40,y-55);
		_line(x-40,y-55,x+40,y-55);
		ctx.stroke();
	};
	var _renderBowl = function(x, y) {
		ctx.fillStyle = pascalColors[7];
		ctx.fillRect(x-bowl.sizeX/2,bowl.height-bowl.sizeY, bowl.sizeX, bowl.sizeY);
	};
	var _renderClaws = function(x, y) {
		// left
		ctx.beginPath();
		ctx.fillStyle = 'red';
		_arc(x-30,y-20,0,90,15);
		ctx.lineTo(x-25,y-5);
		ctx.lineTo(x-32,y-9);
		_arc(x-16,y-11,160,248,15);
		ctx.lineTo(x-23,y-23);
		ctx.lineTo(x-24,y-12);
		ctx.lineTo(x-15,y-20);
		ctx.fill();
		// right
		ctx.beginPath();
		ctx.fillStyle = 'red';
		_arc(x+16,y-11,-68,20,15);
		ctx.lineTo(x+32,y-9);
		ctx.lineTo(x+25,y-5);
		_arc(x+30,y-20,90,180,15);
		ctx.lineTo(x+15,y-20);
		ctx.lineTo(x+24,y-12);
		ctx.lineTo(x+23,y-23);
		ctx.fill();
	};
	var _renderBody = function(x, y) {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.moveTo(x-20,y+15);
		ctx.lineTo(x-10,y+12);
		ctx.lineTo(x+10,y+12);
		ctx.lineTo(x+20,y+15);
		ctx.lineTo(x+30,y+5);
		ctx.lineTo(x+25,y-5);
		ctx.lineTo(x+32,y-9);
		ctx.lineTo(x+40,y+5);
		ctx.lineTo(x+20,y+30);
		ctx.lineTo(x+20,y+50);
		ctx.lineTo(x+18,y+80);
		ctx.lineTo(x+8,y+80);
		ctx.lineTo(x,y+60);
		ctx.lineTo(x-8,y+80);
		ctx.lineTo(x-18,y+80);
		ctx.lineTo(x-20,y+50);
		ctx.lineTo(x-20,y+30);
		ctx.lineTo(x-40,y+5);
		ctx.lineTo(x-32,y-9);
		ctx.lineTo(x-25,y-5);
		ctx.lineTo(x-30,y+5);
		ctx.lineTo(x-20,y+15);
		ctx.fill();

		ctx.beginPath();
		_setColor(8);
		_line(x-20,y+50,x+20,y+50);
		_line(x-10,y+12,x-1,y+21);
		_line(x+10,y+12,x-8,y+30);
		_line(x-8,y+30,x-8,y+50);
		_circle(x-4,y+33,1);
		_circle(x-4,y+39,1);
		_circle(x-4,y+45,1);
		ctx.stroke();

		ctx.beginPath();
		ctx.fillStyle = 'blue';
		_arc(x,y+7,0,180,10);
		ctx.lineTo(x-10,y+12);
		ctx.lineTo(x+10,y+12);
		ctx.lineTo(x+10,y+7);
		ctx.fill();
	};
	var _renderBoots = function(x, y) {
		ctx.beginPath();
		ctx.strokeStyle = 'white';
		_line(x-8,y+80,x-8,y+90);
		_line(x+8,y+80,x+8,y+90);
		_line(x-18,y+80,x-18,y+83);
		_line(x+18,y+80,x+18,y+83);
		_line(x-18,y+83,x-22,y+83);
		_line(x+18,y+83,x+22,y+83);
		_line(x-8,y+90,x-29,y+90);
		_line(x+8,y+90,x+29,y+90);
		_arc(x-22,y+90,180,270,7); // 90,180
		_arc(x+22,y+90,270,360,7); // 0,90
		ctx.stroke();
	};
	var _renderHead = function(x, y) {
		// Head
		ctx.fillStyle = 'red';
		ctx.beginPath();
		_circle(x,y-5,10);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(x+10,y-5);
		ctx.lineTo(x+9,y+12);
		ctx.lineTo(x-9,y+12);
		ctx.lineTo(x-10,y-5);
		ctx.lineTo(x+10,y-5);
		ctx.fill();

		// Tentacles
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		_line(x-3,y+1,x-6,y+3);
		_line(x+3,y+1,x+6,y+3);
		_line(x-6,y+3,x-8,y+9);
		_line(x+6,y+3,x+8,y+9);
		_arc(x-6,y+9,0,180,2);
		_arc(x+6,y+9,0,180,2);
		_line(x-4,y+9,x-3,y+5);
		_line(x+4,y+9,x+3,y+5);
		_arc(x-2,y+9,0,180,2);
		_arc(x+2,y+9,0,180,2);
		_line(x,y+9,x,y+6);
		ctx.stroke();

		// Eyes
		ctx.fillStyle = 'white';
		ctx.beginPath();
		_circle(x-5,y-3,3);
		_circle(x+5,y-3,3);
		ctx.fill();
		ctx.fillStyle = 'blue';
		ctx.beginPath();
		_circle(x-5,y-3,1);
		_circle(x+5,y-3,1);
		ctx.fill();
	};
	var _renderZoid = function(x, y) {
		_renderBowl(x,y);
		_renderClaws(x,y);
		_renderBody(x,y);
		_renderBoots(x,y);
		_renderHead(x,y);
	};
	var _renderBomb = function(x, y, size) {
		ctx.fillStyle = pascalColors[8];
		ctx.beginPath();
		_circle(x,y,size);
		ctx.fill();

		ctx.strokeStyle = 'white';
		ctx.beginPath();
		_line(x+5,y-5,x+9,y-9);
		ctx.stroke();

		ctx.fillStyle = 'red';
		ctx.beginPath();
		_circle(x+11,y-11,2);
		ctx.fill();

		ctx.fillStyle = 'yellow';
		ctx.beginPath();
		_circle(x+11,y-11,1);
		ctx.fill();
	};
	var _renderExplosion = function(x, y, f) { // f = [0;1]
		j = Math.floor(f*18);

		ctx.fillStyle = 'red';
		ctx.beginPath();
		_circle(x,y,j);
		ctx.fill();

		ctx.fillStyle = 'yellow';
		ctx.beginPath();
		_circle(x,y,Math.floor(j/2));
		ctx.fill();
	};
	var _renderFinalExplosion = function(x, y, f) { // f = [0;1]
		j = Math.floor(f*600);

		ctx.fillStyle = 'red';
		ctx.beginPath();
		_circle(x,y,j);
		ctx.fill();

		ctx.fillStyle = 'yellow';
		ctx.beginPath();
		_circle(x,y,Math.floor(j/2));
		ctx.fill();
	};
	var _renderGround = function() {
		ctx.fillStyle = pascalColors[6];
		ctx.fillRect(0,groundY,640,480-groundY);
	};
	var _renderUi = function() {
		ctx.strokeStyle = pascalColors[11];
		ctx.beginPath();
		ctx.moveTo(0,25);
		ctx.lineTo(640,25);
		ctx.stroke();

		ctx.fillStyle = pascalColors[7];
		ctx.fillText('Score: '+zoid.score, 450,15);
		ctx.fillStyle = 'green';
		ctx.fillText('Lives: '+zoid.lives, 550,15);
		ctx.fillStyle = 'magenta';
		ctx.fillText('Shtille presents: Zoidberg saving Earth!', 10,15);
	};
	var _renderInitialScene = function() {
		ctx.fillStyle = pascalColors[3];
		ctx.fillText('Shtille presents:', 220,100);
		ctx.fillStyle = 'yellow';
		ctx.fillText('Dr.Zoidberd saving Earth!', 220,130);
		ctx.fillStyle = 'white';
		if (isTouch) {
			ctx.fillText('Touch screen to move', 220,200);
		} else {			
			ctx.fillText('Keys:', 280,200);
			ctx.fillText('A - left, D - right', 230,220);
			ctx.fillText('Also use can use arrow keys and mouse', 230,240);
		}
		ctx.fillStyle = 'green';
		ctx.fillText('Press Enter to start the game!', 220,350);
	};
	var _renderGameScene = function() {
		_renderGround();
		if (bomb.lost) {
			_renderZoid(zoid.x, zoid.y);
			_renderBomb(bomb.x, bomb.y, bomb.size);
		} else {
			_renderBomb(bomb.x, bomb.y, bomb.size);
			_renderZoid(zoid.x, zoid.y);
		}
		if (explosionClip.enabled)
			_renderExplosion(bomb.x, bomb.y, explosionClip.fraction());
		_renderUi();
	};
	var _renderGameOverScene = function() {
		if (finalExplosionClip.enabled) {
			_renderFinalExplosion(bomb.x, bomb.y, finalExplosionClip.fraction());
		} else {
			// Final stats
			ctx.fillStyle = 'red';
			ctx.fillText('Game Over!', 280,200);
			ctx.fillStyle = pascalColors[7];
			ctx.fillText('Your final score: '+zoid.score, 240,230);
			ctx.fillStyle = pascalColors[9];
			ctx.fillText('Rank: '+zoid.rank, 240,270);
			ctx.fillStyle = 'green';
			ctx.fillText('Press Enter to retry', 240,330);
		}
	};
	var _renderScene = function() {
		switch (scene) {
		case Scenes.kInitial:
			_renderInitialScene();
			break;
		case Scenes.kGame:
			_renderGameScene();
			break;
		case Scenes.kGameOver:
			_renderGameOverScene();
			break;
		}
	};
	var _present = function() {
		mainContext.drawImage(backCanvas, 0, 0);
	};
	this.render = function() {
		_prepare();
		_renderScene();
		_present();
	};
	this.onKeyDown = function(event) {
		if (scene == Scenes.kInitial) {
			if (event.code === 'Enter') {
				// Next scene
				scene = Scenes.kGame;
			}
		} else if (scene == Scenes.kGame) {
			if (event.code === 'KeyA' || event.code === 'ArrowLeft') {
				keyStates.stepLeft = true;
			} else if (event.code === 'KeyD' || event.code === 'ArrowRight') {
				keyStates.stepRight = true;
			}
		} else if (scene == Scenes.kGameOver) {
			if (event.code === 'Enter') {
				restart.call(this);
			}
		}
	};
	this.onKeyUp = function(event) {
	};
	var getTouchX = function(e) {
		var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		var touch = evt.touches[0] || evt.changedTouches[0];
		return touch.pageX;
	};
	this.onTouchStart = function(event) {
		event.preventDefault();
		if (event.touches.length != 1) return;
		var x = getTouchX(event);
		switch (scene) {
		case Scenes.kInitial:
			// Next scene
			scene = Scenes.kGame;
			break;
		case Scenes.kGame:
			if (x < 320) {
				keyStates.stepLeft = true;
			} else {
				keyStates.stepRight = true;
			}
			break;
		case Scenes.kGameOver:
			restart.call(this);
			break;
		}
	};
	this.onTouchEnd = function(event) {
	};
	this.onTouchMove = function(event) {
	};
	this.onTouchCancel = function(event) {
	};
	var getMouseX = function(e) {
		return e.clientX;
	};
	this.onMouseDown = function(event) {
		var x = getMouseX(event);
		switch (scene) {
		case Scenes.kInitial:
			break;
		case Scenes.kGame:
			if (x < zoid.x) {
				keyStates.stepLeft = true;
			} else {
				keyStates.stepRight = true;
			}
			break;
		case Scenes.kGameOver:
			break;
		}
	};
	this.onMouseUp = function(event) {
	};
	this.onMouseMove = function(event) {
	};
}