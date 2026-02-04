		
		const COLOR_SCHEME_ATTRIBUTE="data-color_scheme";

		const COLOR_SCHEMES = {
			black: {
				side_a_outer_clock: "#dfdfdf",
				side_a_inner_clock: "#313131",				
				side_a_inner_clock_border: "#aeaeae",				
				side_a_dial: "#a1a1a1",				
				side_a_pin_up:"#313131",
				side_b_outer_clock: "#161616",
				side_b_inner_clock: "#aeaeae",				
				side_b_inner_clock_border: "#313131",				
				side_b_dial: "#171717",
				side_b_pin_up:"#a3a3a3" 
			},
			blue: {
				side_a_outer_clock: "#cfcbc8",
				side_a_inner_clock: "#225aa4",
				side_a_inner_clock_border: "#cfcbc8",
				side_a_dial: "#c4c3c8",
				side_a_pin_up: "#1d6ac0",
				side_b_outer_clock: "#1c5ba8",				
				side_b_inner_clock: "#cecac7",
				side_b_inner_clock_border: "#1d61af",		
				side_b_dial: "#226db1",		
				side_b_pin_up: "#e3d9cf"
			},
			pink: {
				side_a_outer_clock: "#eef3f6",
				side_a_inner_clock: "#f6ced6",								
				side_a_inner_clock_border: "#eef3f6",		
				side_a_dial: "#d5b5b8",
				side_a_pin_up:"#f98ca4",
				side_b_outer_clock: "#f6ced6",				
				side_b_inner_clock: "#eef3f6",
				side_b_inner_clock_border: "#f6ced6",
				side_b_dial: "#eb8c9f",		
				side_b_pin_up:"#e2d7d5"				
			}
		}
		
		class Rect {
			constructor(x,y,width,height) {
				this.startX=x;
				this.startY=y;
				this.width=width;
				this.height=height;
				this.endX=x+width;
				this.endY=y+height;
			}

			is_inside(x,y) {
				return x>= this.startX && x<= this.endX && y >= this.startY && y <= this.endY;
			}

			draw(drawing_context) {
				drawing_context.beginPath();
				drawing_context.rect(this.startX,this.startY,this.width,this.height);
				drawing_context.stroke();
			}
		}

		class Circle {
			constructor(centerX,centerY,radious) {
				this.centerX=centerX;
				this.centerY=centerY;
				this.radious=radious;
			}

			is_inside(x,y) {
				let distanzaX=Math.abs(x-this.centerX);
				let distanzaY=Math.abs(y-this.centerY);
				if (distanzaX>this.radious || distanzaY > this.radious) {
					return false;
				}
				return (distanzaX*distanzaX +  distanzaY^distanzaY)<= (this.radious*this.radious);
			}

			draw(drawing_context) {
				drawing_context.beginPath();
				drawing_context.arc(this.centerX,this.centerY,10,0,Math.PI*2);
				drawing_context.stroke();
				drawing_context.beginPath();
				drawing_context.arc(this.centerX,this.centerY,this.radious,0,Math.PI*2);
				drawing_context.stroke();
			}
		}

		class Layoutter {

			constructor(drawing_context) {
				this.drawing_context = drawing_context;
				this.calculate();
			}
			
			calculate() {
				this.width=this.drawing_context.canvas.clientWidth;
				this.height= this.drawing_context.canvas.clientHeight;

				if (this.width>this.height) {
					this.outer_clock_size = Math.round(this.height-200);
					this.stackmat_width=Math.round( this.outer_clock_size);
					this.stackmat_height=Math.round(this.stackmat_width / 5);
					this.outer_clock_size = this.height-this.stackmat_height-200;
					this.outer_clock_top=150;
					this.stackmat_top=this.outer_clock_top+this.outer_clock_size+30;					
				} else {
					this.outer_clock_size = this.width-100;
					this.stackmat_width=Math.round( this.width * 0.8);
					this.stackmat_height=Math.round(this.stackmat_width / 5);
					this.outer_clock_top=(this.height - this.stackmat_height - this.outer_clock_size)/2;
					this.stackmat_top=this.height-(this.height - this.stackmat_height - this.outer_clock_size)/2;
				}
				
				
				this.outer_clock_left=(this.width-this.outer_clock_size)/2;
				this.inner_clock_margin=20;
				this.inner_clock_size = this.outer_clock_size  /3 - this.inner_clock_margin *2;
				this.clock_border=Math.round(this.inner_clock_size/15);
				this.pin_size = this.inner_clock_size / 6;
			}
		}
		
		class ClockDrawer {

			constructor(clock_view,drawing_context,layoutter) {
				this.clock_view = clock_view;
				this.layoutter = layoutter;
                this.drawing_context = drawing_context;
				this.show_values=false;
				this.color_scheme = COLOR_SCHEMES[drawing_context.canvas.getAttribute(COLOR_SCHEME_ATTRIBUTE)]
			}

            get is_reverse_color() {
                return ! this.clock_view.is_current_side_a;
            }

            get is_rotated180 () {
                return this.clock_view.is_rotated180;
            }

			draw_outer_clock() {
				this.drawing_context.beginPath();
				this.drawing_context.arc(this.layoutter.outer_clock_left+this.layoutter.outer_clock_size/2,this.layoutter.outer_clock_top+this.layoutter.outer_clock_size/2, this.layoutter.outer_clock_size/2,0, 2* Math.PI);
				this.drawing_context.fillStyle = this.is_reverse_color ? this.color_scheme.side_b_outer_clock:this.color_scheme.side_a_outer_clock;
				this.drawing_context.fill();
			}

			draw_pins() {
				const pins =this.clock_view.current_pins;
				for (var cnt =0 ; cnt < 4 ; cnt++) {
					this.drawing_context.beginPath();
					this.drawing_context.arc(this.layoutter.outer_clock_left+(this.layoutter.outer_clock_size / 3)*(cnt%2+1),this.layoutter.outer_clock_top+this.layoutter.outer_clock_size/3*(Math.trunc(cnt/2)+1), this.layoutter.pin_size/2, 0 , 2 * Math.PI);
					if (pins[cnt].is_up) {
						this.drawing_context.fillStyle= this.is_reverse_color ? this.color_scheme.side_b_pin_up :  this.color_scheme.side_a_pin_up;
						this.drawing_context.fill();
					} else {
						this.drawing_context.strokeStyle = this.is_reverse_color ? this.color_scheme.side_b_pin_up: this.color_scheme.side_a_pin_up;
						this.drawing_context.stroke();
					}
					

					if (this.show_values) {
						this.drawing_context.font="40px Arial";
						this.drawing_context.fontStyle="bold";
						this.drawing_context.fillStyle="#faebc1";
						this.drawing_context.beginPath();
						this.drawing_context.fillText(pins[cnt].id, this.layoutter.outer_clock_left + this.layoutter.outer_clock_size / 3*(cnt%2+1)-10, this.layoutter.outer_clock_top+this.layoutter.inner_clock_margin+this.layoutter.outer_clock_size/3*(Math.trunc(cnt/2)+1)+10, 20);					
					}
				}
			}	

			draw_single_clock(width) {

				this.drawing_context.beginPath();
				this.drawing_context.arc(0,0,width / 2, 0 , 2 * Math.PI);
				this.drawing_context.fillStyle=this.is_reverse_color ? this.color_scheme.side_b_inner_clock_border: this.color_scheme.side_a_inner_clock_border;
				this.drawing_context.fill();

		
				this.drawing_context.beginPath();
				this.drawing_context.arc(0,0,width / 2-this.layoutter.clock_border, 0 , 2 * Math.PI);
				this.drawing_context.fillStyle=this.is_reverse_color ? this.color_scheme.side_b_inner_clock: this.color_scheme.side_a_inner_clock;
				this.drawing_context.fill();
				 
				for (let h = 0; h < 12; h++) {
                    if ((this.is_rotated180 && h==6) || ((!this.is_rotated180)&& h==0 )) {
                        this.drawing_context.fillStyle="#ab2e2d";
                    } else {
                        this.drawing_context.fillStyle=this.is_reverse_color ? "#979797": "#202020";
                    }
                    
					let point_radious= h%3 ==0 ?  this.layoutter.clock_border*0.3:   this.layoutter.clock_border*0.1;
                    this.drawing_context.beginPath();
					this.drawing_context.arc(0,-width / 2+ this.layoutter.clock_border/2, point_radious, 0 , 2 * Math.PI);
					this.drawing_context.fill();
					this.drawing_context.rotate( Math.PI/6 );                    
				}
			}

			draw_hour(hour,width) {
				this.drawing_context.beginPath();
				this.drawing_context.lineWidth = 3;
				this.drawing_context.lineCap = "round";
				this.drawing_context.strokeStyle=this.is_reverse_color ? this.color_scheme.side_b_dial: this.color_scheme.side_a_dial;
				this.drawing_context.rotate( Math.PI/6*hour);
				this.drawing_context.moveTo(0,0);
				this.drawing_context.lineTo(0,-width/2+this.layoutter.clock_border+5);
				this.drawing_context.stroke();
			}

			draw_clock() {
                this.drawing_context.reset();
				this.draw_outer_clock();
				this.draw_pins();
				
								
                const inner_clocks = this.clock_view.current_inner_clocks;
				for ( let cnt =0 ; cnt < 9 ; cnt ++) {
					const value = inner_clocks[cnt].value;
					const outer_size=this.layoutter.outer_clock_size/3;
					const centerX=(cnt%3)*outer_size+outer_size/2+this.layoutter.outer_clock_left;
					const centerY=this.layoutter.outer_clock_top+Math.trunc(cnt/3)*outer_size+outer_size/2;

                    
                    this.drawing_context.resetTransform();
                    
                    this.drawing_context.translate(centerX,centerY);
					this.draw_single_clock(this.layoutter.inner_clock_size,this.is_reverse_color);
					
					this.drawing_context.resetTransform();

					this.drawing_context.translate(centerX,centerY);
					this.draw_hour(value,this.layoutter.inner_clock_size,this.is_reverse_color);

					this.drawing_context.resetTransform();

					if (this.show_values) {	
						this.drawing_context.beginPath();
						this.drawing_context.moveTo(centerX,centerY-this.layoutter.inner_clock_size/2-20);	
						this.drawing_context.font="40px Arial";
						this.drawing_context.fontStyle="bold";
						this.drawing_context.fillStyle="#faebc1";
						this.drawing_context.fillText(roundHourDistance(value), centerX-this.layoutter.inner_clock_size/2+40, centerY-20, this.layoutter.inner_clock_size -40);
						this.drawing_context.beginPath();
						this.drawing_context.fillText(hour2Letter(value), centerX+10, centerY+40, this.layoutter.inner_clock_size -40);
						this.drawing_context.fillStyle="blue";
						this.drawing_context.beginPath();
						this.drawing_context.fillText( inner_clocks[cnt].id, centerX+10, centerY-20, this.layoutter.inner_clock_size -40);
					}
					
					this.drawing_context.resetTransform();
				}
			}

			draw_stack_mat(description,value) {

				let img_stackmat = document.getElementById("asset_stackmat");
				this.drawing_context.drawImage( img_stackmat,
					(this.layoutter.width - this.layoutter.stackmat_width)/2, 
					this.layoutter.stackmat_top,  
					this.layoutter.stackmat_width,
					this.layoutter.stackmat_height);

				this.stack_mat_text(description,value);
			}

			stack_mat_text(description,value) {

				let str_value=format_timer_ms(value);

				
				this.drawing_context.font="18px Arial";					
				this.drawing_context.fillStyle ="white";					

				this.drawing_context.fillText(description, (this.layoutter.width - this.layoutter.stackmat_width)/2+this.layoutter.stackmat_width*0.36, 
					this.layoutter.stackmat_top + this.layoutter.stackmat_height *0.35,  
					this.layoutter.stackmat_width/5,
					);

				this.drawing_context.font="30px Arial";					
				this.drawing_context.fillStyle =  "white";
				this.drawing_context.fillText(str_value, (this.layoutter.width - this.layoutter.stackmat_width)/2+this.layoutter.stackmat_width*0.4, 
					this.layoutter.stackmat_top + this.layoutter.stackmat_height * 0.73,  
					this.layoutter.stackmat_width/5,
					);

			}
		}	



		class FullArea {
			is_inside(x,y) {
				return true;
			}

			draw(drawing_context) {
				drawing_context.beginPath();
				drawing_context.moveTo(0,0);
				drawing_context.lineTo(drawing_context.canvas.width,drawing_context.canvas.height);
				drawing_context.moveTo(0,drawing_context.canvas.height);
				drawing_context.lineTo(drawing_context.canvas.width,0);
				drawing_context.stroke();
			}
		}
		
		class ClickableArea {
			constructor (area, handler) {
				this.area = area;
				this.handler = handler;
			}

			is_inside(x,y) {
				return this.area.is_inside(x,y);
			}

			execute_handler(x,y) {
				this.handler(x,y);
			}
		}

