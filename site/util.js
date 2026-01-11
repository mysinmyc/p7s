		function pad_number(number, size) {
			let str_number=number.toString();
			while (str_number.length< size) {
				str_number = "0"+str_number;
			}
			return str_number;
		}

        function truncate_ms(value_ms) {
            return Math.trunc(value_ms/10)*10;
        }
        function format_timer_ms(value_ms)  {
            return pad_number(Math.trunc(value_ms/1000),2) + "." + pad_number(Math.trunc(value_ms/10)%100 ,2);
        }

        function format_time(time_ms) {
            let date=new Date(time_ms);
            return date.toLocaleString();
        }


        function format_scramble(scramble) {
            let scramble_str ="";
            scramble.forEach ( (s) => scramble_str+= s.str + " ");
            return scramble_str.trimEnd();
        }