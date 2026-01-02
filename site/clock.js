
		function roundHourDistance(value) {
			var valueH = value % 12;
			if (valueH > 6 ) {
				return valueH-12;
			} 
			if (valueH < -5) {
				return 12 + valueH;
			} 

			return valueH;
			
		}

		function moveHourTo(from,to) {
			return roundHourDistance(to - from);
		}

		function hour2Letter(hour) {
			var letters="OABCDEFGHIJK";
			if (hour >= 0) {
				return letters.charAt(hour%12);
			} else {
				return letters.charAt( 12 + ( hour%12));
			}
		}

		function array2Letters(input) {
			var result=[];
			for (var cnt=0;cnt< input.length;cnt++) {
				result.push(hour2Letter(input[cnt]));
			}
			return result;
		}		

		function compute7SimulBPaul(face_a, face_b) {

			const A = {
				U: face_a[1], L: face_a[3], R: face_a[5], D: face_a[7], 
				C: face_a[4],
				UL: face_a[0], UR: face_a[2], DL: face_a[6], DR: face_a[8]
			};
			const B = {
				U: face_b[7], L: face_b[5], R: face_b[3], D: face_b[1], 
				C: face_b[4],
				UL: face_b[8], UR: face_b[6], DL: face_b[2], DR: face_b[0]
			};

			const m1 = roundHourDistance(moveHourTo(A.R,A.D) + moveHourTo(B.L,B.UL));
			const m2 = moveHourTo(B.U,B.C);
			const m3 = moveHourTo(B.L,B.U);
			const m4 = roundHourDistance(moveHourTo(B.R,B.D) + moveHourTo(A.L,A.UL));
			const m5 = moveHourTo(A.U,A.C);
			const m6 = moveHourTo(A.L,A.U);

			return [m1, m2, m3, m4, m5, m6 ];
		}

		class Clock {
			constructor() {
				this.reset();
			}

			reset() {
				this.face_a=[0,0,0,0,0,0,0,0,0]
				this.face_b=[0,0,0,0,0,0,0,0,0]
				this.pins_a=[true,false,true,true]
			}

			get_pins_b(){
				return [!this.pins_a[1],!this.pins_a[0],!this.pins_a[3],!this.pins_a[2]];
			}
			
			scramble() {
				for (let cnt=0; cnt <9;cnt++) { 
					this.face_a[cnt] =Math.floor(Math.random()*11);
					this.face_b[cnt] =Math.floor(Math.random()*11);
				}
			}
		}

		class ClockDrawer {
			constructor(clock) {
				this.clock = clock;
			}

			draw_outer_clock(ctx,size,margin, reverse_color) {
				ctx.beginPath();
				ctx.arc(size/2 + margin,size/2+margin, size/2,0, 2* Math.PI);
				ctx.fillStyle = reverse_color ? "#161616" : "#a3a3a3";
				ctx.fill();
			}

			draw_single_clock(ctx,width,reverse_color) {

				ctx.beginPath();
				ctx.arc(0,0,width / 2, 0 , 2 * Math.PI);
				ctx.fillStyle=reverse_color ? "#313131": "#aeaeae";
				ctx.fill();

		
				ctx.beginPath();
				ctx.arc(0,0,width / 2-15, 0 , 2 * Math.PI);
				ctx.fillStyle=reverse_color ? "#aeaeae": "#313131";
				ctx.fill();
				
				ctx.beginPath();
				ctx.arc(0,width / 2*-1 + 7,5,0 , 2 * Math.PI);
				ctx.fillStyle="#ab2e2d";
				ctx.fill();

				for (let h = 1; h < 12; h++) {
					ctx.beginPath();
					ctx.rotate( Math.PI/6 );
					ctx.arc(0,width / 2* -1 + 7, h%3 ==0 ?  5: 2,0 , 2 * Math.PI);
					ctx.fillStyle=reverse_color ? "#979797": "#202020";
					ctx.fill();
				}
			}

			draw_hour(ctx,hour,width,reverse_color) {
				ctx.beginPath();
				ctx.lineWidth = 5;
				ctx.lineCap = "round";
				ctx.strokeStyle=reverse_color ? "#171717": "#a1a1a1";
				ctx.rotate( Math.PI/6*hour);
				ctx.moveTo(0,0);
				ctx.lineTo(0,width/2*-1+20);
				ctx.stroke();
			}

			draw(ctx,state,pins,width,height,reverse_color,rotate_clock,show_values) {
				ctx.reset();
				const outer_clock_margin=20;
				const clock_margin=10;
				const outer_clock_size= (width > height ? height : width) - outer_clock_margin*2;

				const clock_width=outer_clock_size/3-outer_clock_margin*2;

				if (rotate_clock) {
					ctx.translate(width,height);
					ctx.rotate(Math.PI);
				}

				this.draw_outer_clock(ctx,outer_clock_size,outer_clock_margin,reverse_color);
								
				for (var cnt =0 ; cnt < 4 ; cnt++) {
					ctx.beginPath();
					ctx.arc(outer_clock_margin+(outer_clock_size / 3)*(cnt%2+1),outer_clock_margin+outer_clock_size/3*(Math.trunc(cnt/2)+1), 15, 0 , 2 * Math.PI);
					if (reverse_color) {
						ctx.fillStyle= pins[cnt] ? "#aeaeae" : "#161616";
					} else {
						ctx.fillStyle= pins[cnt] ? "#313131" : "#a3a3a3";
					}
					ctx.fill();					
				}


				for ( let cnt =0 ; cnt < 9 ; cnt ++) {
					let value =  state[cnt];
					const outer_size=outer_clock_size/3;
					const centerX=outer_clock_margin+(cnt%3)*outer_size+outer_size/2;
					const centerY=outer_clock_margin+Math.trunc(cnt/3)*outer_size+outer_size/2;
					
					ctx.resetTransform();
					if (rotate_clock) {
						ctx.translate(width,height);
                        ctx.rotate(Math.PI);
					}
					
					ctx.translate(centerX,centerY);
					this.draw_single_clock(ctx,clock_width,reverse_color);
					
					ctx.resetTransform();
					if (rotate_clock) {
						ctx.translate(width,height);
                        ctx.rotate(Math.PI);
					}

					ctx.translate(centerX,centerY);
					this.draw_hour(ctx,value,clock_width,reverse_color);

					ctx.resetTransform();
					if (rotate_clock) {
						ctx.translate(width,height);
                                		ctx.rotate(Math.PI);
					}	

					if (show_values) {	
						ctx.beginPath();
						ctx.moveTo(centerX,centerY-width/2-20);	
						ctx.font="40px Arial";
						ctx.fontStyle="bold";
						ctx.fillStyle="#faebc1";
						ctx.fillText(roundHourDistance(value), centerX-clock_width/2+40, centerY-20, width -40);
						ctx.beginPath();
						ctx.fillText(hour2Letter(value), centerX+10, centerY+40, width -40);
					}
					
					ctx.resetTransform();
				}
			}

			draw_face_a(ctx,width,height,show_values) {
				this.draw(ctx,this.clock.face_a,this.clock.pins_a,width,height,false,false,show_values);
			}

			draw_face_b(ctx,width,height,show_values,reverse) {
				this.draw(ctx,this.clock.face_b,this.clock.get_pins_b(),width,height,true,reverse,show_values);
			}

		}	