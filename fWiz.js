"use strict";

var gl;
var p;
var vertices;
var numOfFans;
var colors;
var u_ColorLoc;

// Move base variables
var go = 0;
var xMove = 0.0;
var u_xMoveLoc;
var xBase = 0.0;

// bullet variables
var shoot  = false;
var yBase = 0.0;
var bullVelocity = 0.01;
var numBullets = 100;
var bulletStat;

// bounce invader
var xVelocity, yVelocity;
var xCenter, yCenter;
var u_vCenterLoc;

var GameOver = false;

window.onload = function init(){
    var canvas = document.getElementById( "gl-canvas" );
    bulletStat = document.getElementById("bulletStat");

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    setup();

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

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

    render();
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
    xCenter = 0.0;
    yCenter = -0.85;
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

function goodMuffin(){

}

function badMuffin(){

}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT );
    // Frog //
    gl.uniform2fv (u_vCenterLoc, vec2(xCenter, yCenter));
    gl.uniform3fv(u_ColorLoc, colors[0]);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, numOfFans + 2 );

    // Good Muffin //
    //xBase = (go * 0.1); /// for moving object
    ///gl.uniform2fv (u_vCenterLoc, vec2(xBase, 0.95));
    gl.uniform3fv(u_ColorLoc, colors[1]);
    gl.drawArrays( gl.TRIANGLE_FAN, 38, 4 );

    // Bad Muffin //
    gl.uniform3fv(u_ColorLoc, colors[1]);
    gl.drawArrays( gl.TRIANGLE_FAN, 42, 4 );

    // Grass //
    gl.uniform3fv(u_ColorLoc, colors[1]);
    gl.drawArrays( gl.TRIANGLE_FAN, 46, 4 );
}