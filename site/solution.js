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


    function exec7SimulBPaul(clock) {
        var clock_view = new ClockView(clock);
        var solution = compute7SimulBPaul(clock);
        
        clock_view.set_current_pins(1,0,1,1);
        clock_view.rotate_gear_UL(solution[0]);
        clock_view.rotate_gear_UR(solution[1]);
        
        clock_view.set_current_pins(1,0,1,0);
        
        var current_inner_clocks = clock_view.current_inner_clocks;
        clock_view.rotate_gear_UL( current_inner_clocks[5].value - current_inner_clocks[7].value);
        clock_view.rotate_gear_UR(solution[2]);

        clock_view.set_current_pins(1,0,0,0);
        current_inner_clocks = clock_view.current_inner_clocks;
        clock_view.rotate_gear_UL( current_inner_clocks[7].value - current_inner_clocks[4].value);
        clock_view.rotate_gear_UR( current_inner_clocks[5].value - current_inner_clocks[8].value);

        current_inner_clocks = clock_view.current_inner_clocks;
        if (! (current_inner_clocks[4].value == current_inner_clocks[5].value &&
                current_inner_clocks[4].value == current_inner_clocks[7].value &&
                current_inner_clocks[4].value == current_inner_clocks[8].value
         )) {
            console.log("first check failed");
            return false;
        }

        clock_view.flipX2();

        current_inner_clocks = clock_view.current_inner_clocks;
        if (! (current_inner_clocks[0].value == current_inner_clocks[1].value &&
                current_inner_clocks[0].value == current_inner_clocks[3].value &&
                current_inner_clocks[0].value == current_inner_clocks[4].value
         )) {
            console.log("second check failed");
            return false;
        }

     
        clock_view.set_current_pins(1,0,1,1);
        clock_view.rotate_gear_UL(solution[3]);
        clock_view.rotate_gear_UR(solution[4]);
        
        clock_view.set_current_pins(1,0,1,0);
        
        current_inner_clocks = clock_view.current_inner_clocks;
        clock_view.rotate_gear_UL(current_inner_clocks[5].value - current_inner_clocks[7].value);
        clock_view.rotate_gear_UR(solution[5]);

        clock_view.set_current_pins(1,0,0,0);
        current_inner_clocks = clock_view.current_inner_clocks;
        clock_view.rotate_gear_UL( current_inner_clocks[7].value - current_inner_clocks[4].value);
        clock_view.rotate_gear_UR( current_inner_clocks[5].value - current_inner_clocks[8].value);


        current_inner_clocks = clock_view.current_inner_clocks;
        if (! (current_inner_clocks[2].value == current_inner_clocks[6].value
         )) {
            console.log("third check failed");
            return false;
        }

           
        clock_view.set_current_pins(1,0,0,1);

        clock_view.rotate_gear_UL( 6 - current_inner_clocks[0].value);
        clock_view.rotate_gear_UR( 6 - current_inner_clocks[2].value);

        
        if (! (clock.is_solved
         )) {
            console.log("last check failed");
            return false;
        } 

        return true;
    }

    function test7SimulBPaul(clock) {
        return exec7SimulBPaul(clock.clone());
    }