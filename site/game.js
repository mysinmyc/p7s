
class GameState {
    constructor() {
        this.clock= new Clock();
        this.clock_view= new ClockView(this.clock);

        this.stage_ids = [];

        this.stage_start = new Date().getTime();
        this.current_stage_index = 0;

        this.last_scramble=[];
        this.scramble_to_execute=12;

        this._change_counter+=1;
    }

    scramble() {
      this.last_scramble=new MyScramble(this.clock,this.clock_view).execute(this.scramble_to_execute);
    }
    
    next_stage() {
        this._to_stage_index( (this.current_stage_index +1 )% this.stage_ids.length);
    }

    to_stage(stage_id) {
        let stage_idx = this.stage_ids.indexOf(stage_id);
        if (stage_idx > -1) {
            this._to_stage_index(stage_idx);
        }
    }

    _to_stage_index(stage_index) {
        this.stage_start = new Date().getTime();
        this.current_stage_index = stage_index;
    }

    get stage_timer_ms() {
        return new Date().getTime() - this.stage_start;
    }
    save() {
	    localStorage.setItem("clock", JSON.stringify(this.clock.serialize()));
    }
    load() {

    }

    change() {
        this._change_counter+=1;
        return this._change_counter;
    }

    get change_counter() {
        return this._change_counter;
    }
}

class GameStage {
    constructor(id,game) {
        this.id = id;
        this.game = game;
        this.clickacle_elements=undefined;
    }

    setup(drawing_context,game_state) {}

    draw(drawing_context, game_state, changed){}

    update(game_state) {}

    time_handler(game_state) {}
}

class WelcomeStage extends GameStage {

    constructor(game) {
        super("welcome",game);

    }
    setup(drawing_context,game_state)  {
        this.layoutter = new Layoutter(drawing_context);
        this.clock_drawer = new ClockDrawer(game_state.clock_view, drawing_context,this.layoutter);
        this._setup_clickable();        
    }

    _setup_clickable() {
        this.clickacle_elements = [ 
            new ClickableArea(new FullArea(), 
                (game_state,x,y)=>  game_state.next_stage()
                )
        ];
    }
    draw(drawing_context,game_state,changed) {
        if (!changed) {
            return;
        }

		let title_img = document.getElementById("asset_title");
		drawing_context.drawImage(title_img,this.layoutter.outer_clock_left,this.layoutter.outer_clock_size/4,this.layoutter.outer_clock_size,this.layoutter.outer_clock_size/2);

        this.clock_drawer.draw_stack_mat("Sei pronto?",0);
    }
}

class InspectionStage extends GameStage {

    constructor(game) {
        super("inspection",game);
    }

    setup(drawing_context,game_state)  {
        this.layoutter = new Layoutter(drawing_context);
        this.clock_drawer = new ClockDrawer(game_state.clock_view, drawing_context,this.layoutter);
        this._setup_clickable();        
    }

    _setup_clickable() {
        this.clickacle_elements=[

            //Clock
            new ClickableArea(new Rect( this.layoutter.outer_clock_left,0, this.layoutter.outer_clock_size,this.layoutter.outer_clock_size),
                (game_state,x,y)=>{ game_state.clock_view.flipX2()}
            ),

            //Stackmat
            new ClickableArea(new Rect((this.layoutter.width - this.layoutter.stackmat_width)/2, 
					this.layoutter.outer_clock_size + this.layoutter.margin,  
					this.layoutter.stackmat_width,
					this.layoutter.stackmat_height),
                (game_state,x,y)=>{ game_state.next_stage()}
            ),
        ];
    };

    draw(drawing_context,game_state,changed) {
        if (changed) {
            this.clock_drawer.draw_clock();
        }
        this.clock_drawer.draw_stack_mat("Ispezione", 15000- game_state.stage_timer_ms );
    }    

    time_handler(game_state) {
        if (game_state.stage_timer_ms > 15000) {
            game_state.next_stage();
        }
    }
}

class SolveStage extends GameStage {

    constructor(game) {
        super("solve",game);
    } 

    setup(drawing_context,game_state)  {
        this.layoutter = new Layoutter(drawing_context);
        this.clock_drawer = new ClockDrawer(game_state.clock_view, drawing_context,this.layoutter);
        this._setup_clickable();        
    }

    _setup_clickable() {
        
        this.clickacle_elements=[ 
            //Pin0
            new ClickableArea(new Circle( this.layoutter.outer_clock_left+this.layoutter.outer_clock_size / 3 ,this.layoutter.outer_clock_size / 3 ,this.layoutter.inner_clock_size/3),
                (game_state,x,y)=>{ game_state.clock_view.current_pins[0].invert()}
            ),
            //Pin1
            new ClickableArea(new Circle( this.layoutter.outer_clock_left+this.layoutter.outer_clock_size / 3 *2 ,this.layoutter.outer_clock_size / 3 ,this.layoutter.inner_clock_size/3),
                (game_state,x,y)=>{ game_state.clock_view.current_pins[1].invert()}
            ),
            //Pin2
            new ClickableArea(new Circle( this.layoutter.outer_clock_left+this.layoutter.outer_clock_size / 3 ,this.layoutter.outer_clock_size / 3 *2 ,this.layoutter.inner_clock_size/3),
                (game_state,x,y)=>{ game_state.clock_view.current_pins[2].invert()}
            ),
            //Pin3
            new ClickableArea(new Circle( this.layoutter.outer_clock_left+this.layoutter.outer_clock_size / 3 *2 ,this.layoutter.outer_clock_size / 3 *2 ,this.layoutter.inner_clock_size/3),
                (game_state,x,y)=>{ game_state.clock_view.current_pins[3].invert()}
            ),
            //gear UL
            new ClickableArea(new Rect( this.layoutter.outer_clock_left+this.layoutter.margin,this.layoutter.margin,this.layoutter.inner_clock_size,this.layoutter.inner_clock_size ),
                (game_state,x,y)=>{ game_state.clock_view.rotate_gear_UL(1)}
            ),         
            //gear UR
            new ClickableArea(new Rect( this.layoutter.outer_clock_left+this.layoutter.margin*2+ this.layoutter.outer_clock_size / 3*2 ,this.layoutter.margin,this.layoutter.inner_clock_size,this.layoutter.inner_clock_size ),
                (game_state,x,y)=>{ game_state.clock_view.rotate_gear_UR(1)}
            ),                           
            //gear DL
            new ClickableArea(new Rect( this.layoutter.outer_clock_left+this.layoutter.margin,this.layoutter.margin*2+this.layoutter.outer_clock_size / 3*2 ,this.layoutter.inner_clock_size,this.layoutter.inner_clock_size ),
                (game_state,x,y)=>{ game_state.clock_view.rotate_gear_DL(1)}
            ),         
            //gear DR
            new ClickableArea(new Rect( this.layoutter.outer_clock_left+this.layoutter.margin*2+this.layoutter.outer_clock_size / 3*2 ,this.layoutter.margin*2+this.layoutter.outer_clock_size / 3*2 ,this.layoutter.inner_clock_size,this.layoutter.inner_clock_size ),
                (game_state,x,y)=>{ game_state.clock_view.rotate_gear_DR(1)}
            ),  
            //gear U - flipX2               
            new ClickableArea(new Rect( this.layoutter.outer_clock_left+this.layoutter.margin*2+this.layoutter.outer_clock_size/3 ,this.layoutter.margin,this.layoutter.inner_clock_size,this.layoutter.inner_clock_size ),
                (game_state,x,y)=>{ game_state.clock_view.flipX2()}
            ),  

            //gear D - flipX2               
            new ClickableArea(new Rect( this.layoutter.outer_clock_left+this.layoutter.margin*2+this.layoutter.outer_clock_size/3 ,this.layoutter.margin*2+this.layoutter.outer_clock_size / 3*2,this.layoutter.inner_clock_size,this.layoutter.inner_clock_size ),
                (game_state,x,y)=>{ game_state.clock_view.flipX2()}
            ),  

            //gear L - flipY2               
            new ClickableArea(new Rect( this.layoutter.outer_clock_left+this.layoutter.margin,this.layoutter.margin*2+this.layoutter.outer_clock_size/3,this.layoutter.inner_clock_size,this.layoutter.inner_clock_size ),
                (game_state,x,y)=>{ game_state.clock_view.flipY2()}
            ),  

            //gear R - flipX2               
            new ClickableArea(new Rect( this.layoutter.outer_clock_left+this.layoutter.margin*2+this.layoutter.outer_clock_size/3*2,this.layoutter.margin*2+this.layoutter.outer_clock_size/3,this.layoutter.inner_clock_size,this.layoutter.inner_clock_size ),
                (game_state,x,y)=>{ game_state.clock_view.flipY2()}
            ),  

            //Stackmat
            new ClickableArea(new Rect((this.layoutter.width - this.layoutter.stackmat_width)/2, 
					this.layoutter.outer_clock_size + this.layoutter.margin,  
					this.layoutter.stackmat_width,
					this.layoutter.stackmat_height),
                (game_state,x,y)=>{ game_state.to_stage("lose")}
            ),            
        ];
    }    


    draw(drawing_context, game_state,changed) {
        if (changed) {
            this.clock_drawer.draw_clock();
        }

        this.clock_drawer.draw_stack_mat("Risoluzione", game_state.stage_timer_ms );
    }

    update(game_state) {
        if (game_state.clock.is_solved) {
            game_state.last_solve = this.game.stats_manager.add_solve(new Date().getTime(), game_state.stage_timer_ms, game_state.last_scramble);
            game_state.to_stage("won");
        } else {
            if (game_state.stage_timer_ms > 900000) {
                game_state.to_stage("lose");
            }
        }
    }
}

class WonStage extends GameStage {

    constructor(game) {
        super("won",game);
    }    

    setup(drawing_context,game_state)  {
        this.layoutter = new Layoutter(drawing_context);
        this.clock_drawer = new ClockDrawer(game_state.clock_view, drawing_context,this.layoutter);
        this._setup_clickable();        
    }

    _setup_clickable() {
        this.clickacle_elements=[

            //Clock
            new ClickableArea(new Rect( this.layoutter.outer_clock_left,0, this.layoutter.outer_clock_size,this.layoutter.outer_clock_size),
                (game_state,x,y)=>{ game_state.clock_view.flipX2()}
            ),

            //Stackmat
            new ClickableArea(new Rect((this.layoutter.width - this.layoutter.stackmat_width)/2, 
					this.layoutter.outer_clock_size + this.layoutter.margin,  
					this.layoutter.stackmat_width,
					this.layoutter.stackmat_height),
                (game_state,x,y)=>{  this.game.new_game()}
            ),

        ];
    };

    draw(drawing_context,game_state,changed) {

        if (!changed) {
            return;
        }
        this.clock_drawer.draw_clock();
        this.clock_drawer.draw_stack_mat( game_state.last_solve.ranking == 1 ?  "PR" : ""+game_state.last_solve.ranking + " tempo", game_state.last_solve.elasped_ms );

        if (game_state.last_solve.ranking==1) {
    		let title_img = document.getElementById("asset_coppa_oro");
		    drawing_context.drawImage(title_img,this.layoutter.outer_clock_left+this.layoutter.outer_clock_size/4,this.layoutter.outer_clock_size/4,this.layoutter.outer_clock_size/2,this.layoutter.outer_clock_size/2);
        } else if (game_state.last_solve.ranking<4) {
    		let title_img = document.getElementById("asset_coppa_grigia");
		    drawing_context.drawImage(title_img,this.layoutter.outer_clock_left+this.layoutter.outer_clock_size/4,this.layoutter.outer_clock_size/4,this.layoutter.outer_clock_size/2,this.layoutter.outer_clock_size/2);
        } else {
    		let title_img = document.getElementById("asset_medaglia");
		    drawing_context.drawImage(title_img,this.layoutter.outer_clock_left+this.layoutter.outer_clock_size/4,this.layoutter.outer_clock_size/4,this.layoutter.outer_clock_size/2,this.layoutter.outer_clock_size/2);
        }
    }
}

class LoseStage extends GameStage {

    constructor(game) {
        super("lose",game);
    }    

    setup(drawing_context,game_state)  {
        this.layoutter = new Layoutter(drawing_context);
        this.clock_drawer = new ClockDrawer(game_state.clock_view, drawing_context,this.layoutter);
        this._setup_clickable();        
    }

    _setup_clickable() {
        this.clickacle_elements=[

            //Clock
            new ClickableArea(new Rect( this.layoutter.outer_clock_left,0, this.layoutter.outer_clock_size,this.layoutter.outer_clock_size),
                (game_state,x,y)=>{ game_state.clock_view.flipX2()}
            ),

            //Stackmat
            new ClickableArea(new Rect((this.layoutter.width - this.layoutter.stackmat_width)/2, 
					this.layoutter.outer_clock_size + this.layoutter.margin,  
					this.layoutter.stackmat_width,
					this.layoutter.stackmat_height),
                (game_state,x,y)=>{ this.game.new_game()}
            ),
        ];
    };

    draw(drawing_context,game_state,changed) {
        this.clock_drawer.draw_clock();
        this.clock_drawer.draw_stack_mat( "Annullata",0 );
    }
}

class ClockGame {

    constructor(canvas) {
        this.canvas=canvas;
        this.drawing_context = canvas.getContext("2d");

        this.game_listeners = [];
        this.change_listeners = [];

        this.canvas.addEventListener("mousemove", (e) => this._on_mouse_move(e));
        this.canvas.addEventListener("click", (e) => this._on_mouse_up(e));
        
        this.processing=false;
        this._last_stage = -1;
        this._last_change_committed =0;

        let stats_manager = new StatsManager();
        stats_manager.init();
        this.stats_manager = stats_manager;
        this.state = new GameState();
        this.init_stages();

        setInterval(()=>this._loop(),197);
    }

    _loop() {
        if (!this.processing) {
            this.processing = true;
            let current_change = this.state.change_counter;
            try {
                if(current_change!=this._last_change_committed) {
                    this.change_listeners.forEach( l => l(this.state));
                }
                this.current_stage.time_handler(this.state);                
                this.draw(this._change_counter != this._last_change_committed);                
                this.current_stage.update(this.state);                
            } finally {
                this._last_change_committed = current_change;
                this.processing =false;
            }
        }
    }

    init_stages() {
        this.stages = [
            new WelcomeStage(this),
            new InspectionStage(this),
            new SolveStage(this),
            new WonStage(this),
            new LoseStage(this)
        ];

        this.state.stage_ids = this.stages.map ( (s) => s.id);
    }

    get current_stage() {
        let result=this.stages[this.state.current_stage_index];
        if (this.state.current_stage!= this._last_stage) {
            result.setup(this.drawing_context,this.state);
            this._last_stage = this.state.current_stage_index;
        }
        return result;
    }

    draw(changed) {
        if (changed) {
            this.drawing_context.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        }
		this.drawing_context.resetTransform();       
        this.drawing_context.translate(0,0) ;

        this.current_stage.draw(this.drawing_context,this.state,changed);
  
    }

    reset() {
        this.execute( (state)=>state.clock.reset());
    }

    new_game() {
        this._last_stage = -1;   
        this.execute( (state)=> { 
            state.scramble()
            state.to_stage("welcome");
        },true);
    }

    execute(f,force=false) {      
        this.state.change();              
        f(this.state);
    }
    
    addChangeListener(f) {
        this.change_listeners.push(f);
    }

    addGameListener(f) {
        this.game_listeners.push(f);
    }    

    resize() {
        this.execute((x)=>{
            this.current_stage.setup(this.drawing_context,this.state);
        });
    }

    _on_mouse_move(e) {
        var inside_an_element=false;
        let clickacle_elements=this.current_stage.clickacle_elements;
        if (clickacle_elements != undefined) {
            for (var cnt=0; cnt < clickacle_elements.length; cnt ++) {
                if (clickacle_elements[cnt].is_inside(e.offsetX,e.offsetY)) {
                    inside_an_element =true;
                }
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
        this.state.change();
        let clickacle_elements=this.current_stage.clickacle_elements;
        if (clickacle_elements != undefined) {
            this.execute( () => {
                for (var cnt=0; cnt < clickacle_elements.length; cnt ++) {
                    if (clickacle_elements[cnt].is_inside(e.offsetX,e.offsetY)) {
                        this.execute( (s) =>
                            clickacle_elements[cnt].execute_handler(s,e.offsetX,e.offsetY)
                        );
                        break;
                    }
                }

            });
        }
        e.preventDefault();
    }


}
