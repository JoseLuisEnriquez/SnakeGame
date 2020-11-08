/*jslint bitwise:true, es5: true */
(function (window, undefined){
    'use strict';
    var key_left = 37, key_up = 38, key_right = 39, key_down = 40, key_enter = 13,
        canvas = null,
        ctx = null,
        lastPress = null,
        pause = true,
        gameover = true,
        dir = 0,
        score = 0,
        food = null,
        //wall = new Array();
        body = [],
        iBody = new Image(),
        iFood = new Image(),
        aEat = new Audio(),
        aDie = new Audio,
        lastUpdate = 0,
        fps = 0,
        frames = 0,
        acumDelta =0,
        x = 50,
        y = 50;

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

    function Rectangle(x, y, width, height){
        this.x = (x == null) ? 0 : x;
        this.y = (y == null) ? 0 : y;
        this.width = (width == null) ? 0 : width;
        this.height = (height == null) ? this.width : height;
    }

    Rectangle.prototype = {
        constructor: Rectangle,
        intersects: function(rect){
            if(rect === undefined){
                window.console.warn('Missing parameters on function intersects');
            } else {
                return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
            }
        },
        fill: function(ctx){
            if(ctx === undefined){
                window.console.warn('Missing parameters on function fill');
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        },
        drawImage: function(ctx, img){
            if(img === undefined){
                window.console.warn('Missing parameters on function drawImage');
            } else {
                if(img.width){
                    ctx.drawImage(img, this.x, this.y);
                } else {
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                }
            }
        }
    };

    function random(max){
        return ~~(Math.random() * max);
    }

    function canPlayOgg(){
        var aud = new Audio();
        if(aud.canPlayType('sounds/ogg').replace(/no/, '')){
            return true;
        } else {
            return false;
        }
    }

    function reset(){
        score = 0;
        dir = 1;
        body.length = 0;
        body.push (new Rectangle(40, 40, 10, 10));
        body.push (new Rectangle(0, 0, 10, 10));
        body.push (new Rectangle(0, 0, 10, 10));
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        gameover = false;
    }

    function paint(ctx){
        var i = 0,
            l = 0;
        //Clean canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //Draw player
        ctx.strokeStyle = '#0f0';
        for (i = 0, l = body.length; i < l; i += 1){
            body[i].drawImage(ctx, iBody);
        }
        //Draw walls
        //ctx.fillStyle = '#999';
        //for (i = 0, l = wall.length; i < l; i += 1){
        //    wall[i].fill(ctx);
        //}
        //Draw food
        ctx.strokeStyle = '#f00';
        food.drawImage(ctx, iFood);
        //Debug last key pressed
        ctx.fillStyle = '#fff';
        //ctx.fillText('Last press: ' + lastPress, 0, 20);
        //Draw score
        ctx.fillText('Score: ' + score, 0, 10);
        //Draw pause
        if(pause){
            ctx.textAling = 'center';
            if(gameover){
                ctx.fillStyle = '#f00';
                ctx.fillText('GAME OVER', 300, 125);
            } else {
            ctx.fillText('PAUSE', 300, 125);
            }
            ctx.textAling = 'left';
        }
        //FPS
        ctx.fillText('FPS: ' + fps, 10, 20);
    }

    function act(){
        var i, l;
        if(!pause){
            //Gameover Reset
            if(gameover){
                reset();
            }
            //Move body
            for (i = body.length - 1; i > 0; i -= 1){
                body[i].x = body[i - 1].x;
                body[i].y = body[i - 1].y;
            }
            //Change direction
            if(lastPress === key_up && dir !== 2){
                dir = 0;
            }
            if(lastPress === key_right && dir !== 3){
                dir = 1;
            }
            if(lastPress === key_down && dir !== 0){
                dir = 2;
            }
            if(lastPress === key_left && dir !== 1){
                dir = 3;
            }
            //Move head
            if(dir === 0){
                body[0].y -= 10;
            }
            if(dir === 1){
                body[0].x += 10;
            }
            if(dir === 2){
                body[0].y += 10;
            }
            if(dir === 3){
                body[0].x -= 10;
            }
            //Out Screen
            if(body[0].x > canvas.width - body[0].width){
                body[0].x = 0;
            }
            if(body[0].y > canvas.height - body[0].height){
                body[0].y = 0;
            }
            if(body[0].x < 0){
                body[0].x = canvas.width - body[0].width;
            }
            if(body[0].y < 0){
                body[0].y = canvas.height - body[0].height;
            }
            //Body intersects
            for (i = 2, l = body.length; i < l; i += 1){
                if(body[0].intersects(body[i])){
                    gameover = true;
                    pause = true;
                    aDie.play();
                }
            }
            //Food intersects
            if(body[0].intersects(food)){
                body.push(new Rectangle(food.x, food.y, 10, 10));
                score += 1;
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
                aEat.play();
            }
            //Wall intersects
            /*
            for(i = 0, l = wall.length; i < l; i += 1){
                if(food.intersects(wall[i])){
                    food.x = random(canvas.width / 10 - 1) * 10;
                    food.y = random(canvas.height / 10 - 1) * 10;
                }
                if(player.intersects(wall[i])){
                    gameover = true;
                    pause = true;
                }
            }*/
        }
        //Paused - Unpaused
        if(lastPress === key_enter){
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
        var now = Date.now(),
        deltaTime = (now - lastUpdate) / 1000;
        if(deltaTime > 1){
            deltaTime = 0;
        }
        lastUpdate = now;
        frames += 1;
        acumDelta += deltaTime;
        if(acumDelta > 1){
            fps = frames;
            frames = 0;
            acumDelta -= 1;
        }
        act();
        paint(ctx);
    }

    function init(){
        //Get canvas and context
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        //Load assets
        iBody.src = 'images/body.png';
        iFood.src = 'images/food.png';
        if(canPlayOgg()){
            aEat.src = 'sounds/chomp.oga';
            aDie.src = 'sounds/dies.oga';
        } //else {
            //aEat.src = 'sounds/chomp.m4a';
            //aDie.src = 'sounds/dies.m4a';
        //}
        //Create food
        food = new Rectangle(80, 80, 10, 10);
        //Create Walls
        //wall.push(new Rectangle(100, 50, 10, 10));
        //wall.push(new Rectangle(100, 100, 10, 10));
        //wall.push(new Rectangle(200, 50, 10, 10));
        //wall.push(new Rectangle(200, 100, 10, 10));
        //Start game
        run();
        repaint();
    }

    window.addEventListener('load', init, false);
}(window));