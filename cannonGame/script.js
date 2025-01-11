var myWheel, myCannon, myCarriage, aCannonBall, aFuGo; // Game components
var speed = 50; // Initial speed value
var cannonAngle = 0; // Angle of the cannon (0 degrees aiming to the right)
var wheelAngle = 0; // Angle of the wheel (0 degrees pointing up)
var cannonBallActive = false; // Tracks if a cannonball is currently active
var cannonAudio;

var explosionAudio;
var explosionGif;

var fuGoSpeedY = 2; //constant speed of FuGo

var lives = 5;
var score = 0;

function startGame() {
    myGameArea.start();
    myWheel = new component("resources/Wheel.png", 120, 120, 20, window.innerHeight - 160); // Wheel component
    myCannon = new component("resources/Turret.png", 200, 40, 30, myWheel.y - 80); // Cannon component
    myCarriage = new component("resources/Carriage.png", 200, 40, 30, myWheel.y - 80); // Carriage component
    aCannonBall = new component("resources/cannonBall.png", 40, 40, 0, 0); // Cannon ball component
    aFuGo = new component("resources/FuGo.png", 100, 200, window.innerWidth - 100, 0); // FuGo component

    cannonAudio = new Audio("resources/shot.m4a");//audio file
    explosionAudio = new Audio("resources/explosion.m4a");

    explosionGif = new component("resources/explosion.gif", 100, 100, 0, 0);


    document.getElementById('speed').addEventListener('input', function() {
        speed = parseInt(this.value, 10);
    });
    document.getElementById('gameOverMessage').style.visibility = 'hidden';
    document.getElementById('lives').innerHTML = lives;
    document.getElementById('score').innerHTML = score;
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = window.innerWidth - 30; // Set canvas to full screen width
        this.canvas.height = window.innerHeight - 40; // Set canvas to full screen height
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);//update game
        window.addEventListener('keydown', function(e) {
            myGameArea.key = e.keyCode;
        });
        window.addEventListener('keyup', function(e) {
            myGameArea.key = false;
        });
        //resize canvas
        window.addEventListener('resize', function() {
            myGameArea.canvas.width = window.innerWidth-30;
            myGameArea.canvas.height = window.innerHeight-40;
        });
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};
// Create a component object
function component(imageSrc, width, height, x, y) {
    this.gamearea = myGameArea;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.angle = 0; // Add angle property for rotation
    this.image = new Image();
    this.image.src = imageSrc;

    this.update = function() {
        var ctx = myGameArea.context;
        ctx.save();
        if (this === myCannon) {
            // Rotate the cannon
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(cannonAngle * Math.PI / 180);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        } else if (this === myWheel) {
            // Rotate the wheel while moving
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.angle);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // Draw normally for other components
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    };

    this.newPos = function() {//update position
        this.x += this.speedX;
        this.y += this.speedY;

        // Rotate the wheel based on horizontal speed
        if (this === myWheel && this.speedX !== 0) {
            this.angle += (this.speedX / 50); // Adjust rotation speed factor as needed
        }

        // Boundary checks for wheel movement with 100px margin
        if (this === aCannonBall) {
            //no action
        } else {
            //bpundary check
            if (this.x < 100) { 
                this.x = 100; 
            }
            if (this.x + this.width > myGameArea.canvas.width - 100) {
                this.x = myGameArea.canvas.width - 100 - this.width;
            }
        }

        
    };
}

function updateGameArea() {
    myGameArea.clear();
    myWheel.speedX = 0;
    myWheel.speedY = 0;
    myCannon.speedX = 0;
    myCannon.speedY = 0;
    myCarriage.speedX = 0;
    myCarriage.speedY = 0;

    // Movement controls
    if (myGameArea.key && myGameArea.key == 37) { // Left arrow
        myWheel.speedX = -speed / 10;
        myCannon.speedX = myWheel.speedX;
        myCarriage.speedX = myWheel.speedX;
        wheelAngle -= 2; // Rotate counterclockwise
    }
    if (myGameArea.key && myGameArea.key == 39) { // Right arrow
        myWheel.speedX = speed / 10;
        myCannon.speedX = myWheel.speedX;
        myCarriage.speedX = myWheel.speedX;
        wheelAngle += 2; // Rotate clockwise
    }
    if (myGameArea.key && myGameArea.key == 38) { // Up arrow
        cannonAngle -= 2; // Rotate counterclockwise
        if (cannonAngle < -35) cannonAngle = -35; // Limit rotation to -35 degrees
    }
    if (myGameArea.key && myGameArea.key == 40) { // Down arrow
        cannonAngle += 2; // Rotate clockwise
        if (cannonAngle > 35) cannonAngle = 20; // Limit rotation to +35 degrees
    }

    // Shoot the cannonball if space bar is pressed and no other cannonball is active
    if (myGameArea.key && myGameArea.key == 32 && !cannonBallActive) {
        shootCannonBall();
    }

    // Update new positions
    myCarriage.newPos();
    myWheel.newPos();
    myCannon.newPos();

    // Adjust the cannon to be inside the wheel
    myCannon.x = myWheel.x-10;
    myCannon.y = myWheel.y + (myWheel.height / 4) - (myCannon.height / 2); // Center the cannon inside the wheel

    // Adjust the carriage to be inside the wheel
    myCarriage.x = myWheel.x - 50;
    myCarriage.y = myWheel.y + (myWheel.height / 3) - (myCarriage.height / 4); // Center the carriage inside the wheel

    // Update the cannonball position if it is active
    if (cannonBallActive) {
        aCannonBall.newPos();
        // Check if the cannonball is off-screen
        if (aCannonBall.x < 0 || aCannonBall.x > myGameArea.canvas.width || 
            aCannonBall.y < 0 || aCannonBall.y > myGameArea.canvas.height) {
            resetCannonBall();
        }
    }

    // Update the FuGo position if it is active
    aFuGo.y += fuGoSpeedY;

    if (aFuGo.y > myGameArea.canvas.height) {
        resetFuGo();
        lives--;
    }


    // Check for collision between cannonball and FuGo
    if (
        aCannonBall.x < aFuGo.x + aFuGo.width &&
        aCannonBall.x + aCannonBall.width > aFuGo.x &&
        aCannonBall.y < aFuGo.y + aFuGo.height &&
        aCannonBall.y + aCannonBall.height > aFuGo.y
    ){

        //play explosion gif and sound
        explosionAudio.volume = 0.2;
        explosionAudio.play();
        explosionGif.x = aFuGo.x;
        explosionGif.y = aFuGo.y;
        explosionGif.update();


        resetCannonBall();
        resetFuGo();
        score++;
        explosionAudio.currentTime = 0;

    }








    // Redraw components so everything is in the same layer
    myCannon.update();
    myCarriage.update();
    myWheel.update();
    if (cannonBallActive) {
        aCannonBall.update();
    }
    aFuGo.update();




    // refresh the score and lives
    document.getElementById('lives').innerHTML = lives;
    document.getElementById('score').innerHTML = score;
    // check if run out of lives
    if (lives <= 0) {
        gameOver();
    }


}

function shootCannonBall() {
    // Calculate the initial position of the cannonball at the tip of the cannon
    var cannonLength = myCannon.width; // Length of the cannon
    var tipX = myCannon.x + (cannonLength / 2) * Math.cos(cannonAngle * Math.PI / 180);
    var tipY = myCannon.y + (cannonLength / 2) * Math.sin(cannonAngle * Math.PI / 180) -30;

    // Set the initial position of the cannonball to the tip of the cannon
    aCannonBall.x = tipX + myCannon.width / 2;
    aCannonBall.y = tipY + myCannon.height / 2;

    // Set the speed based on the cannon's angle
    aCannonBall.speedX = 15 * Math.cos(cannonAngle * Math.PI / 180);
    aCannonBall.speedY = 15 * Math.sin(cannonAngle * Math.PI / 180);

    cannonAudio.volume = 0.2;
    cannonAudio.play();// Play the shot sound

    // Mark the cannonball as active
    cannonBallActive = true;
}

function resetCannonBall() {
    // Reset the cannonball position and speed
    aCannonBall.x = 0;
    aCannonBall.y = 0;
    aCannonBall.speedX = 0;
    aCannonBall.speedY = 0;

    // Stop the shot sound
    cannonAudio.pause();
    cannonAudio.currentTime = 0; //reset audio

    // Mark the cannonball as inactive
    cannonBallActive = false;
}

function resetFuGo(){
    aFuGo.y = 0;
    aFuGo.x = Math.random() * (myGameArea.canvas.width / 2) + myGameArea.canvas.width / 2 - 70;
}

function gameOver() {
    //show game over screen
    document.getElementById('gameOverMessage').style.visibility = 'visible';
    document.getElementById('finalScore').innerHTML = score;
    clearInterval(myGameArea.interval);
    myGameArea.clear();
    myGameArea.canvas.remove();
    
}

function gameRestart(){
    //set all values to default
    speed = 50;
    //set lives in the html to 5
    speed = 50;
    lives = 5;
    score = 0;

    startGame();
}



//test================================================================
function test(){
    //life --
    lives--;
}

function test2(){
    //score ++
    score++;
    
}