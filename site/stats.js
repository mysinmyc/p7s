const empty_stats={ best: [], recent: [], model_version:2 };

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

    add_solve(time, elapsed_ms, scramble){
        let solve = { time: time, elapsed_ms: elapsed_ms, scramble: scramble };

        this.stats.recent.push(solve);
        while (this.stats.recent.length > 50) {
            this.stats.recent.shift();
        }

        var position = 0;
        var added =false;
        while (position<this.stats.best.length){
            if ( solve.elapsed_ms < this.stats.best[position].elapsed_ms) {
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

        while (this.stats.best.length > 50) {
            this.stats.best.shift();
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
