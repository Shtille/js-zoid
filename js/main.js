var requestID = null;
var app = null;

function main() {
	// Create application instance
	app = new Application({canvasId: 'canvas2d'});
	app.load();

	// Render cycle
	var then = 0;
	function render(now) {
		now *= 0.001;  // convert to seconds
		const seconds = now - then;
		then = now;

		app.update(seconds);
		app.render();

		requestID = requestAnimationFrame(render);
	}
	requestID = requestAnimationFrame(render);
}
function onLoad() {
	main();
}
function onUnload() {
	if (app) {
		cancelAnimationFrame(requestID);
		app.unload();
		app = null;
	}
}

window.onload = onLoad;
window.onbeforeunload = onUnload;