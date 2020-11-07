var canvas = null,
    ctx = null;

function paint(ctx){
    ctx.fillStyle = '#0f0';
    ctx.fillRect(0, 0, 100, 60);
    ctx.fillStyle = '#00f';
    ctx.fillRect(100, 0, 100, 60);
    ctx.fillStyle = '#f00';
    ctx.fillRect(200, 0, 100, 60);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(300, 0, 100, 60);
    ctx.fillStyle = '#ff8000';
    ctx.fillRect(400, 0, 100, 60);
    ctx.fillStyle = '#4C2882';
    ctx.fillRect(500, 0, 100, 60);
    ctx.strokeStyle = '#FF0000';
    ctx.strokeRect(0, 0, 300, 150);
}

function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    paint(ctx);
}

window.addEventListener('load', init, false);