
		class ClockDrawer {

			constructor(clock_view,ctx) {
				this.clock_view = clock_view;
                this.ctx = ctx;
				this.outer_clock_margin=20;
				this.show_values=false;
			}

			get outer_clock_size() {
				let width=this.ctx.canvas.clientWidth;
				let height= this.ctx.canvas.clientHeight;
								
				return  (width > height ? height : width) - this.outer_clock_margin*2;
			}

			get inner_clock_size() {
				return this.outer_clock_size/3-this.outer_clock_margin*2;
			}

            get is_reverse_color() {
                return ! this.clock_view.is_current_side_a;
            }

            get is_rotated180 () {
                return this.clock_view.is_rotated180;
            }

			draw_outer_clock(size,margin) {
				this.ctx.beginPath();
				this.ctx.arc(size/2 + margin,size/2+margin, size/2,0, 2* Math.PI);
				this.ctx.fillStyle = this.is_reverse_color ? "#161616" : "#a3a3a3";
				this.ctx.fill();
			}

			draw_single_clock(width) {

				this.ctx.beginPath();
				this.ctx.arc(0,0,width / 2, 0 , 2 * Math.PI);
				this.ctx.fillStyle=this.is_reverse_color ? "#313131": "#aeaeae";
				this.ctx.fill();

		
				this.ctx.beginPath();
				this.ctx.arc(0,0,width / 2-15, 0 , 2 * Math.PI);
				this.ctx.fillStyle=this.is_reverse_color ? "#aeaeae": "#313131";
				this.ctx.fill();
				 
				for (let h = 0; h < 12; h++) {
                    if ((this.is_rotated180 && h==6) || ((!this.is_rotated180)&& h==0 )) {
                        this.ctx.fillStyle="#ab2e2d";
                    } else {
                        this.ctx.fillStyle=this.is_reverse_color ? "#979797": "#202020";
                    }
                     
                    this.ctx.beginPath();
					this.ctx.arc(0,width / 2* -1 + 7, h%3 ==0 ?  5: 2,0 , 2 * Math.PI);
					this.ctx.fill();
					this.ctx.rotate( Math.PI/6 );                    
				}
			}

			draw_hour(hour,width) {
				this.ctx.beginPath();
				this.ctx.lineWidth = 5;
				this.ctx.lineCap = "round";
				this.ctx.strokeStyle=this.is_reverse_color ? "#171717": "#a1a1a1";
				this.ctx.rotate( Math.PI/6*hour);
				this.ctx.moveTo(0,0);
				this.ctx.lineTo(0,width/2*-1+20);
				this.ctx.stroke();
			}

			draw() {
                this.ctx.reset();
				this.draw_outer_clock(this.outer_clock_size,this.outer_clock_margin,this.is_reverse_color);
								
                const pins =this.clock_view.current_pins;
				for (var cnt =0 ; cnt < 4 ; cnt++) {
					this.ctx.beginPath();
					this.ctx.arc(this.outer_clock_margin+(this.outer_clock_size / 3)*(cnt%2+1),this.outer_clock_margin+this.outer_clock_size/3*(Math.trunc(cnt/2)+1), 15, 0 , 2 * Math.PI);
					if (pins[cnt].is_up) {
						this.ctx.fillStyle= this.is_reverse_color ? "#aeaeae" : "#161616";
						this.ctx.fill();
					} else {
						this.ctx.strokeStyle = this.is_reverse_color ? "#a3a3a3":"#313131" ;
						this.ctx.stroke();
					}
					

					if (this.show_values) {
						this.ctx.font="40px Arial";
						this.ctx.fontStyle="bold";
						this.ctx.fillStyle="#faebc1";
						this.ctx.beginPath();
						this.ctx.fillText(pins[cnt].id, this.outer_clock_margin+(this.outer_clock_size / 3)*(cnt%2+1)-10, this.outer_clock_margin+this.outer_clock_size/3*(Math.trunc(cnt/2)+1)+10, 20);					
					}
				}

                const inner_clocks = this.clock_view.current_inner_clocks;
				for ( let cnt =0 ; cnt < 9 ; cnt ++) {
					const value = inner_clocks[cnt].value;
					const outer_size=this.outer_clock_size/3;
					const centerX=this.outer_clock_margin+(cnt%3)*outer_size+outer_size/2;
					const centerY=this.outer_clock_margin+Math.trunc(cnt/3)*outer_size+outer_size/2;

                    
                    this.ctx.resetTransform();
                    
                    this.ctx.translate(centerX,centerY);
					this.draw_single_clock(this.inner_clock_size,this.is_reverse_color);
					
					this.ctx.resetTransform();

					this.ctx.translate(centerX,centerY);
					this.draw_hour(value,this.inner_clock_size,this.is_reverse_color);

					this.ctx.resetTransform();

					if (this.show_values) {	
						this.ctx.beginPath();
						this.ctx.moveTo(centerX,centerY-this.inner_clock_size/2-20);	
						this.ctx.font="40px Arial";
						this.ctx.fontStyle="bold";
						this.ctx.fillStyle="#faebc1";
						this.ctx.fillText(roundHourDistance(value), centerX-this.inner_clock_size/2+40, centerY-20, this.inner_clock_size -40);
						this.ctx.beginPath();
						this.ctx.fillText(hour2Letter(value), centerX+10, centerY+40, this.inner_clock_size -40);
						this.ctx.fillStyle="blue";
						this.ctx.beginPath();
						this.ctx.fillText( inner_clocks[cnt].id, centerX+10, centerY-20, this.inner_clock_size -40);
					}
					
					this.ctx.resetTransform();
				}
			}


		}	



		class Area {

			constructor(x,y,width,height) {
				this.startX=x;
				this.startY=y;
				this.endX=x+width;
				this.endY=y+height;
			}

			is_inside(x,y) {
				return x>= this.startX && x<= this.endX && y >= this.startY && y <= this.endY;
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

			execute_handler() {
				this.handler();
			}
		}
