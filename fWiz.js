"use strict";

var gl;
var p;
var vertices;
var numOfFans = 36;
var colors;
var u_ColorLoc;
var program;


// Move base variables
//var go = 0;
var xFrogMove = 0.0;
var u_xMoveLoc;

var xGood = 0.06;
var yGood = 0.94;
var xBad = -0.06;
var yBad = 0.94;
var xGVel, yGVel, xBVel, yBVel;

var Score;
var currentScore;

var Rules;
var StartButton;

var currentLives;
var lives;

// bounce invader
var xVelocity, yVelocity;
var xCenter, yCenter;
var xFrogCenter, yFrogCenter;
var xFrogVel, yFrogVel = 0.0;
var u_vCenterLoc;
var a_vPositionLoc;
var vBuffer;

var projectionMatrix, u_projectionMatrixLoc;

var a_TextureCoordLoc;
var u_TextureSamplerLoc;
var textureCoordData = [0, 1, 0, 0, 1, 0, 1, 1];//[-0.075,-0.775, -0.075, -0.925, 0.075, -0.925, 0.075, -0.775];
//[0, 1, 0, 0, 1, 0, 1, 1]; // [vec2(0, 1), vec2(0, 0), vec2(1, 0), vec2(1, 1)];
var textures = [];
//var BadMuffinTexture;
var TextureCoordBuffer;
//var BadMuffinVertexTextureCoordBuffer;
var ctMatrixLoc;
var ctMatrix;


var GameOver = false;
var inAir = false;
var arrowUp = false;
var jumpDown = false;

// var textCtx = document.createElement("canvas").getContext("2d");

// // Puts text in center of canvas.
// function makeTextCanvas(texture, width, height) {
//   textCtx.canvas.width  = width;
//   textCtx.canvas.height = height;
//   textCtx.textAlign = "center";
//   textCtx.textBaseline = "middle";
//   textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
//   textCtx.fillText(texture, width, height);
//   return textCtx.canvas;
// }

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    Score = document.getElementById("Score");
    Rules = document.getElementById("Rules");
    StartButton = document.getElementById("Start");
    lives = document.getElementById("lives");


    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    setup();

    currentScore = 0;
    currentLives = 3;

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    a_vPositionLoc = gl.getAttribLocation(program, "a_vPosition");

    // texture coord buffer
    TextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, TextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);

    // associate centers with uniform shader variable
    // u_vCenterLoc = gl.getUniformLocation(program, "u_vCenter");

    a_TextureCoordLoc = gl.getAttribLocation(program, "a_TexCoord");

    u_TextureSamplerLoc = gl.getUniformLocation(program, "u_TextureSampler");
    
    gl.enableVertexAttribArray(a_TextureCoordLoc);
    gl.vertexAttribPointer(a_TextureCoordLoc, 2, gl.FLOAT, false, 0, 0);

    
    u_projectionMatrixLoc = gl.getUniformLocation( program, "u_projectionMatrix" );
    projectionMatrix =  ortho(-1, 1, -1, 1, -1, 1);  //perspective(fovy, aspect, near, far);

    // gl.uniformMatrix4fv( u_modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( u_projectionMatrixLoc, false, flatten(projectionMatrix) );

    ctMatrixLoc = gl.getUniformLocation(program, "ctMatrix");
    u_ColorLoc = gl.getUniformLocation(program, "u_Color");

    initTexture("./Frog.png");
    initTexture("./goodMuffin.png");
    initTexture("./badMuffin.png");
    initTexture("./grass.png");
    moveFrog();

    document.getElementById("Start").onclick = function() {
        render();
        Rules.innerHTML = "";
        StartButton.style.visibility = "hidden";
    }

    Start();

}



function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    animate();
    drawFrog();
    drawGoodMuffin();
    drawBadMuffin();
    drawGrass();

    goodMuffinCheck();
    badMuffinCheck();

    drawScore();
    drawLives();

    if (currentLives >= 0) {
        window.requestAnimFrame(render);
    } else {
        alert("Game Over!");
    }
}



function setup() {
    /////////////////Frog vertices//////////////////////
    vertices = [vec2(-0.075, 0.075),
                vec2(-0.075, -0.075),
                vec2(0.075, -0.075),
                vec2(0.075, 0.075)];
    
    xFrogCenter = 0.0;
    yFrogCenter = -0.8;

     ///////////////// Good Muffin //////////////////////
    
    // vertices.push(vec2(0.0, 0.0));
    // // textureCoordData.push(vec2(0.06, 0.94));
    // // set up radius 
    // var rgood = 0.06;

    // // for loop for circle 
    // for (var j = 0; j <= numOfFans; j++) {
    //     vertices.push(vec2(
    //         vertices[4][0] + rgood * Math.cos(j * Math.PI / numOfFans),
    //         vertices[4][1] + rgood * Math.sin(j * Math.PI / numOfFans)
    //     ));
    // }
    // vertices.push(vec2(-0.06, 0.0));
    // // textureCoordData.push(vec2(0.0, 0.94));
    // vertices.push(vec2(-0.035, -0.94));
    // // textureCoordData.push(vec2(0.035, 0.88));
    // vertices.push(vec2(0.035, -0.94));
    // // textureCoordData.push(vec2(0.085, 0.88));
    // vertices.push(vec2(0.06, 0.0));
    // // textureCoordData.push(vec2(0.12, 0.94));

    // ///////////////// Grass //////////////////////
    // vertices.push(vec2(-1.0, -0.925));
    // vertices.push(vec2(-1.0, -1.0));
    // vertices.push(vec2(1.0, -1.0));
    // vertices.push(vec2(1.0, -0.925));

    colors = [vec4(1.0, 1.0, 1.0, 1.0) // invader color - blue
    ];
    xGVel = 0.000;
    yGVel = -0.005;
    xBVel = 0.000;
    yBVel = -0.0075;
}

function goodMuffinCheck() {
    if (yGood <= (-0.775)) {
        if ((xGood >= (xFrogCenter - 0.1)) && (xGood <= (xFrogCenter + 0.1))) {
            currentScore += 100;
            yGood = 0.925;
            // TODO: 
            xGood = Math.random() - Math.random();
        }
    }
    if (yGood <= (-1.0)) {
        yGood = 0.925;
        // TODO: 
        xGood = Math.random() - Math.random();
    }
}

function badMuffinCheck() {
    if (yBad <= (-0.775)) {
        if ((xBad >= (xFrogCenter - 0.1)) && (xBad <= (xFrogCenter + 0.1))) {
            currentLives -= 1;
            yBad = 0.925;
            // TODO: 
            xBad = Math.random() - Math.random();
        }
    }
    if (yBad <= (-1.0)) {
        yBad = 0.925;
        // TODO: 
        xBad = Math.random() - Math.random();
    }
}

function drawFrog(){
    xFrogCenter = (xFrogMove * 0.05);
    frogJump(arrowUp);

    handleLoadedTexture(textures[0]);

    // makeTextCanvas(textures[0], 100, 100);
    // gl.enableVertexAttribArray(a_TextureCoordLoc);
    // gl.vertexAttribPointer(a_TextureCoordLoc, 2, gl.FLOAT, false, 0, 0);
    // gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);
    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniform4fv(u_ColorLoc, colors[0]);

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    ctMatrix = mat4();
    // translate frog to moved position
    ctMatrix = mult(scalem(1.25,1.25,1.25), ctMatrix);
    ctMatrix = mult(translate(xFrogCenter,yFrogCenter, 0.0), ctMatrix);
    gl.uniformMatrix4fv( ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawGoodMuffin(){
    


    gl.uniform4fv(u_ColorLoc, colors[0]);

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    handleLoadedTexture(textures[1]); 
    ctMatrix = mat4();
    // translate muffin to moved position
    
    ctMatrix = mult(translate(xGood,yGood, 0.0), ctMatrix);
    gl.uniformMatrix4fv( ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawBadMuffin(){
    gl.uniform4fv(u_ColorLoc, colors[0]);

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    handleLoadedTexture(textures[2]); 
    ctMatrix = mat4();
    // translate muffin to moved position
    
    ctMatrix = mult(translate(xBad,yBad, 0.0), ctMatrix);
    gl.uniformMatrix4fv( ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawGrass(){
    // Grass //
    gl.uniform4fv(u_ColorLoc, colors[0]);

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    handleLoadedTexture(textures[3]); 
    ctMatrix = mat4();
    // translate muffin to moved position
    ctMatrix = mult(scalem(15.0, 1.0, 2.0), ctMatrix);
    ctMatrix = mult(translate(0.0, -0.95, 0.0), ctMatrix);
    gl.uniformMatrix4fv( ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function handleLoadedTexture(texture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_TextureSamplerLoc, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    //gl.bindTexture(gl.TEXTURE_2D, texture);
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    // prevent s wrap
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // Prevents t-coordinate wrapping (repeating).
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.generateMipmap(gl.TEXTURE_2D);
}

function initTexture(textID) {
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.src = textID;
    textures.push(texture);

}

function animate() {
    xGood += xGVel;
    yGood += yGVel;

    xBad += xBVel;
    yBad += yBVel;
}

function moveFrog() {
    document.addEventListener('keydown', function(event) {
        // "ArrowRight", "ArrowLeft", "ArrowUp", or "ArrowDown"
        switch (event.key) {
            case "ArrowLeft":
                // Left pressed - move frog left
                xFrogMove += (xFrogMove > -20 ? -1 : 0);
                break;
            case "ArrowRight":
                // Right pressed - move frog right
                xFrogMove += (xFrogMove < 20 ? 1 : 0);
                break;
            case "ArrowUp":
                // Up pressed - make frog jump
                if (inAir == false){
                    arrowUp = true;
                }

                break;
            case "ArrowDown":
                // Down pressed
                break;
        }
    });
}

function frogJump(upPress){
    if(upPress ==true  && inAir == false){
        yFrogVel += 0.01;
        inAir == true; 
        
    }
    // xFrogCenter += xFrogVel;
    // yFrogCenter += yFrogVel;
    // yFrogVel *= 0.9;
    // console.log(yFrogVel);


    if(yFrogCenter >= (-0.3)){
        jumpDown = true;
        
        console.log(yFrogCenter);
    }
    if(jumpDown == false){
        yFrogCenter += yFrogVel;
        yFrogVel *= 0.8;
    }
    else{
        yFrogCenter -= yFrogVel;
        console.log("down");
        yFrogVel *= 0.8;

    }
    if (yFrogCenter <= -0.8 ){
        console.log("back in place");
        console.log(yFrogCenter);
        yFrogVel = 0.0;
        yFrogCenter = -0.8;
        inAir = false;
        jumpDown = false;
        arrowUp = false;
        // console.log(yFrogCenter);
    }

    // arrowUp = false;
}

function ShowRules() {
    var rString = "1.To move frog left and right, use left and right arrow keys<br/>2.To eat a muffin, position frog such that falling muffin hits frog<br/>3.If frog eats burnt muffin, a life is lost.<br/>4.If frog eats good muffin, points are gained.<br/>5.Get as many points possible until all lives are lost.<br/>Press 'Start' to play!<br/>";
    Rules.innerHTML = rString;
}

function Start() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    ShowRules();
}


function drawScore() {
    var string = "Score "+ currentScore.toString();
    Score.innerHTML = string;
}

function drawLives() {
    var string = "Lives "+ currentLives.toString();
    lives.innerHTML = string;
}
