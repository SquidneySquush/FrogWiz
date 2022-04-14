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


window.onload = function init()
{
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

    // Initialize event handlers
    document.getElementById("incSpeed").onclick = function() {
        xVelocity *= 1.5;
        yVelocity *= 1.5;
        //console.log(xVelocity, yVelocity);
    };

    document.getElementById("decSpeed").onclick = function() {
        xVelocity *= 0.5;
        yVelocity *= 0.5;
        //console.log(xVelocity, yVelocity);
    };

    document.getElementById("bLeft").onclick = function () {
        go += ( go > -10 ? -1 : 0);
    };

    document.getElementById("bRight").onclick = function () {
        go += ( go < 10 ? 1 : 0);
    };
    
    document.getElementById("shoot").onclick = function () {
        shoot = true;
        yBase = 0.0;
        numBullets = numBullets - 1;
    };


    render();
};

function setup() {

    p = vec2(0.0, 0.95);
    vertices = [p];
    // set up radius 
    var r = 0.05;
    numOfFans = 36;

    // for loop for circle 
    for(var i = 0; i <= numOfFans; i++ ){
      vertices.push(vec2(
        vertices[0][0] + r*Math.cos(i*2*Math.PI/numOfFans),
        vertices[0][1] + r*Math.sin(i*2*Math.PI/numOfFans)
        ));
    }
    // for rectangle base 
    vertices.push(vec2(-0.05, -0.95));
    vertices.push(vec2(-0.05, -1.0));
    vertices.push(vec2(0.05, -1.0));
    vertices.push(vec2(0.05, -0.95));

    var rad = 0.025;
    //vertices.push(vec2(0.0, -0.95));
    for(var k = 0; k <= numOfFans; k++ ){
        vertices.push(vec2(
          rad*Math.cos(k*2*Math.PI/numOfFans),
          rad*Math.sin(k*2*Math.PI/numOfFans)
          ));
      }


    colors = [vec3(0.4, 0.4, 1.0), // invader color - blue
            vec3(1.0, 0.4, 0.4), // base - red
            vec3(0.2, 0.2, 0.2) //bullet - black
            ];
    xCenter = 0.0;
    yCenter = 0.95; // might need to change to 0.0 if starts in wrong spot

    xVelocity = 0.005;
    yVelocity = -0.005;
}



function animate () {

    // increment xCenter and yCenter
    // write your code here
    xCenter += xVelocity;
    yCenter += yVelocity;

    // check if xCenter/yCenter is out of bounds
    // hit right side 
    if (xCenter+0.05 >= 1.0) { 
      //xCenter = 1.0 - 0.05;
      xVelocity *= -1.0;
    }
    // hit left side
    if (xCenter-0.05 <= -1.0) {
      //xCenter = -1.0 + 0.05;
      xVelocity *= -1.0;
    }
    // hit top
    if (yCenter+0.05 >= 1.0 ) {
      //console.log(yCenter);
      //yCenter = 1.0 - 0.05;
      yVelocity *= -1.0;
    }
    // hit bottom
    if (yCenter-0.05 <= (-1.0)) {
      //console.log(yCenter);
      //yCenter = -1.0 + 0.05;
      yVelocity *= -1.0;
    }

}

function bulletHit (){

    if(yBase >= 1.95 ){
        //console.log(yBase);
        shoot = false;
        if( numBullets <= 0){
            alert("Out of Bullets, You Lose! Game Over.");
         }
    } 
    //console.log(Math.abs(yBase - (yCenter +0.95)));
    //console.log(Math.abs(xBase - xCenter));

    /// Check if bullet hits invader
    if ((Math.abs(yBase - (yCenter + 0.95)) <= 0.075) && (Math.abs(xBase - xCenter) <= 0.075)){
        // console.log(Math.abs(yBase - (yCenter +0.95)));
        // console.log(Math.abs(xBase - xCenter));
        // console.log(yBase);
        // console.log(xBase);
        // console.log(yCenter);
        // console.log(xCenter);
        shoot = false;
        GameOver = true;
        //console.log("Game Over");
        alert("You Win! Game Over.");
     }
     //console.log(yCenter);
    }

function invaderHit(){
    ////Check if invader hits base
    // checks if it goes past the y coord of base
     if (yCenter <= (-0.95)){ 
        // Once invader is past threshold of bases y value
        // Check if invaders x is within the bounds of the x values of the base 
        // (+/- 0.1 to account for invader radius (0.05) and b/c xBase is at center of 
        // base therefore we need to account for full size of base (0.05) 
        // making a total of 0.1 for each side)
         if((xCenter >= (xBase - 0.1)) && (xCenter <= (xBase + 0.1))){
            GameOver = true;
            alert("You Lose! Game Over.");
         }
     }
}

function print(){
    var string = 'Bullets left = '+ numBullets.toString();
    bulletStat.innerHTML = string;
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    //invader
    animate();
    gl.uniform2fv (u_vCenterLoc, vec2(xCenter, yCenter));
    gl.uniform3fv(u_ColorLoc, colors[0]);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, numOfFans + 2 );

    // base
    xBase = (go * 0.1);
    gl.uniform2fv (u_vCenterLoc, vec2(xBase, 0.95));
    gl.uniform3fv(u_ColorLoc, colors[1]);
    gl.drawArrays( gl.TRIANGLE_FAN, 38, 4 );

    if(shoot && (numBullets > 0)){
        yBase += bullVelocity;
        //console.log(shoot);
        //console.log(numBullets);
        gl.uniform2fv (u_vCenterLoc, vec2(xBase, yBase));
        gl.uniform3fv(u_ColorLoc, colors[2]);
        gl.drawArrays( gl.TRIANGLE_FAN, 42, numOfFans + 1 );
        bulletHit(); 
    }
    invaderHit(); 
    
    print();
    if(!GameOver){
        window.requestAnimFrame(render);
    }
    
}


