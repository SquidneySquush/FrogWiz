"use strict";

var gl;
var p;
var vertices;
var numOfFans;
var colors;
var u_ColorLoc;

// Move base variables
//var go = 0;
var xFrogMove = 0.0;
var u_xMoveLoc;
var xFrogCenter = 0.0;

var xGood = 0.0;
var yGood = 0.0;
var xBad = 0.0;
var yBad = 0.0;

var Score;
var currentScore; 
// bullet variables
var shoot  = false;
var yBase = 0.0;
var bullVelocity = 0.01;
var numBullets = 100;
var bulletStat;

var Rules;
var StartButton;

// bounce invader
var xVelocity, yVelocity;
var xCenter, yCenter;
var xFrogCenter, yFrogCenter;
var u_vCenterLoc;

var GameOver = false;

window.onload = function init(){
    var canvas = document.getElementById( "gl-canvas" );
    Score = document.getElementById("Score");
    Rules = document.getElementById("Rules");
	StartButton = document.getElementById("Start");


    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    setup();

    currentScore = 0;

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var a_vPositionLoc = gl.getAttribLocation( program, "a_vPosition" );
    gl.vertexAttribPointer( a_vPositionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_vPositionLoc );

    u_ColorLoc = gl.getUniformLocation(program, "u_Color");

    // associate base/bullet center with uniform shader variable
    u_xMoveLoc = gl.getUniformLocation(program, "u_xMove");

    // associate invader center with uniform shader variable
    u_vCenterLoc = gl.getUniformLocation (program, "u_vCenter");

    moveFrog();

    document.getElementById("Start").onclick = function() {
    	render();
    	Rules.innerHTML = "";
    	StartButton.style.visibility = "hidden";
	}

	Start();

}

function setup(){
    /////////////////Frog vertices//////////////////////
    p = vec2(0.0, -0.85);
    vertices = [p];
    // set up radius 
    var r = 0.075;
    numOfFans = 36;

    // for loop for circle 
    for(var i = 0; i <= numOfFans; i++ ){
      vertices.push(vec2(
        vertices[0][0] + r*Math.cos(i*2*Math.PI/numOfFans),
        vertices[0][1] + r*Math.sin(i*2*Math.PI/numOfFans)
        ));
    }
    xFrogCenter = 0.0;
    yFrogCenter = 0.925;
    ///////////////// Good Muffin //////////////////////
    vertices.push(vec2(0.0, 1.0));
    vertices.push(vec2(0.0, 0.9));
    vertices.push(vec2(0.1, 0.9));
    vertices.push(vec2(0.1, 1.0));
    ///////////////// Bad Muffin //////////////////////
    vertices.push(vec2(0.0, 1.0));
    vertices.push(vec2(0.0, 0.9));
    vertices.push(vec2(-0.1, 0.9));
    vertices.push(vec2(-0.1, 1.0));
    ///////////////// Grass //////////////////////
    vertices.push(vec2(-1.0, -0.925));
    vertices.push(vec2(-1.0, -1.0));
    vertices.push(vec2(1.0, -1.0));
    vertices.push(vec2(1.0, -0.925));

    colors = [vec3(0.4, 0.4, 1.0), // invader color - blue
            vec3(1.0, 0.4, 0.4), // base - red
            vec3(0.2, 0.2, 0.2) //bullet - black
            ];
}

function animate(){

}

function moveFrog(){
    document.addEventListener('keydown', function(event) {
    // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
    switch (event.key) {
        case "ArrowLeft":
            // Left pressed - move frog left
            xFrogMove += ( xFrogMove > -10 ? -1 : 0);
            break;
        case "ArrowRight":
            // Right pressed - move frog right
            xFrogMove += ( xFrogMove < 10 ? 1 : 0);
            break;
        case "ArrowUp":
            // Up pressed
            break;
        case "ArrowDown":
            // Down pressed
            break;
    }
    });
}

function goodMuffin(){

}

function badMuffin(){

}

function ShowRules() {
	var rString = "1.To move frog left and right, use left and right arrow keys<br/>2.To eat a muffin, position frog such that falling muffin hits frog<br/>3.If frog eats burnt muffin, a life is lost.<br/>4.If frog eats good muffin, points are gained.<br/>5.Get as many points possible until all lives are lost.<br/>Press 'Start' to play!<br/>";
	Rules.innerHTML = rString;
}

function Start() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	ShowRules();
}


function drawScore(){
    var string = currentScore.toString();
    Score.innerHTML = string;
}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    // Frog //
    xFrogCenter = (xFrogMove * 0.1);
    gl.uniform2fv (u_vCenterLoc, vec2(xFrogCenter, yFrogCenter));
    gl.uniform3fv(u_ColorLoc, colors[0]);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, numOfFans + 2 );

    // Good Muffin //
    yGood = 0.925;
    gl.uniform2fv (u_vCenterLoc, vec2(xGood, yGood));
    gl.uniform3fv(u_ColorLoc, colors[1]);
    gl.drawArrays( gl.TRIANGLE_FAN, 38, 4 );

    // Bad Muffin //
    yBad = 0.925;
    gl.uniform2fv (u_vCenterLoc, vec2(xBad, yBad));
    gl.uniform3fv(u_ColorLoc, colors[1]);
    gl.drawArrays( gl.TRIANGLE_FAN, 42, 4 );

    // Grass //
    gl.uniform2fv (u_vCenterLoc, vec2(0.0, 0.925));
    gl.uniform3fv(u_ColorLoc, colors[1]);
    gl.drawArrays( gl.TRIANGLE_FAN, 46, 4 );

    drawScore();

    window.requestAnimFrame(render);
}