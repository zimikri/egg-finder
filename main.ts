'use strict';

import Playground from './Playground';

const canvas = document.querySelector('#canvas1') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
const MAX_SIZE: number = 800;
// const egg = document.getElementById('egg') as HTMLImageElement;
let playground: Playground;

window.onload = (event) => {
    startApp();
};

function startApp() {
    initCanvas();

    playground = new Playground(canvas.width, 8, ctx, 7, true);    
    playground.render();        
}



function initCanvas() {
    const clientWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    document.querySelector('#center-container').setAttribute("style", `height:${clientHeight}px`);

    canvas.width = Math.min(clientWidth - 10, clientHeight - 10, MAX_SIZE);
    canvas.height = canvas.width;
    canvas.setAttribute('style', 'border: 0.5px solid #cccccc;');

    ctx.lineWidth = 0.3;
}

window.addEventListener('resize', () => {
    initCanvas();
    playground.size = canvas.width;
    
});
canvas.addEventListener('click', (event) => {
    // console.log(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
    playground.click(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop);
});
 
