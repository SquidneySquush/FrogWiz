"use strict";

var gl;
var vertices;
var program;
var RulesAudio;
var GameAudio;
var WizardAudio;
var JumpAudio;
var LoseAudio;


// Move base variables
var xFrogMove = 0.0;

var xGood = 0.06;
var yGood = 0.94;
var xBad = -0.06;
var yBad = 0.94;
var xFly = -0.94;
var yFly = -0.35;
var xGVel, yGVel, xBVel, yBVel, xFlyVel, yFlyVel;
var xGoodArr= [];
var yGoodArr = [];
var xBadArr= [];
var yBadArr = [];
//flys arrays - made as arrays incase multiple flys at a time becomes a desire otherwise just xFly and yFly would be fine
//var xFlyArr = [];
//var yFlyArr = [];
var xCloudArr = [-0.6, 0.6, 0.1, 0.45, -0.4];
var yCloudArr = [0.2, -0.15, 0.7, 0.65, 0.0];
var sendyFly = true; //sendyFly false a fly has not been sent across the screen yet; true once a fly has finished crossing screen
var newFly = true; // newFly is true when a fly is first being sent acroos screen, false when the new fly buzzes up a bit for the first time
var yFlyChecker;

var Score;
var currentScore;
var Title;

var Rules;
var StartButton;

var currentLives;

// frog
var xFrogCenter, yFrogCenter;
var xFrogVel, yFrogVel = 0.0;
var a_vPositionLoc;
var vBuffer;

var projectionMatrix, u_projectionMatrixLoc;

var a_TextureCoordLoc;
var u_TextureSamplerLoc;
var textureCoordData = [0, 1, 0, 0, 1, 0, 1, 1];
var textures = [];
var TextureCoordBuffer;
var ctMatrixLoc;
var ctMatrix;

var maxMuffins = 10;

var GameOver = false;
var inAir = false;
var arrowUp = false;
var jumpDown = false;
var Wizardplay = false;



window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    Score = document.getElementById("Score");
    Rules = document.getElementById("Rules");
    StartButton = document.getElementById("Start");
    Title = document.getElementById("Title");


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


    a_TextureCoordLoc = gl.getAttribLocation(program, "a_TexCoord");

    u_TextureSamplerLoc = gl.getUniformLocation(program, "u_TextureSampler");
    
    gl.enableVertexAttribArray(a_TextureCoordLoc);
    gl.vertexAttribPointer(a_TextureCoordLoc, 2, gl.FLOAT, false, 0, 0);

    
    u_projectionMatrixLoc = gl.getUniformLocation( program, "u_projectionMatrix" );
    projectionMatrix =  ortho(-1, 1, -1, 1, -1, 1);  //perspective(fovy, aspect, near, far);


    gl.uniformMatrix4fv( u_projectionMatrixLoc, false, flatten(projectionMatrix) );

    ctMatrixLoc = gl.getUniformLocation(program, "ctMatrix");

    initTexture("./images/Frog.png");
    initTexture("./images/goodMuffin.png");
    initTexture("./images/badMuffin.png");
    initTexture("./images/grass.png");
    initTexture("./images/WizardFrog.png");
    initTexture("./images/BeeBoi.png");
    initTexture("./images/heart.png");
    initTexture("./images/CloudyWoudy.png");
    initTexture("./images/MrCloud.png");
    RulesAudio = new Audio("./sounds/background_rules.mp3");
    GameAudio = new Audio("./sounds/background_game.mp3");
    WizardAudio = new Audio("./sounds/youre-a-wizard.mp3");
    JumpAudio = new Audio("./sounds/jump.mp3");
    LoseAudio = new Audio("./sounds/damage.mp3");
    moveFrog();

    document.getElementById("Start").onclick = function() {
        RulesAudio.pause();
        render();
        Rules.innerHTML = "";
        Title.innerHTML = "";
        StartButton.style.visibility = "hidden";
        GameAudio.loop=true;
        GameAudio.play();
    }

    Start();

}



function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor(25/255, 25/255, 112/255, 1.0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    drawClouds();
    drawFrog();
    var mufCount = Math.floor(currentScore/200);
    for(var i = 0; i <= mufCount; i++){
        animate(i);

        drawGoodMuffin(i);
        drawBadMuffin(i);
        
        goodMuffinCheck(i);
        badMuffinCheck(i);
    }
    if (sendyFly == false){
        animateFly();
        drawFlies();
        FlyCheck();
    }

    drawGrass();

    drawScore();
    drawHearts(currentLives);

    if (currentLives > 0) {
        window.requestAnimFrame(render);
    } else {
        GameAudio.pause();
        LoseAudio.play();
        alert("Game Over!");
    }
}



function setup() {
    /////////////////vertices used for all objects/textures//////////////////////
    vertices = [vec2(-0.075, 0.075),
                vec2(-0.075, -0.075),
                vec2(0.075, -0.075),
                vec2(0.075, 0.075)];
    
    xFrogCenter = 0.0;
    yFrogCenter = -0.8;

    for(var i= 0; i < maxMuffins; i++){
        xGoodArr.push(xGood);
        yGoodArr.push(yGood);

        xBadArr.push(xBad);
        yBadArr.push(yBad);
    }

    xGVel = 0.000;
    yGVel = -0.005;
    xBVel = 0.000;
    yBVel = -0.0075;
    xFlyVel = 0.0075;
    yFlyVel = 0.000;
}

function goodMuffinCheck(index) {
    if ((yGoodArr[index]-0.1) <= (yFrogCenter)){
        if ((xGoodArr[index] >= (xFrogCenter - 0.15)) && (xGoodArr[index] <= (xFrogCenter + 0.15))) {
            currentScore += 100;
            if(currentScore == 100||currentScore%500 == 0){
                sendyFly = false;
            }
            yGoodArr[index] = 0.925;
            xGoodArr[index] = Math.random() - Math.random();
        }
    }
    if (yGoodArr[index] <= (-1.0)) {
        yGoodArr[index] = 0.925;
        xGoodArr[index] = Math.random() - Math.random();
    }
}

function badMuffinCheck(index) {
    if ((yBadArr[index]-0.1) <= (yFrogCenter)){
        if ((xBadArr[index] >= (xFrogCenter - 0.15)) && (xBadArr[index] <= (xFrogCenter + 0.15))) {
            currentLives -= 1;
            yBadArr[index] = 0.925;
            xBadArr[index] = Math.random() - Math.random();
        }
    }
    if (yBadArr[index] <= (-1.0)) {
        yBadArr[index] = 0.925;
        xBadArr[index] = Math.random() - Math.random();
    }
}
function FlyCheck() {
    if ((yFly - 0.015) <= (yFrogCenter)) {
        if ((xFly >= (xFrogCenter - 0.15)) && (xFly <= (xFrogCenter + 0.15))) {
            if(currentLives < 3){
                currentLives += 1;
            }
            xFly = -0.94;
            yFly = -0.35 - (Math.random()* (0.5-0)+0);
            sendyFly = true;
            newFly = true;
            yFlyVel = 0.00;
        }
    }
    if (xFly >= (1.0)) {
        xFly = -0.94;
        yFly = -0.35 - (Math.random() * (0.5 - 0) + 0);
        sendyFly = true;
        newFly = true;
        yFlyVel = 0.00;
    }
}

function drawFrog(){
    xFrogCenter = (xFrogMove * 0.05);
    var scaleFacDif = 1.5;
    var transDif = 0.023;
    frogJump(arrowUp);

    if ( currentScore < 1000){ 
        handleLoadedTexture(textures[0]);
    } else{
        handleLoadedTexture(textures[4]);
        if(Wizardplay == false){
            WizardAudio.play();
            Wizardplay = true;
        }
        scaleFacDif = 1.75;
        transDif = 0.046;
    }


    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    ctMatrix = mat4();
    // translate frog to moved position
    ctMatrix = mult(scalem(scaleFacDif,scaleFacDif,1.25), ctMatrix);
    ctMatrix = mult(translate(xFrogCenter,yFrogCenter+transDif, 0.0), ctMatrix);
    gl.uniformMatrix4fv( ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawGoodMuffin(index){

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    handleLoadedTexture(textures[1]); 
    ctMatrix = mat4();
    // translate muffin to moved position
    ctMatrix = mult(scalem(0.95, 1.0, 1.0), ctMatrix); 
    ctMatrix = mult(translate(xGoodArr[index],yGoodArr[index], 0.0), ctMatrix);
    gl.uniformMatrix4fv( ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawBadMuffin(index){

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    handleLoadedTexture(textures[2]); 
    ctMatrix = mat4();
    // translate and scale muffin to moved position
    ctMatrix = mult(scalem(0.95, 1.0, 1.0), ctMatrix); 
    ctMatrix = mult(translate(xBadArr[index],yBadArr[index], 0.0), ctMatrix);
    gl.uniformMatrix4fv( ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function drawGrass(){
    // Grass //

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    handleLoadedTexture(textures[3]); 
    ctMatrix = mat4();
    // translate and scale grass to moved position
    ctMatrix = mult(scalem(15.0, 1.0, 2.0), ctMatrix);
    ctMatrix = mult(translate(0.0, -0.95, 0.0), ctMatrix);
    gl.uniformMatrix4fv( ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
function drawHearts(numLives) {
    var heartposition = 0.925;

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    handleLoadedTexture(textures[6]);
    for (var i = 0; i < numLives; i++) {
        ctMatrix = mat4();
        ctMatrix = mult(scalem(0.675, 0.675, 2.0), ctMatrix);
        ctMatrix = mult(translate(heartposition,0.925,0.0),ctMatrix);
        gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));
        gl.drawArrays(gl.TRIANGLE_FAN,0,4);
        heartposition = heartposition - 0.1;
    }


}
function drawFlies(index){

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);

    handleLoadedTexture(textures[5]);
    ctMatrix = mat4();
    // translate and scale fly to moved position
    ctMatrix = mult(scalem(0.625, 0.625, 2.0), ctMatrix);
    ctMatrix = mult(translate(xFly, yFly, 0.0), ctMatrix);
    gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

}
function drawClouds(){

    gl.enableVertexAttribArray(a_vPositionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(a_vPositionLoc, 2, gl.FLOAT, false, 0, 0);
    handleLoadedTexture(textures[7]);
    for (var j = 0; j < 3; j++){
        ctMatrix = mat4();
        // translate and scale cloud to moved position
        if (j == 0){
            ctMatrix = mult(scalem(-4.625, 2.9, 1.0), ctMatrix);
        }else{
            ctMatrix = mult(scalem(4.625 - (0.5 * j), 2.9 - (0.2 * j), 1.0), ctMatrix); 
        }
        ctMatrix = mult(translate(xCloudArr[j], yCloudArr[j], 0.0), ctMatrix);
        gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
    handleLoadedTexture(textures[8]);
    for (var k = 0;k < 2; k++){
        ctMatrix = mat4();
        // translate and scale cloud to moved position
        if (k == 0) {
            ctMatrix = mult(scalem(-3.625, 0.9, 1.0), ctMatrix);
        } else {
            ctMatrix = mult(scalem(3.625, 0.9, 1.0), ctMatrix);
        }
        ctMatrix = mult(translate(xCloudArr[k+3], yCloudArr[k+3], 0.0), ctMatrix);
        gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

}

function handleLoadedTexture(texture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(u_TextureSamplerLoc, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

function initTexture(textID) {
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.src = textID;
    textures.push(texture);

}


function animate(index) {
    xGoodArr[index] += xGVel;
    yGoodArr[index] += yGVel;

    xBadArr[index] += xBVel;
    yBadArr[index] += yBVel;
}
function animateFly(){
    xFly += xFlyVel;
    if(newFly == true){ //first time fly(bee) moves in y direction across screen is up
        yFlyChecker = yFly;
        yFlyVel = 0.01;
        newFly = false;
    } 
    if (yFly >= yFlyChecker+0.05){ //went up now going down
        yFlyVel = -0.01;
    } 
    if (yFly <= yFlyChecker-0.05){ //went down now going up
        yFlyVel = 0.01;
    }
    yFly += yFlyVel;
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
                    JumpAudio.play();
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


    if(yFrogCenter >= (-0.3)){
        jumpDown = true;
    }
    if(jumpDown == false){
        yFrogCenter += yFrogVel;
        yFrogVel *= 0.8;
    }
    else{
        yFrogCenter -= yFrogVel;//down
        yFrogVel *= 0.8;

    }
    if (yFrogCenter <= -0.8 ){
        //back in place
        yFrogVel = 0.0;
        yFrogCenter = -0.8;
        inAir = false;
        jumpDown = false;
        arrowUp = false;
    }

}

function ShowRules() {
    var tString = "Frog Wizard";
    Title.innerHTML = tString;
    var rString = "1.To move frog left and right, use left and right arrow keys<br/>2.Use up arrow key to jump<br/>3.To eat a muffin, position frog such that falling<br/> muffin hits frog<br/>4.If frog eats bad muffin(purple and green), a life is lost.<br/>5.If frog eats good muffin, points are gained.<br/>6. If frog gets a bee(rare), a life can be <br/>gained but lives will not exceed 3.<br/>7.Get as many points possible until all lives are lost.<br/>Press 'Start' to play!<br/>";
    Rules.innerHTML = rString;
}

function Start() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    ShowRules();
    RulesAudio.loop=true;
    RulesAudio.play();
}


function drawScore() {
    var string = "Score "+ currentScore.toString();
    Score.innerHTML = string;
}
