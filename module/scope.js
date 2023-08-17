export default class Scope {
    #from_top=0;
    #img;
    #min_width = 30;
    #min_height = 30;
    #canvas;
    #ctx;
    #width = 0;
    #height = 0;
    #corner_size = 10;
    #corner_list = [];
    #is_deformable = -1;
    #is_moveable = false;
    constructor(canvas,img) {
        this.#from_top=img.height/2;
        this.#canvas = canvas;
        this.#ctx = canvas.getContext("2d");
        this.#width = 200;
        this.#height = 50;
        let sx=30;
        let sy=80;
        this.#corner_list = [[sx,sy], [sx+this.#width, sy], 
        [sx+this.#width,sy+this.#height], [sx, sy+this.#height]];
        this.#img=img;
    }
    detect_corner(x, y) {
        for (let i = 0; i < 4; i++) {
            if (this.#is_in_cercle(this.#corner_list[i][0], this.#corner_list[i][1],this.#width/10, x, y)) {
                this.#is_deformable = i;
                this.#is_moveable = false;
                return this;
            }
        }
        this.#is_deformable = -1;
        return this; 
    }

    //cornerをすべてconsoleで表示する
    show_corner() {
        for (let i = 0; i < 4; i++) {
            console.log('p' + i);
            console.log(this.#corner_list[i][0], this.#corner_list[i][1]);
        }}

    #is_in_cercle(cx, cy, r, x, y) {
        return ((x-cx)**2 + (y-cy)**2 )<= (r ** 2);
    }
    #set_corner(x, y) {
        if(x<0||x>this.#canvas.width||y<0||y>this.#canvas.height)return;
        console.log(x,y);
        let i=this.#is_deformable;
    
        if (i == 0) {
            this.#width = this.#corner_list[2][0] - x;
            this.#height = this.#corner_list[2][1] - y;
            this.#corner_list[0][0] = x;
            this.#corner_list[0][1] = y;
            if(this.#width<this.#min_width){
                this.#width=this.#min_width;
                this.#corner_list[0][0]=this.#corner_list[2][0]-this.#min_width;
            }
            if(this.#height<this.#min_height){
                this.#height=this.#min_height;
                this.#corner_list[0][1]=this.#corner_list[2][1]-this.#min_height;
            }
            this.#corner_list[1] = [this.#corner_list[0][0] + this.#width, this.#corner_list[0][1]];
            this.#corner_list[3] = [this.#corner_list[0][0], this.#corner_list[0][1] + this.#height];
        }
        if (i == 1) {
            this.#width = x - this.#corner_list[3][0];
            this.#height = this.#corner_list[3][1] - y;
            this.#corner_list[1][0] = x;
            this.#corner_list[1][1] = y;
            if(this.#width<this.#min_width){
                this.#width=this.#min_width;
                this.#corner_list[1][0]=this.#corner_list[3][0]+this.#min_width;
            }
            if(this.#height<this.#min_height){
                this.#height=this.#min_height;
                this.#corner_list[1][1]=this.#corner_list[3][1]-this.#min_height;
            }
            this.#corner_list[0] = [this.#corner_list[1][0] - this.#width, this.#corner_list[1][1]];
            this.#corner_list[2] = [this.#corner_list[1][0], this.#corner_list[1][1] + this.#height];
            
           
        }
        
        if (i == 2) {
            this.#width = x - this.#corner_list[0][0];
            this.#height = y - this.#corner_list[0][1];
            this.#corner_list[2][0] = x;
            this.#corner_list[2][1] = y;
            if(this.#width<this.#min_width){
                this.#width=this.#min_width;
                this.#corner_list[2][0]=this.#corner_list[0][0]+this.#min_width;
            }
            if(this.#height<this.#min_height){
                this.#height=this.#min_height;
                this.#corner_list[2][1]=this.#corner_list[0][1]+this.#min_height;
            }
            this.#corner_list[1] = [this.#corner_list[2][0], this.#corner_list[2][1] - this.#height];
            this.#corner_list[3] = [this.#corner_list[2][0] - this.#width, this.#corner_list[2][1]];
        
        }
        if (i == 3) {
            this.#width = this.#corner_list[1][0] - x;
            this.#height = y - this.#corner_list[1][1];
            this.#corner_list[3][0] = x;
            this.#corner_list[3][1] = y;
            if(this.#width<this.#min_width){
                this.#width=this.#min_width;
                this.#corner_list[3][0]=this.#corner_list[1][0]-this.#min_width;
            }
            if(this.#height<this.#min_height){
                this.#height=this.#min_height;
                this.#corner_list[3][1]=this.#corner_list[1][1]+this.#min_height;
            }
            this.#corner_list[0] = [this.#corner_list[3][0], this.#corner_list[3][1] - this.#height];
            this.#corner_list[2] = [this.#corner_list[3][0] + this.#width, this.#corner_list[3][1]];
            
        }
    }
    get_cutCanvasData(){
        let cutcanvas=document.createElement('canvas');
        let cutctx=cutcanvas.getContext('2d');
        let cut_area=this.#cut_area();
        let sx=cut_area.sx;
        let sy=cut_area.sy;
        let width=cut_area.width;
        let height=cut_area.height;
        cutcanvas.width=width;
        cutcanvas.height=height;
        cutctx.drawImage(this.#img,sx,sy,width,height,0,0,width,height);
        return cutcanvas;
    }
    deform(x, y) {
        if(this.#is_deformable!=-1){
            this.#set_corner(x,y);
        }
    }
    draw() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#ctx.drawImage(this.#img, 0, this.#from_top, this.#img.width, this.#img.height/2, 0, 0, this.#canvas.width, this.#canvas.height);
        this.#ctx.beginPath();
        this.#ctx.moveTo(this.#corner_list[0][0], this.#corner_list[0][1] + this.#corner_size);
        this.#ctx.lineTo(this.#corner_list[0][0], this.#corner_list[0][1]);
        this.#ctx.lineTo(this.#corner_list[0][0] + this.#corner_size, this.#corner_list[0][1]);

        this.#ctx.moveTo(this.#corner_list[1][0] - this.#corner_size, this.#corner_list[1][1]);
        this.#ctx.lineTo(this.#corner_list[1][0], this.#corner_list[1][1]);
        this.#ctx.lineTo(this.#corner_list[1][0], this.#corner_list[1][1] + this.#corner_size);

        this.#ctx.moveTo(this.#corner_list[2][0], this.#corner_list[2][1] - this.#corner_size);
        this.#ctx.lineTo(this.#corner_list[2][0], this.#corner_list[2][1]);
        this.#ctx.lineTo(this.#corner_list[2][0] - this.#corner_size, this.#corner_list[2][1]);

        this.#ctx.moveTo(this.#corner_list[3][0] + this.#corner_size, this.#corner_list[3][1]);
        this.#ctx.lineTo(this.#corner_list[3][0], this.#corner_list[3][1]);
        this.#ctx.lineTo(this.#corner_list[3][0], this.#corner_list[3][1] - this.#corner_size);
        this.#ctx.lineWidth = 4;
        this.#ctx.strokeStyle = "rgb(64,224,208)";
        this.#ctx.stroke();
        console.log(this.#width,this.#height)
    }
    scroll(dy){
        this.#from_top-=dy;
        if(this.#from_top<0)this.#from_top=0;
        if(this.#from_top>this.#img.height/2)this.#from_top=this.#img.height/2;
    }
    detect_inner(x,y){
        let sp=this.sp;
        let is_inner=(sp[0]<(x+10) && (x-10)<sp[0]+this.#width && sp[1]<(y+10) && (y-10)<sp[1]+this.#height);
        console.log(is_inner);
         if(is_inner){
            this.#is_moveable=true;
         }
    };

move(dx,dy){
if(!this.#is_moveable){
    return;
}
this.#corner_list[0][0]+=dx;
this.#corner_list[0][1]+=dy;
this.#corner_list[1][0]+=dx;
this.#corner_list[1][1]+=dy;
this.#corner_list[2][0]+=dx;
this.#corner_list[2][1]+=dy;
this.#corner_list[3][0]+=dx;
this.#corner_list[3][1]+=dy;
//四隅がはみ出さないかチェック
if(this.#corner_list[0][0]<0){
    this.#corner_list[0][0]=0;
    this.#corner_list[1][0]=this.#width;
    this.#corner_list[2][0]=this.#width;
    this.#corner_list[3][0]=0;
    }
if(this.#corner_list[0][1]<0){
    this.#corner_list[0][1]=0;
    this.#corner_list[1][1]=0;
    this.#corner_list[2][1]=this.#height;
    this.#corner_list[3][1]=this.#height;
    }
if(this.#corner_list[2][0]>this.#canvas.width){
    this.#corner_list[0][0]=this.#canvas.width-this.#width;
    this.#corner_list[1][0]=this.#canvas.width;
    this.#corner_list[2][0]=this.#canvas.width;
    this.#corner_list[3][0]=this.#canvas.width-this.#width;
    }
if(this.#corner_list[2][1]>this.#canvas.height){
    this.#corner_list[0][1]=this.#canvas.height-this.#height;
    this.#corner_list[1][1]=this.#canvas.height-this.#height;
    this.#corner_list[2][1]=this.#canvas.height;
    this.#corner_list[3][1]=this.#canvas.height;
    }
}
get can_move() {
    return this.#is_moveable;
}
set can_move(value) {
    this.#is_moveable = value;
}

get can_deform() {
    return this.#is_deformable;
}
set can_deform(value) {
    this.#is_deformable = value;
}
get display_ratio(){
    let display_ratio = this.#img.width / this.#canvas.width;
    return display_ratio;
} 
get sp(){
    return this.#corner_list[0];
}
get width(){
    return this.#width;
}
get height(){
    return this.#height;
}
get img(){
    return this.#img;
}
#cut_area(){
    return {
        sx:this.#corner_list[0][0]*this.display_ratio,
        sy:this.#corner_list[0][1]*this.display_ratio+this.#from_top,
        width:this.#width*this.display_ratio,
        height:this.#height*this.display_ratio
    }
}

};

