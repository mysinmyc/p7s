

const GameStatus = {
    Welcome: 0,
    Playing: 1,
    Won: 2,
    Lose: 3
}


class ClockGame {

    constructor(canvas) {
        this.clock= new Clock();
        this.clock_view= new ClockView(this.clock);
        this.canvas=canvas;
        this.ctx = canvas.getContext("2d");
        this.clock_drawer = new ClockDrawer(this.clock_view,this.ctx);

        this.game_listeners = [];

        this.change_listeners = [];

        this.canvas.addEventListener("mousemove", (e) => this._on_mouse_move(e));
        this.canvas.addEventListener("click", (e) => this._on_mouse_up(e));
        this.canvas.addEventListener("touchstart", (e) => e.preventDefault());
        
        this.game_status = GameStatus.Welcome;
        this.drawn=false;
        this.last_scramble=[];
        this.scramble_to_execute=12;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        this.clock_drawer.draw();
        this._setup_clickable();
        this.drawn=true;
    }

    reset() {
        this.last_scramble=[];
        this._set_game_status(GameStatus.Playing);
        this.execute( (clock,clock_view)=>clock.reset());
    }

    new_game() {
        this._set_game_status(GameStatus.Playing);
        this.execute( (clock,clock_view)=>this.scramble(),true);
    }

    scramble() {
      this.last_scramble=new MyScramble(this.clock,this.clock_view).execute(this.scramble_to_execute);
    }

    start() {
        this._set_game_status(GameStatus.Playing);
        this.draw();
    }

    execute(f,force=false) {
        
        if (! force){
            if (!this.game_status == GameStatus.Playing) {
                return;
            }
        }

        f(this.clock,this.clock_view);
        this.change_listeners.forEach( l => l(this.clock,this.clock_view));
        if (this.drawn) {
            this.draw();
        }

        if (this.game_status == GameStatus.Playing && this.clock.is_solved) {
            this._set_game_status(GameStatus.Won);
        }
    }
    
    addChangeListener(f) {
        this.change_listeners.push(f);
    }

    addGameListener(f) {
        this.game_listeners.push(f);
    }    

    _set_game_status(new_status) {
        if (new_status != this.game_status) {
            let old_status=this.game_status;
            this.game_status = new_status;
            this.game_listeners.forEach( l => l(new_status,old_status));
        }
    }

    _setup_clickable() {
        if ( this.clickacle_elements == undefined) {
            this.clickacle_elements=[ 
                //Pin0
                new ClickableArea(new Area( this.clock_drawer.outer_clock_size / 3 + this.clock_drawer.outer_clock_margin - 40,this.clock_drawer.outer_clock_size / 3 + this.clock_drawer.outer_clock_margin - 40,80,80 ),
                    ()=>{ this.clock_view.current_pins[0].invert()}
                ),
                //Pin1
                new ClickableArea(new Area( this.clock_drawer.outer_clock_size / 3*2 + this.clock_drawer.outer_clock_margin - 40,this.clock_drawer.outer_clock_size / 3 + this.clock_drawer.outer_clock_margin - 40,80,80 ),
                    ()=>{ this.clock_view.current_pins[1].invert()}
                ),
                //Pin2
                new ClickableArea(new Area( this.clock_drawer.outer_clock_size / 3 + this.clock_drawer.outer_clock_margin - 40,this.clock_drawer.outer_clock_size / 3*2 + this.clock_drawer.outer_clock_margin - 40,80,80 ),
                    ()=>{ this.clock_view.current_pins[2].invert()}
                ),
                //Pin3
                new ClickableArea(new Area( this.clock_drawer.outer_clock_size / 3*2 + this.clock_drawer.outer_clock_margin - 40,this.clock_drawer.outer_clock_size / 3*2 + this.clock_drawer.outer_clock_margin - 40,80,80 ),
                    ()=>{ this.clock_view.current_pins[3].invert()}
                ),
                //gear UL
                new ClickableArea(new Area( this.clock_drawer.outer_clock_margin,this.clock_drawer.outer_clock_margin,this.clock_drawer.inner_clock_size,this.clock_drawer.inner_clock_size ),
                    ()=>{ this.clock_view.rotate_gear_UL(1)}
                ),         
                //gear UR
                new ClickableArea(new Area( this.clock_drawer.outer_clock_margin*2+ this.clock_drawer.outer_clock_size / 3*2 ,this.clock_drawer.outer_clock_margin,this.clock_drawer.inner_clock_size,this.clock_drawer.inner_clock_size ),
                    ()=>{ this.clock_view.rotate_gear_UR(1)}
                ),                           
                //gear DL
                new ClickableArea(new Area( this.clock_drawer.outer_clock_margin,this.clock_drawer.outer_clock_margin*2+this.clock_drawer.outer_clock_size / 3*2 ,this.clock_drawer.inner_clock_size,this.clock_drawer.inner_clock_size ),
                    ()=>{ this.clock_view.rotate_gear_DL(1)}
                ),         
                //gear DR
                new ClickableArea(new Area( this.clock_drawer.outer_clock_margin*2+this.clock_drawer.outer_clock_size / 3*2 ,this.clock_drawer.outer_clock_margin*2+this.clock_drawer.outer_clock_size / 3*2 ,this.clock_drawer.inner_clock_size,this.clock_drawer.inner_clock_size ),
                    ()=>{ this.clock_view.rotate_gear_DR(1)}
                ),  
                //gear U - flipX2               
                new ClickableArea(new Area( this.clock_drawer.outer_clock_margin*2+this.clock_drawer.outer_clock_size/3 ,this.clock_drawer.outer_clock_margin,this.clock_drawer.inner_clock_size,this.clock_drawer.inner_clock_size ),
                    ()=>{ this.clock_view.flipX2()}
                ),  

                //gear D - flipX2               
                new ClickableArea(new Area( this.clock_drawer.outer_clock_margin*2+this.clock_drawer.outer_clock_size/3 ,this.clock_drawer.outer_clock_margin*2+this.clock_drawer.outer_clock_size / 3*2,this.clock_drawer.inner_clock_size,this.clock_drawer.inner_clock_size ),
                    ()=>{ this.clock_view.flipX2()}
                ),  

                //gear L - flipY2               
                new ClickableArea(new Area( this.clock_drawer.outer_clock_margin,this.clock_drawer.outer_clock_margin*2+this.clock_drawer.outer_clock_size/3,this.clock_drawer.inner_clock_size,this.clock_drawer.inner_clock_size ),
                    ()=>{ this.clock_view.flipY2()}
                ),  

                //gear R - flipX2               
                new ClickableArea(new Area( this.clock_drawer.outer_clock_margin*2+this.clock_drawer.outer_clock_size/3*2,this.clock_drawer.outer_clock_margin*2+this.clock_drawer.outer_clock_size/3,this.clock_drawer.inner_clock_size,this.clock_drawer.inner_clock_size ),
                    ()=>{ this.clock_view.flipY2()}
                ),  
            ];
        }
    }

    _on_mouse_move(e) {
        
        var inside_an_element=false;
        for (var cnt=0; cnt < this.clickacle_elements.length; cnt ++) {
            if (this.clickacle_elements[cnt].is_inside(e.offsetX,e.offsetY)) {
                inside_an_element =true;
            }
        }
        if (inside_an_element) {
            this.canvas.style.cursor = "pointer";
        } else {
            this.canvas.style.cursor = "default";
        }
        e.preventDefault();
        
    }

    _on_mouse_up(e) {

        this.execute( () => {
            for (var cnt=0; cnt < this.clickacle_elements.length; cnt ++) {
                if (this.clickacle_elements[cnt].is_inside(e.offsetX,e.offsetY)) {
                    this.clickacle_elements[cnt].execute_handler();
                    break;
                }
            }

        });
        e.preventDefault();
    }


}
