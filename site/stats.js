const empty_stats={ best: [], recent: [], model_version:3 };

class StatsManager {

    constructor() {
    }

    init() {
        this.load();
    }

    load() {
        this.stats=JSON.parse(localStorage.getItem("stats") ?? JSON.stringify(empty_stats));

        if (this._upgrade_version()) {
            this.save();
        }
    }

    _upgrade_version() {
        if (this.stats.model_version != undefined && this.stats.model_version >= empty_stats.model_version ) {
            return false;
        }
        if (this.stats.model_version == undefined || this.stats.model_version < 2) {
            this.stats.best.forEach(e => {
                if (e.elasped_ms != undefined) {
                    e.elapsed_ms = e.elasped_ms;
                    delete e['elasped_ms'];
                }
            });
            this.stats.recent.forEach(e => {
                if (e.elasped_ms != undefined) {
                    e.elapsed_ms = e.elasped_ms;
                    delete e['elasped_ms'];
                }
            });  
        }      
        if (this.stats.model_version == undefined || this.stats.model_version < 3) {
            this.stats.recent.forEach( s=> this.add_solve(s.time, s.elapsed_ms, s.scramble,false,true) )
        }
        this.stats.model_version = empty_stats.model_version;
        return true;
    }

    clear() {
        this.stats=empty_stats;
        this.save();
    }

    save(){
        localStorage.setItem("stats", JSON.stringify(this.stats));
    }


    get_raw() {
        return localStorage.getItem("stats") ?? JSON.stringify(empty_stats); 
    }

    import_raw(stats_string) {
        
        let new_stats = JSON.parse(stats_string);
        let new_stats_keys=Object.keys(new_stats)
        Object.keys(empty_stats).forEach( function(k) {
            if (! new_stats_keys.includes(k)) {
                throw new Error("key "+k+" not in stats info");
            }
        });
       
        this.stats = new_stats;
        this.save();
        this.init();
    }

    add_solve(time, elapsed_ms, scramble, add_to_history= true,add_to_best=true ){
        let solve = { time: time, elapsed_ms: elapsed_ms, scramble: scramble, valid: true };

        if (add_to_history) {
            if ( this.stats.recent.length > 0  &&
                this.stats.recent[this.stats.recent.length -1].time == solve.time &&
                this.stats.recent[this.stats.recent.length -1].elapsed_ms == solve.elapsed_ms
             ) {
                solve.valid =false;
             } else {

                this.stats.recent.push(solve);
                while (this.stats.recent.length > 50) {
                    this.stats.recent.shift();
                }
            }
        }

        if (add_to_best){
            var position = 0;
            var added =false;
            while (position<this.stats.best.length){

                if ( solve.time == this.stats.best[position].time &&
                    solve.elapsed_ms == this.stats.best[position].elapsed_ms
                ) {
                    added=true;
                    solve.ranking = this.stats.best[position].ranking;
                    solve.valid=false;
                    break;
                } else if ( solve.elapsed_ms < this.stats.best[position].elapsed_ms) {
                    solve.ranking=position+1;
                    this.stats.best.splice(position,0,solve);
                    added=true;
                    break;
                }
                position++;
            }
            if (!added) {
                solve.ranking=this.stats.best.length+1;
                this.stats.best.push(solve);
            }

            while (this.stats.best.length > 20) {
                this.stats.best.pop();
            }
        }

        this.save();
        return solve;
    }

    get average_Ao5() {
        return this.get_average_AoX(5);
    }

    get average_Ao12() {
        return this.get_average_AoX(12);
    }

    get_average_AoX(number_of_resolutions) {
        if (this.stats.recent.length < number_of_resolutions ) {
            return -1;
        }
        let solves_to_compute=this.stats.recent.slice(this.stats.recent.length-number_of_resolutions);
        solves_to_compute.sort( (a,b) => a.elapsed_ms - b.elapsed_ms);
        let sum=0;
        for (let cnt = 1;cnt<(number_of_resolutions-1);cnt++) {
            sum+= Math.trunc(solves_to_compute[cnt].elapsed_ms / 10);
        }
        return Math.trunc(sum/(number_of_resolutions-2))*10;
    }

}
