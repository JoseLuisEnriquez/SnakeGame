var canvas = null,
    ctx = null,
    x = 50,
    y = 50,
    lastPress = null,
    key_left = 37, key_up = 38, key_right = 39, key_down = 40, key_enter = 13,
    dir = 0,
    pause = true;

window.requestAnimationFrame = (function(){
    return window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback){
        window.setTimeout(callback, 17);
    };
}());

document.addEventListener('keydown', function(evt){
    lastPress = evt.which;
}, false);

function paint(ctx){
    //Clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //Draw square
    ctx.fillStyle = '#0f0';
    ctx.fillRect(x, y, 10, 10);
    //Debug last key pressed
    ctx.fillText('Last press: ' + lastPress, 0, 20);
    //Draw pause
    if(pause){
        ctx.textAling = 'center';
        ctx.fillText('PAUSE', 300, 125);
        ctx.textAling = 'left';
    }
}

function act(){
    if(!pause){
        //Change direction
        if(lastPress == key_up){
            dir = 0;
        }
        if(lastPress == key_right){
            dir = 1;
        }
        if(lastPress == key_down){
            dir = 2;
        }
        if(lastPress == key_left){
            dir = 3;
        }
        //Move Rect
        if(dir == 0){
            y -= 10;
        }
        if(dir == 1){
            x += 10;
        }
        if(dir == 2){
            y += 10;
        }
        if(dir == 3){
            x -= 10;
        }
        //Out Screen
        if(x > canvas.width){
            x = 0;
        }
        if(y > canvas.height){
            y = 0;
        }
        if(x < 0){
            x = canvas.width;
        }
        if(y < 0){
            y = canvas.height;
        }
    }
    //Paused - Unpaused
    if(lastPress == key_enter){
        pause = !pause;
        lastPress = null;
    }
}

function repaint(){
    window.requestAnimationFrame(repaint);
    paint(ctx);
}

function run(){
    setTimeout(run, 50);
    act();
}

function init(){
    //Get canvas and context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    //Start game
    run();
    repaint();
}

window.addEventListener('load', init, false);