/*jslint bitwise:true, es5: true */
(function (window, undefined){
    'use strict';
    var key_left = 37, key_up = 38, key_right = 39, key_down = 40, key_enter = 13,
        canvas = null,
        ctx = null,
        lastPress = null,
        pause = false,
        gameover = false,
        currentScene = 0,
        scenes = [],
        mainScene = null,
        gameScene = null,
        highScoreScene = null,
        dir = 0,
        score = 0,
        food = null,
        //wall = [],
        highScores = [],
        posHighScores = 10,
        body = [],
        iBody = new Image(),
        iFood = new Image(),
        aEat = new Audio(),
        aDie = new Audio;

    window.requestAnimationFrame = (function(){
        return window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback){
            window.setTimeout(callback, 17);
        };
    }());

    document.addEventListener('keydown', function(evt){
        if(evt.which >= 37 && evt.which <= 40){
            evt.preventDefault();
        }
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

    function Scene(){
        this.id = scenes.length;
        scenes.push(this);
    }

    Scene.prototype = {
        constructor: Scene,
        load: function(){},
        paint: function(ctx){},
        act: function(){}
    };

    function loadScene(scene){
        currentScene = scene.id;
        scenes[currentScene].load();
    }

    function random(max){
        return ~~(Math.random() * max);
    }

    function addHighScore(score){
        posHighScores = 0;
        while (highScores[posHighScores] > score && posHighScores < highScores.length){
            posHighScores += 1;
        }
        highScores.splice(posHighScores, 0, score);
        if(highScores.length > 10){
            highScores.length = 10;
        }
        localStorage.highScores = highScores.join(',');
    }

    function repaint(){
        window.requestAnimationFrame(repaint);
        if (scenes.length){
            scenes[currentScene].paint(ctx);
        }
    }

    function run(){
        setTimeout(run, 50);
        if(scenes.length){
            scenes[currentScene].act();
        }
    }

    function init(){
        //Get canvas and context
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        //Load assets
        iBody.src = 'images/body.png';
        iFood.src = 'images/food.png';
        aEat.src = 'sounds/chomp.oga';
        aDie.src = 'sounds/dies.oga';
        //Create food
        food = new Rectangle(80, 80, 10, 10);
        //Create Walls
        //wall.push(new Rectangle(100, 50, 10, 10));
        //wall.push(new Rectangle(100, 100, 10, 10));
        //wall.push(new Rectangle(200, 50, 10, 10));
        //wall.push(new Rectangle(200, 100, 10, 10));
        //Load saved highscores
        if(localStorage.highScores){
            highScores = localStorage.highScores.split(',');
        }
        //Start game
        run();
        repaint();
    }

    //Main Scene
    mainScene = new Scene();
    mainScene.paint = function(ctx){
        //Clean canvas
        ctx.fillStyle = '#030';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //Draw title
        ctx.fillStyle = '#fff';
        ctx.fillAlign = 'center';
        ctx.fillText('SNAKE', 150, 60);
        ctx.fillText('Press Enter', 150, 90);
    };

    mainScene.act = function(){
        //Load next scene
        if(lastPress === key_enter){
            loadScene(gameScene);
            lastPress = null;
        }
    };

    //Game scene
    gameScene = new Scene();
    gameScene.load = function(){
        score = 0;
        dir = 1;
        body.length = 0;
        body.push(new Rectangle(40, 40, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        body.push(new Rectangle(0, 0, 10, 10));
        food.x = random(canvas.width / 10 - 1) * 10;
        food.y = random(canvas.height / 10 - 1) * 10;
        gameover = false;
    };

    gameScene.paint = function(ctx){
        var i = 0, l = 0;
        //Clean canvas
        ctx.fillStyle = '#030';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //Draw player
        ctx.strokeStyle = '#0f0';
        for (i = 0, l = body.length; i < l; i += 1){
            body[i].drawImage(ctx, iBody);
        }
        /*Draw walls
        ctx.fillStyle = '#999';
        for (i = 0, l = wall.length; i < l; i += 1) {
            wall[i].fill(ctx);
        }*/
        //Draw food
        ctx.strokeStyle = '#f00';
        food.drawImage(ctx, iFood);
        //Draw score
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + score, 0, 10);
        // Debug last key pressed
        //ctx.fillText('Last Press: '+lastPress,0,20);
        //Draw pause
        if (pause){
            ctx.textAlign = 'center';
            if(gameover){
                ctx.fillText('GAME OVER', 150, 75);
            } else {
                ctx.fillText('PAUSE', 150, 75);
            }
        }
    };

    gameScene.act = function(){
        var i = 0, l = 0;
        if(!pause){
            //Game over reset
            if(gameover){
                loadScene(mainScene);
            }
            //Move body
            for(i = body.length - 1; i > 0; i -= 1){
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
            if (dir === 0){
                body[0].y -= 10;
            }
            if (dir === 1){
                body[0].x += 10;
            }
            if (dir === 2){
                body[0].y += 10;
            }
            if (dir === 3){
                body[0].x -= 10;
            }
            //Out screen
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
            //Food intersects
            if(body[0].intersects(food)){
                body.push(new Rectangle(0, 0, 10, 10));
                score += 1;
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
                aEat.play();
            }
            // Wall Intersects
            //for (i = 0, l = wall.length; i < l; i += 1) {
            // if (food.intersects(wall[i])) {
            // food.x = random(canvas.width / 10 - 1) * 10;
            // food.y = random(canvas.height / 10 - 1) * 10;
            // }
            //
            // if (body[0].intersects(wall[i])) {
            // gameover = true;
            // pause = true;
            // }
            //}
            //Body intersects
            for (i = 2, l = body.length; i < l; i += 1){
                if(body[0].intersects(body[i])){
                    gameover = true;
                    pause = true;
                    aDie.play();
                    addHighScore(score);
                    loadScene(highScoreScene);
                }
            }
        }
        //Pause / Unpaused
        if(lastPress === key_enter){
            pause = !pause;
            lastPress = null;
        }
    };

    //Highscore scene
    highScoreScene = new Scene();
    highScoreScene.paint = function(ctx){
        var i = 0, l = 0;
        //Clean canvas
        ctx.fillStyle = '#030';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //Draw title
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('HIGH SCORES', 150, 30);
        //Draw highscores
        ctx.textAlign = 'right';
        for (i = 0, l = highScores.length; i < l; i += 1){
            if(i === posHighScores){
                ctx.fillText('*' + highScores[i], 180, 40 + i * 10);
            } else {
                ctx.fillText(highScores[i], 180, 40 + i * 10);
            }
        }
    };

    highScoreScene.act = function(){
        //Load next scene
        if(lastPress === key_enter){
            loadScene(gameScene);
            lastPress = null;
        }
    };

    window.addEventListener('load', init, false);
}(window));