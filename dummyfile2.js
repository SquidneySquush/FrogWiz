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
var xFrogCenter = 0.0;

var xGood = 0.0;
var yGood = 0.0;
var xBad = 0.0;
var yBad = 0.0;
var xGVel, yGVel, xBVel, yBVel;

var Score;
var currentScore;
// bullet variables
var shoot = false;
var yBase = 0.0;
var bullVelocity = 0.01;
var numBullets = 100;
var bulletStat;

var Rules;
var StartButton;

var currentLives;
var lives;

// bounce invader
var xVelocity, yVelocity;
var xCenter, yCenter;
var xFrogCenter, yFrogCenter;
var u_vCenterLoc;
var a_vPositionLoc;
var vBuffer;

var a_TextureCoordLoc;
var u_TextureSamplerLoc;
var textureCoordData = [0, 1, 0, 0, 1, 0, 1, 1];
var textures = [];
//var BadMuffinTexture;
var TextureCoordBuffer;
//var BadMuffinVertexTextureCoordBuffer;
var ctmLoc;
var ctm;


var GameOver = false;


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
    //gl.generateMipmap(gl.TEXTURE_2D);
}

function initTexture(textID) {
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.src = textID;
    textures.push(texture);

}

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
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    a_TextureCoordLoc = gl.getAttribLocation(program, "a_textCoord");

    u_TextureSamplerLoc = gl.getUniformLocation(program, "u_TextureSampler");

    // Associate out shader variables with our data buffer
    a_vPositionLoc = gl.getAttribLocation(program, "a_vPosition");
    //gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);
    //gl.enableVertexAttribArray(a_vPositionLoc);

    // texture coord buffer Goodmuffin
    TextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, TextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    /////// ***************************************
    gl.enableVertexAttribArray(a_TextureCoordLoc);
    gl.vertexAttribPointer(a_TextureCoordLoc, 2, gl.FLOAT, false, 0, 0);
    // texture coord buffer BadMuffin
    //BadMuffinVertexTextureCoordBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, BadMuffinVertexTextureCoordBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    //texture coords
    //a_TextureCoordLoc = gl.getAttribLocation(program, "a_TextureCoord");
    //gl.enableVertexAttribArray(a_TextureCoordLoc);

    //gl.activeTexture(gl.TEXTURE0);
    //u_TextureSamplerLoc = gl.getUniformLocation(program, "u_TextureSampler");
    //gl.uniform1i(u_TextureSamplerLoc, 0);

    u_ColorLoc = gl.getUniformLocation(program, "u_Color");
    ctmLoc = gl.getUniformLocation(program, "ctMatrix");
    var pmLoc = gl.getUniformLocation(program, "projMatrix");
    var pm = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
    gl.uniformMatrix4fv(pmLoc, false, flatten(pm));

    // associate base/bullet center with uniform shader variable
    // u_xMoveLoc = gl.getUniformLocation(program, "u_xMove");

    // associate invader center with uniform shader variable
    u_vCenterLoc = gl.getUniformLocation(program, "u_vCenter");

    initTexture("./muffinGood.jpg");
    initTexture("./muffinBad.jpg");
    moveFrog();

    document.getElementById("Start").onclick = function() {
        render();
        Rules.innerHTML = "";
        StartButton.style.visibility = "hidden";
    }

    Start();

}

function setup() {
    /////////////////Frog vertices//////////////////////
    p = vec2(0.0, -0.85);
    vertices = [p];
    // set up radius 
    var r = 0.075;
    numOfFans = 36;

    // for loop for circle 
    for (var i = 0; i <= numOfFans; i++) {
        vertices.push(vec2(
            vertices[0][0] + r * Math.cos(i * 2 * Math.PI / numOfFans),
            vertices[0][1] + r * Math.sin(i * 2 * Math.PI / numOfFans)
        ));
    }
    xFrogCenter = 0.0;
    yFrogCenter = 0.925;
    ///////////////// Good Muffin //////////////////////
    //vertices.push(vec2(0.06, 0.94));
    vertices.push(vec2(0.06, 0.94));
    // textureCoordData.push(vec2(0.06, 0.94));
    // set up radius 
    var rgood = 0.06;
    //var numOfFansg = 36;

    // for loop for circle 
    for (var j = 0; j <= numOfFans; j++) {
        vertices.push(vec2(
            vertices[38][0] + rgood * Math.cos(j * Math.PI / numOfFans),
            vertices[38][1] + rgood * Math.sin(j * Math.PI / numOfFans)
        ));
        // textureCoordData.push(vec2(
        //     vertices[38][0] + rgood * Math.cos(j * Math.PI / numOfFans),
        //     vertices[38][1] + rgood * Math.sin(j * Math.PI / numOfFans)
        // ));

    }
    vertices.push(vec2(0.0, 0.94));
    // textureCoordData.push(vec2(0.0, 0.94));
    vertices.push(vec2(0.035, 0.88));
    // textureCoordData.push(vec2(0.035, 0.88));
    vertices.push(vec2(0.085, 0.88));
    // textureCoordData.push(vec2(0.085, 0.88));
    vertices.push(vec2(0.12, 0.94));
    // textureCoordData.push(vec2(0.12, 0.94));
    ///////////////// Bad Muffin //////////////////////
    vertices.push(vec2(-0.06, 0.94));
    // set up radius 
    var rgood = 0.06;
    //var numOfFansg = 36;

    // for loop for circle 
    for (var j = 0; j <= numOfFans; j++) {
        vertices.push(vec2(
            vertices[80][0] + rgood * Math.cos(j * Math.PI / numOfFans),
            vertices[80][1] + rgood * Math.sin(j * Math.PI / numOfFans)
        ));
    }
    vertices.push(vec2(0.0, 0.94));
    vertices.push(vec2(-0.035, 0.88));
    vertices.push(vec2(-0.085, 0.88));
    vertices.push(vec2(-0.12, 0.94));
    ///////////////// Grass //////////////////////
    vertices.push(vec2(-1.0, -0.925));
    vertices.push(vec2(-1.0, -1.0));
    vertices.push(vec2(1.0, -1.0));
    vertices.push(vec2(1.0, -0.925));
    ///////////////Muffin top trial//////////////
    //var g = vec2(0.05, 0.8);
    //vertices.push(vec2(0.05, 0.8));
    // set up radius 
    //var rgood = 0.075;
    //var numOfFansg = 36;

    // for loop for circle 
    //for (var j = 0; j <= numOfFans; j++) {
    //   vertices.push(vec2(
    //       vertices[50][0] + rgood * Math.cos(j * Math.PI / numOfFans),
    //       vertices[50][1] + rgood * Math.sin(j * Math.PI / numOfFans)
    //   ));
    //}

    colors = [vec3(0.4, 0.4, 1.0), // invader color - blue
        vec3(1.0, 0.4, 0.4), // base - red
        vec3(0.2, 0.2, 0.2) //bullet - black
    ];

    yGood = 0.925;
    yBad = 0.925;

    xGVel = 0.000;
    yGVel = -0.005;
    xBVel = 0.000;
    yBVel = -0.0075;
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
                xFrogMove += (xFrogMove > -10 ? -1 : 0);
                break;
            case "ArrowRight":
                // Right pressed - move frog right
                xFrogMove += (xFrogMove < 10 ? 1 : 0);
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

function goodMuffin() {
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

function badMuffin() {
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

function ShowRules() {
    var rString = "1.To move frog left and right, use left and right arrow keys<br/>2.To eat a muffin, position frog such that falling muffin hits frog<br/>3.If frog eats burnt muffin, a life is lost.<br/>4.If frog eats good muffin, points are gained.<br/>5.Get as many points possible until all lives are lost.<br/>Press 'Start' to play!<br/>";
    Rules.innerHTML = rString;
}

function Start() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    ShowRules();
}


function drawScore() {
    var string = currentScore.toString();
    Score.innerHTML = string;
}

function drawLives() {
    var string = currentLives.toString();
    lives.innerHTML = string;
}

function drawFrog() {
    var tm, sm, rm, scaling_l;
    //draw frog
    handleLoadedTexture(textures[0]);
    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    scaling_l = 0.05;
    rm = rotateZ(0);
    sm = scalem(scaling_l, scaling_l, scaling_l);
    tm = translate(xFrogCenter, yFrogCenter, 0.0); //might need to change

    ctm = mat4();
    ctm = mult(rm, ctm);
    ctm = mult(sm, ctm);
    ctm = mult(tm, ctm);
    gl.uniform3fv(u_ColorLoc, colors[0]);
    gl.uniformMatrix4fv(ctmLoc, false, flatten(ctm));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numOfFans + 2);
}

function drawGmuffin() {
    var tm, sm, rm, scale_x, scale_y, scale_z;
    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);
    handleLoadedTexture(textures[0]);

    scale_x = 0.15;
    scale_y = 0.075;
    scale_z = 0.1;
    sm = scalem(scale_x, scale_y, scale_z);
    tm = translate(xGood, yGood, 0.0);
    ctm = mat4();
    ctm = mult(sm, ctm);
    ctm = mult(tm, ctm);
    gl.uniform3fv(u_ColorLoc, colors[1]);
    gl.uniformMatrix4fv(ctmLoc, false, flatten(ctm));
    gl.drawArrays(gl.TRIANGLE_FAN, 38, 42);

}

function drawBmuffin() {
    var tm, sm, rm, scale_x, scale_y, scale_z;
    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);
    handleLoadedTexture(textures[1]);

    scale_x = 0.15;
    scale_y = 0.075;
    scale_z = 0.1;
    sm = scalem(scale_x, scale_y, scale_z);
    tm = translate(xBad, yBad, 0.0);
    ctm = mat4();
    ctm = mult(sm, ctm);
    ctm = mult(tm, ctm);
    gl.uniform3fv(u_ColorLoc, colors[2]);
    gl.uniformMatrix4fv(ctmLoc, false, flatten(ctm));
    gl.drawArrays(gl.TRIANGLE_FAN, 80, 42);

}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clearColor(0.5, 0.6, 1.0, 1.0);

    animate();
    // Frog //
    xFrogCenter = (xFrogMove * 0.1);
    drawFrog();
    //gl.uniform2fv(u_vCenterLoc, vec2(xFrogCenter, yFrogCenter));
    //gl.uniform3fv(u_ColorLoc, colors[0]);
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, numOfFans + 2);

    // Good Muffin //
    drawGmuffin();
    //gl.bindTexture(gl.TEXTURE_2D, GoodMuffinTexture);
    //a_TextureCoordLoc = gl.getAttribLocation(program, "a_TextureCoord");
    //gl.enableVertexAttribArray(a_TextureCoordLoc);
    //gl.activeTexture(gl.TEXTURE0);

    //gl.bindBuffer(gl.ARRAY_BUFFER, GoodMuffinVertexTextureCoordBuffer);
    //gl.vertexAttribPointer(a_TextureCoordLoc, 2, gl.FLOAT, false, 0, 0);
    //u_TextureSamplerLoc = gl.getUniformLocation(program, "u_TextureSampler");
    //gl.uniform1i(u_TextureSamplerLoc, 0);

    //gl.uniform2fv(u_vCenterLoc, vec2(xGood, yGood));
    //gl.uniform3fv(u_ColorLoc, colors[1]);
    //gl.drawArrays(gl.TRIANGLE_FAN, 38, 42);

    // Bad Muffin //
    drawBmuffin();
    //gl.bindBuffer(gl.ARRAY_BUFFER, BadMuffinVertexTextureCoordBuffer);
    //gl.vertexAttribPointer(a_TextureCoordLoc, 2, gl.FLOAT, false, 0, 0);
    //gl.uniform2fv(u_vCenterLoc, vec2(xBad, yBad));
    //gl.uniform3fv(u_ColorLoc, colors[2]);
    //gl.drawArrays(gl.TRIANGLE_FAN, 80, 42);

    // Grass //
    gl.uniform2fv(u_vCenterLoc, vec2(0.0, 0.925));
    gl.uniform3fv(u_ColorLoc, colors[1]);
    gl.drawArrays(gl.TRIANGLE_FAN, 122, 4);

    //muffin top trial//
    //gl.uniform2fv(u_vCenterLoc, vec2(0.05, 0.8));
    //gl.uniform3fv(u_ColorLoc, colors[2]);
    //gl.drawArrays(gl.TRIANGLE_FAN, 50, 38);


    goodMuffin();
    badMuffin();
    drawScore();
    drawLives();

    if (currentLives >= 0) {
        window.requestAnimFrame(render);
    } else {
        alert("Game Over!");
    }
}