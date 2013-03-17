/*! html | Triforce Canvas | 030313 */


$(function() {
	var canvas = $("#lienzo");
	var canvasHeight;
	var canvasWidth;
	var ctx;
	var dt = 0.1;
	var puntoss = new Array();
	//var c__ = ['#ed9d33','#d44d61','#4f7af2','#ef9a1e','#269230','#36b641']; // colores para los puntos
	var c__ = ['#ed9d33']; 					// dejamos el color amarillo de la trifuerza original
	
	var pointCollection;
	
	function init() {
		updateCanvasDimensions();
		
		initEventListeners();
		timeout();
	};

	function initEventListeners() {
		$(window).bind('resize', updateCanvasDimensions).bind('mousemove', onMove);
		
		canvas.get(0).ontouchmove = function(e) {
			e.preventDefault();
			onTouchMove(e);
		};
		
		canvas.get(0).ontouchstart = function(e) {
			e.preventDefault();
		};
	};
	
	function updateCanvasDimensions() {
		// actualizamos las dimenciones y pintamos.
		canvas.attr({height: $(window).height(), width: $(window).width()});
		canvasWidth = canvas.width();
		canvasHeight = canvas.height();
		
		pointCollection = new PointCollection();
		pointCollection.points = get_puntos_ss();

		draw();
	};
	
	function onMove(e) {
		if (pointCollection)
			pointCollection.mousePos.set(e.pageX, e.pageY);
	};
	
	function onTouchMove(e) {
		if (pointCollection)
			pointCollection.mousePos.set(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
	};
	
	function timeout() {
		draw();
		update();
		
		setTimeout(function() { timeout() }, 30);
	};
	
	function draw() {
		var tmpCanvas = canvas.get(0);

		if (tmpCanvas.getContext == null) {
			return; 
		};
		
		ctx = tmpCanvas.getContext('2d');
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		if (pointCollection)
			pointCollection.draw();
	};
	
	function update() {		
		if (pointCollection)
			pointCollection.update();
	};
	
	function Vector(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
 
		this.addX = function(x) {
			this.x += x;
		};
		
		this.addY = function(y) {
			this.y += y;
		};
		
		this.addZ = function(z) {
			this.z += z;
		};
		this.set = function(x, y, z) {
			this.x = x; 
			this.y = y;
			this.z = z;
		};
		this.tostring = function(){
			return this.x.toString()+', '+this.y.toString()+', '+this.z.toString();
		};
	};
	
	function PointCollection() {
		this.mousePos = new Vector(0, 0);
		this.points = new Array();
		
		this.newPoint = function(x, y, z) {
			var point = new Point(x, y, z);
			this.points.push(point);
			return point;
		};
		
		this.update = function() {		
			var pointsLength = this.points.length;
			
			for (var i = 0; i < pointsLength; i++) {
				var point = this.points[i];
				
				if (point == null)
					continue;
				
				var dx = this.mousePos.x - point.curPos.x;
				var dy = this.mousePos.y - point.curPos.y;
				var dd = (dx * dx) + (dy * dy);
				var d = Math.sqrt(dd);
				
				if (d < 150) {
					point.targetPos.x = (this.mousePos.x < point.curPos.x) ? point.curPos.x - dx : point.curPos.x - dx;
					point.targetPos.y = (this.mousePos.y < point.curPos.y) ? point.curPos.y - dy : point.curPos.y - dy;
				} else {
					point.targetPos.x = point.originalPos.x;
					point.targetPos.y = point.originalPos.y;
				};
				
				point.update();
			};
		};
		
		this.draw = function() {
			var pointsLength = this.points.length;
			for (var i = 0; i < pointsLength; i++) {
				var point = this.points[i];
				
				if (point == null)
					continue;

				point.draw();
			};
		};
	};
	
	function Point(x, y, z, size, colour) {
		this.colour = colour;
		this.curPos = new Vector(x, y, z);
		this.friction = 0.8;
		this.originalPos = new Vector(x, y, z);
		this.radius = size;
		this.size = size;
		this.springStrength = 0.1;
		this.targetPos = new Vector(x, y, z);
		this.velocity = new Vector(0.0, 0.0, 0.0);
		
		this.update = function() {
			var dx = this.targetPos.x - this.curPos.x;
			var ax = dx * this.springStrength;
			this.velocity.x += ax;
			this.velocity.x *= this.friction;
			this.curPos.x += this.velocity.x;
			
			var dy = this.targetPos.y - this.curPos.y;
			var ay = dy * this.springStrength;
			this.velocity.y += ay;
			this.velocity.y *= this.friction;
			this.curPos.y += this.velocity.y;
			
			var dox = this.originalPos.x - this.curPos.x;
			var doy = this.originalPos.y - this.curPos.y;
			var dd = (dox * dox) + (doy * doy);
			var d = Math.sqrt(dd);
			
			this.targetPos.z = d/100 + 1;
			var dz = this.targetPos.z - this.curPos.z;
			var az = dz * this.springStrength;
			this.velocity.z += az;
			this.velocity.z *= this.friction;
			this.curPos.z += this.velocity.z;
			
			this.radius = this.size*this.curPos.z;
			if (this.radius < 1) this.radius = 1;
		};
		
		this.draw = function() {
			ctx.fillStyle = this.colour;
			ctx.beginPath();
			ctx.arc(this.curPos.x, this.curPos.y, this.radius, 0, Math.PI*2, true);
			ctx.fill();
		};
	};
	
	// add ss
	function randomxtoy(minVal,maxVal,floatVal){
		// ! obtiene un numero random entre x e y
		var randVal = minVal+(Math.random()*(maxVal-minVal));
		return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
	};
	
	function get_puntos_ss(){
		// calculamos los puntos
		var puntos = new Array();
		var width = canvasWidth;
		var height = canvasHeight;
		var margenid = width * .40;
		var margenaa = height * .20;
		var ancho = width - margenid;					// dejaremos un margen de izquiera 20% y derecha de 20 %
		var alto = height - margenaa;						// dejamos un margen de arriba 10% y abajo 10%
		var auxw = margenid/2;
		var auxh = (margenaa/2);
		// el triangulo mas grande.
		var p1 = new Vector(auxw,auxh,0.0);
		//alert('w: '+width.toString()+' | h: '+height.toString()+'\naw: '+ancho.toString()+' | ah: '+alto.toString()+'\nid: '+auxw.toString()+' | aa: '+auxh);
		var tp = triangulo(p1,ancho,alto);
		for(var i = 0; i < tp.length; i++){
			puntos.push(tp[i]);
		}
		tp.length = 0;
		// calculamos el triangulo de adentro
		var nancho = ancho / 2;
		var nalto = alto /2;
		auxw = ancho - nancho;
		auxw = auxw / 2;
		var p = new Vector(auxw+p1.x,p1.y,0.0);
		var tpp = triangulo(p,nancho,nalto,true);
		for(var i = 0; i < tpp.length; i++){
			puntos.push(tpp[i]);
		}
		tpp.length = 0;
		return puntos;
	};
	
	function triangulo(p1,ancho,alto,isreversible){
		// genera los puntos de un triangulo
		isreversible = (isreversible == '' || isreversible == null || isreversible == undefined) ?  false : true;
		var puntos = new Array();
		var incremento = 15;
		var auxxm = (ancho/2) + p1.x;
		var p2 = new Vector(auxxm,p1.y+alto,0.0);
		if(isreversible){
			p1.y = p1.y + alto;
			p2.y = p2.y - alto;
		}
		var auxy = p2.y - p1.y;
		var auxx = p2.x - p1.x;
		var m = auxy/auxx;
		for(var x= p1.x; x <= (p1.x+ancho); x += incremento + incremento){
			// base
			var y = p1.y;
			var v = puntobien(new Vector(x,y,0.0));
			var s = randomxtoy(6,9);
			var c = randomxtoy(0,c__.length - 1);
			var p = new Point(v.x,v.y,v.z,s,c__[c]);
			puntos.push(p);
		}
		for(var x = p1.x; x <= p2.x; x += incremento){
			// izquierda
			var y = (m * (x - p1.x)) + p1.y;
			var v = puntobien(new Vector(x,y,0.0));
			var s = randomxtoy(6,9);
			var c = randomxtoy(0,c__.length - 1);
			var p = new Point(v.x,v.y,v.z,s,c__[c]);
			puntos.push(p);
		}
		var p3 = new Vector(p1.x+ancho,p1.y,0.0);
		auxy = p3.y - p2.y;
		auxx = p3.x - p2.x;
		m = auxy/auxx;
		for(var x = p2.x; x <= p3.x; x += incremento){
			// derecha
			var y = (m * (x - p2.x)) + p2.y;
			var v = puntobien(new Vector(x,y,0.0));
			var s = randomxtoy(6,9);
			var c = randomxtoy(0,c__.length - 1);
			var p = new Point(v.x,v.y,v.z,s,c__[c]);
			puntos.push(p);
		}
		return puntos;
	};
	
	function puntobien(valor){
		// voltemos el valor de y para que se vea e el 3er cuadrante
		var v = new Vector(valor.x,canvasHeight-valor.y,0.0);
		return v;
	};
	
	init();
});
