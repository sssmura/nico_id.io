import Scope from "./module/scope.js";
let job;
const canvas = document.querySelector("canvas");
const img = new Image();
// img.src = './images/test0.png';
let input = document.getElementById("input");

let ongoingTouche;
let scope;
input.addEventListener('change',fileInput,false);   
document.addEventListener("DOMContentLoaded", startup);
img.addEventListener("load",imageLoad, false);
function fileInput(e){
    console.log('change');
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            img.src = reader.result;
        }
}

function imageLoad(){
    let sw = window.screen.width; // 画面の横幅
    let sh = window.screen.height;
    let displayWidth = img.width;
    let displayHeight = img.height;
    if (displayWidth > sw*0.8 ) {
        let ratio =sw*0.8 / img.width;
        displayWidth = img.width * ratio ;
        displayHeight = img.height * ratio ;
    }
    canvas.width = displayWidth;
    canvas.height = displayHeight/2;
    console.log('load')
    scope = new Scope(canvas,img);     
    scope.draw();
    let cut_data=scope.get_cutCanvasData();
    job=Tesseract.recognize(
        cut_data,
        'eng',
        { logger: m => console.log(m) }
      ).then((data) => {
        console.log(data.text);
        let id=extractFirstNumber(data.text);
        console.log(data.text,id);

        create_iframe(id);

      })
}

function startup() {
    if (window.matchMedia( "(min-width: 400px)" ).matches) {
        document.querySelector('body').innerHTML='申し訳ございません、このサイトはスマホ専用です。。';
        return 
      }
    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('touchcancel', handleCancel);
    canvas.addEventListener('touchmove', handleMove);
    console.log('Initialized.');
}
function handleStart(evt) {
    if(evt.touches.length>1)return;
    evt.preventDefault();
    console.log('touchstart.');
    const touche = evt.changedTouches[0];
    ongoingTouche = touche;
    let position=canvas.getBoundingClientRect();
    scope.detect_corner(touche.pageX-position.left, touche.pageY-position.top);
    scope.detect_inner(touche.pageX-position.left, touche.pageY-position.top);
    scope.draw();
}
function handleMove(evt) {
    if(evt.touches.length>1)return;
    console.log('touchmove.');
    const position=canvas.getBoundingClientRect() ;
    evt.preventDefault();
    const touche = evt.changedTouches[0];
    if(scope.can_deform !=-1){
        console.log('deform');
        scope.deform(touche.pageX-position.left,touche.pageY-position.top);
        scope.draw();
    } else if(scope.can_move){
        let dx=touche.pageX-ongoingTouche.pageX;
        let dy=touche.pageY-ongoingTouche.pageY;
        scope.move(dx,dy);
        scope.draw();
    }else{
        let dy=touche.pageY-ongoingTouche.pageY;
        scope.scroll(10*dy);
        scope.draw();
    }
    ongoingTouche = touche;
    console.log('scope.can_deform:'+scope.can_deform);
}
function handleEnd(evt) {
    if(evt.touches.length>1)return;
    console.log('touchend.');
    evt.preventDefault();
    scope.can_deform=-1;
    scope.can_move=false;
    let cut_data=scope.get_cutCanvasData();
    job=Tesseract.recognize(
        cut_data,
        'eng',
        { logger: m => console.log(m) }
      ).then((data) => {
        console.log(data.text);
        let id=extractFirstNumber(data.text);
        console.log(data.text,id);

        create_iframe(id);

      })
    }
function handleCancel(evt) {
    job.terminate();
    evt.preventDefault();
    console.log('touchcancel.');
    scope.can_move=true;
    scope.can_deform=-1;
}
function extractFirstNumber(text){
    let result=text.match(/\d{4,}/);
    if(result){
        return result[0];
    }else{
        return null;
    }
}

function create_iframe(id){
    // 新しいiframe要素を作成
let iframe = document.createElement('iframe');
iframe.width = '320';
iframe.height = '160';
iframe.src = 'https://ext.nicovideo.jp/thumb_user/'+id;
iframe.scrolling = 'no';
iframe.style.border = 'solid 1px #CCC';
iframe.frameBorder = '0';
document.querySelector('.iframe_area').innerHTML = '';
document.querySelector('.iframe_area').appendChild(iframe);

}