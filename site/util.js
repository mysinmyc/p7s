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
            let count_secondi =Math.trunc(value_ms/1000);
            let minuti=Math.trunc(count_secondi/60);
            let secondi=count_secondi % 60;
            return pad_number(minuti,2)+":"+ pad_number(secondi,2) + "." + pad_number(Math.trunc(value_ms/10)%100 ,2);
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


        function download_into_file(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);

        }        