
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

		function compute7SimulBPaul(clock) {

			const A = {
				U: clock.inner_clocks[1].value, L: clock.inner_clocks[3].value, R: clock.inner_clocks[5].value, D: clock.inner_clocks[7].value, 
				C: clock.inner_clocks[4].value,
				UL: clock.inner_clocks[0].value, UR: clock.inner_clocks[2].value, DL: clock.inner_clocks[6].value, DR: clock.inner_clocks[8].value
			};
			const B = {
				U: clock.inner_clocks[16].value, L: clock.inner_clocks[14].value, R: clock.inner_clocks[12].value, D: clock.inner_clocks[10].value, 
				C: clock.inner_clocks[13].value,
				UL: clock.inner_clocks[17].value, UR: clock.inner_clocks[15].value, DL: clock.inner_clocks[11].value, DR: clock.inner_clocks[9].value
			};

			const m1 = roundHourDistance(moveHourTo(A.R,A.D) + moveHourTo(B.L,B.UL));
			const m2 = moveHourTo(B.U,B.C);
			const m3 = moveHourTo(B.L,B.U);
			const m4 = roundHourDistance(moveHourTo(B.R,B.D) + moveHourTo(A.L,A.UL));
			const m5 = moveHourTo(A.U,A.C);
			const m6 = moveHourTo(A.L,A.U);

			return [m1, m2, m3, m4, m5, m6 ];
		}

		class Pin {
			constructor(up,id) {
				this.up = up;
				this.id=id;
			}

			get is_up() {
				return this.up;
			}

			set_up(value) {
				this.up = value;
			}

			invert() {
				this.up = ! this.up;
				return this.is_up;
			}
		}

		class InvertPin {
			constructor(pin) {
				this.pin=pin;
			}
			get is_up() {
				return ! this.pin.is_up;
			}

			invert() {
				this.pin.invert();
			}

			set_up(value) {
				this.pin.set_up(!value);
			}
			get id() {
				return this.pin.id;
			}
		}

		class InnerClock {
			constructor (value,id) {
				this.id=id;
				this.value=value;
			}

			increase(hours){
				this.value = (this.value+hours)%12;
			}
		}

		class RotatedInnerClock  {
			constructor (inner_clock, rotation) {
				this.inner_clock=inner_clock;
				this.rotation=rotation;
			}
			get value() {
				if (this.rotation == 0) {
					return this.inner_clock.value;
				} else {
					return roundHourDistance(this.inner_clock.value + (3*Math.trunc(this.rotation/90)));
				}
			}

			get id () {
				return this.inner_clock.id;
			}

			increase(hours) {
				this.inner_clock.increase(hours);
			}
		}

		class Clock {

			constructor() {
				this.reset();
			}

			reset() {

				var inner_clocks=[];
				for (let cnt =0;cnt<18;cnt++) {
					inner_clocks.push(new InnerClock(0,cnt));
				}
				this.inner_clocks=inner_clocks;
				this.pins_a=[new Pin(true,0),new Pin(false,1),new Pin(true,2),new Pin(true,3)];
			}

			get is_solved() {
				for (let cnt =0;cnt<18;cnt++) {
					if(this.inner_clocks[cnt].value != 0) {
						return false;
					}
				}
				return true;
			}

			serialize() {

				var inner_clocks_values = [];
				for (let cnt=0;cnt<18;cnt++) {
					inner_clocks_values.push(this.inner_clocks[cnt].value);
				}
				var pins_values = [] ;
				for (let cnt=0;cnt<4;cnt++) {
					pins_values.push(this.pins_a[cnt].is_up);
				}
				return { inner_clocks : inner_clocks_values, pins: pins_values};
			}

			deserialize(serialized_clock) {
				for (let cnt=0;cnt<18;cnt++) {
					this.inner_clocks[cnt] = new InnerClock(serialized_clock.inner_clocks[cnt],cnt);
				}
				for (let cnt=0;cnt<4;cnt++) {
					this.pins_a[cnt] = new Pin(serialized_clock.pins[cnt],cnt);
				}
			}
		}

		class ClockView{
			constructor(clock) {
				this.clock = clock;
				this.rotated180=false;
				this.current_side_a=true;

			}

			reset() {
				this.rotated180=false;
				this.current_side_a=true;				
			}

			get is_rotated180() {
				return this.rotated180;
			}

			get is_current_side_a() {
				return this.current_side_a;
			}

			rotate180() {
				this.rotated180=!this.rotated180;
			}

			flipY2() {
				this.current_side_a = ! this.current_side_a;
			}

			flipX2() {
				this.current_side_a = ! this.current_side_a;
				this.rotate180();
			}

			get opposite_face() {
				var result = new ClockView(this.clock);
				result.rotated180 = this.is_rotated180;
				result.current_side_a = !this.is_current_side_a;
				return result;
			}

			get pins_a() {
				return this.clock.pins_a;
			}

			get inner_clocks() {
				return this.clock.inner_clocks;
			}

			get current_pins(){			
				if (this.is_rotated180) {
					if (this.is_current_side_a) {
						return [ this.pins_a[3], this.pins_a[2] ,this.pins_a[1],this.pins_a[0] ];
					} else {
						return [ new InvertPin( this.pins_a[2]),new InvertPin( this.pins_a[3]),new InvertPin( this.pins_a[0]),new InvertPin( this.pins_a[1])];
					}
				} else {
					if (this.is_current_side_a) {
						return [ this.pins_a[0], this.pins_a[1] ,this.pins_a[2],this.pins_a[3] ];
					} else {
						return [ new InvertPin( this.pins_a[1]),new InvertPin( this.pins_a[0]),new InvertPin( this.pins_a[3]),new InvertPin( this.pins_a[2])];
					}
				}
			}
			
			set_current_pins(p0,p1,p2,p3) {
				const current_pins = this.current_pins;
				current_pins[0].set_up(p0);
				current_pins[1].set_up(p1);
				current_pins[2].set_up(p2);
				current_pins[3].set_up(p3);
			}

			get current_inner_clocks() {
				var result=[];
				const start = this.is_current_side_a ? 0 : 9;
				for ( let cnt=0;cnt<9;cnt++) {
					var offset = this.is_rotated180 ? 8 - cnt : cnt;
					result.push(new RotatedInnerClock(this.inner_clocks[start+offset], this.is_rotated180 ? 180 : 0));	
				}
				return result;
			}			


			rotate_gear_UL(steps) {
				this._rotate_gear_UL(steps);
				this.opposite_face._rotate_gear_UR(steps*-1);
			}

			rotate_gear_UR(steps) {
				this._rotate_gear_UR(steps);
				this.opposite_face._rotate_gear_UL(steps*-1);
			}

			rotate_gear_DL(steps) {
				this._rotate_gear_DL(steps);
				this.opposite_face._rotate_gear_DR(steps*-1);
			}

			rotate_gear_DR(steps) {
				this._rotate_gear_DR(steps);
				this.opposite_face._rotate_gear_DL(steps*-1);
			}

			_rotate_gear_UL(steps) {
				var current_pins = this.current_pins;
				var inner_clocks = this.current_inner_clocks;

				inner_clocks[0].increase(steps);

				if (current_pins[0].is_up) {
					inner_clocks[1].increase(steps);
					inner_clocks[3].increase(steps);
					inner_clocks[4].increase(steps);

					if (current_pins[1].is_up) {
						inner_clocks[2].increase(steps);
					}

					if (current_pins[2].is_up) {
						inner_clocks[6].increase(steps);
					}

					if (current_pins[3].is_up) {
						inner_clocks[8].increase(steps);
					}

					if (current_pins[1].is_up || current_pins[3].is_up) {
						inner_clocks[5].increase(steps);
					}
					if (current_pins[2].is_up || current_pins[3].is_up) {
						inner_clocks[7].increase(steps);
					}					

				} else {
					if (!current_pins[1].is_up) {
						inner_clocks[2].increase(steps);
					}

					if (!current_pins[2].is_up) {
						inner_clocks[6].increase(steps);
					}

					if (!current_pins[3].is_up) {
						inner_clocks[8].increase(steps);
					}
				}
			}

			_rotate_gear_UR(steps) {
				const current_pins = this.current_pins;
				const inner_clocks = this.current_inner_clocks;

				inner_clocks[2].increase(steps);

				if (current_pins[1].is_up) {
					inner_clocks[1].increase(steps);
					inner_clocks[4].increase(steps);
					inner_clocks[5].increase(steps);

					if (current_pins[0].is_up) {
						inner_clocks[0].increase(steps);
					}

					if (current_pins[2].is_up) {
						inner_clocks[6].increase(steps);
					}

					if (current_pins[3].is_up) {
						inner_clocks[8].increase(steps);
					}

					if (current_pins[0].is_up || current_pins[2].is_up) {
						inner_clocks[3].increase(steps);
					}
					if (current_pins[2].is_up || current_pins[3].is_up) {
						inner_clocks[7].increase(steps);
					}					

				} else {
					if (!current_pins[0].is_up) {
						inner_clocks[0].increase(steps);
					}

					if (!current_pins[2].is_up) {
						inner_clocks[6].increase(steps);
					}

					if (!current_pins[3].is_up) {
						inner_clocks[8].increase(steps);
					}
				}				
			}

			_rotate_gear_DL(steps) {
				var current_pins = this.current_pins;
				var inner_clocks = this.current_inner_clocks;

				inner_clocks[6].increase(steps);

				if (current_pins[2].is_up) {
					inner_clocks[3].increase(steps);
					inner_clocks[4].increase(steps);
					inner_clocks[7].increase(steps);

					if (current_pins[0].is_up) {
						inner_clocks[0].increase(steps);
					}

					if (current_pins[1].is_up) {
						inner_clocks[2].increase(steps);
					}

					if (current_pins[3].is_up) {
						inner_clocks[8].increase(steps);
					}

					if (current_pins[0].is_up || current_pins[1].is_up) {
						inner_clocks[1].increase(steps);
					}
					if (current_pins[1].is_up || current_pins[3].is_up) {
						inner_clocks[5].increase(steps);
					}					

				} else {
					if (!current_pins[0].is_up) {
						inner_clocks[0].increase(steps);
					}

					if (!current_pins[1].is_up) {
						inner_clocks[2].increase(steps);
					}

					if (!current_pins[3].is_up) {
						inner_clocks[8].increase(steps);
					}
				}
			}			

			_rotate_gear_DR(steps) {
				const current_pins = this.current_pins;
				const inner_clocks = this.current_inner_clocks;

				inner_clocks[8].increase(steps);

				if (current_pins[3].is_up) {
					inner_clocks[4].increase(steps);
					inner_clocks[5].increase(steps);
					inner_clocks[7].increase(steps);

					if (current_pins[0].is_up) {
						inner_clocks[0].increase(steps);
					}

					if (current_pins[1].is_up) {
						inner_clocks[2].increase(steps);
					}

					if (current_pins[2].is_up) {
						inner_clocks[6].increase(steps);
					}

					if (current_pins[0].is_up || current_pins[2].is_up) {
						inner_clocks[3].increase(steps);
					}
					if (current_pins[0].is_up || current_pins[1].is_up) {
						inner_clocks[1].increase(steps);
					}					

				} else {
					if (!current_pins[0].is_up) {
						inner_clocks[0].increase(steps);
					}

					if (!current_pins[1].is_up) {
						inner_clocks[2].increase(steps);
					}

					if (!current_pins[2].is_up) {
						inner_clocks[6].increase(steps);
					}
				}				
			}
		}

		const PinsConfig= {
			UL: 0,
			UR: 1,
			DL: 2,
			DR: 3,
			L: 4,
			R: 5,
			U: 6,			
			D: 7,
			ALL: 8
		}

		function pins_config_to_str(pins_config) {
			const key = Object.keys(PinsConfig).find(key => PinsConfig[key] === pins_config);
			return key;
		}

		class WcaScramble {
		
			constructor(clock,clock_view) {
				this.clock=clock;
				this.clock_view=clock_view;				
			}
			
			execute(scramble_to_execute=12) {
				var scramble=[];
				this.clock.reset();
				this.clock_view.reset();
				for (let cnt=0; cnt<scramble_to_execute ; cnt++) {
					const pins_config= Math.floor(Math.random() * 9);
					const steps= Math.floor(Math.random() * 12);
					this.execute_step(pins_config,steps);
					scramble.push ({pins_config: pins_config, steps:steps, str: pins_config_to_str(pins_config) + roundHourDistance(steps)});

					if (cnt==Math.trunc(scramble_to_execute/2)) {
						this.clock_view.flipY2();
						scramble.push ({str: "y2"});
					}
				}
				this.clock_view.reset();
				return scramble;
			}

			execute_step(pins_config,steps) {

				switch (pins_config) {
					case PinsConfig.UL: 
						this.clock_view.set_current_pins(1,0,0,0);
						break;
					case PinsConfig.UR: 
						this.clock_view.set_current_pins(0,1,0,0);					
						break;
					case PinsConfig.DL: 
						this.clock_view.set_current_pins(0,0,1,0);
						break;
					case PinsConfig.DR: 
						this.clock_view.set_current_pins(0,0,0,1);
						break;
					case PinsConfig.L: 
						this.clock_view.set_current_pins(1,0,1,0);
						break;
					case PinsConfig.R: 
						this.clock_view.set_current_pins(0,1,0,1);
						break;
					case PinsConfig.U: 
						this.clock_view.set_current_pins(1,1,0,0);																									
						break;
					case PinsConfig.D: 
						this.clock_view.set_current_pins(0,0,1,1);
						break;
					case PinsConfig.ALL: 
						this.clock_view.set_current_pins(1,1,1,1);										
						break;
				}
				
				var current_pins= this.clock_view.current_pins;

				if (current_pins[0].is_up) {
					this.clock_view.rotate_gear_UL(steps);
					return;
				}

				if (current_pins[1].is_up) {
					this.clock_view.rotate_gear_UR(steps);
					return;
				}			

				if (current_pins[2].is_up) {
					this.clock_view.rotate_gear_DL(steps);
					return;
				}						

				if (current_pins[3].is_up) {
					this.clock_view.rotate_gear_DR(steps);
					return;
				}			
			}						
		}
