const empty_stats={ best: [], recent: [] };

class StatsManager {

    constructor() {
    }

    init() {
        this.load();
    }

    load() {
        this.stats=JSON.parse(localStorage.getItem("stats") ?? JSON.stringify(empty_stats));
    }

    clear() {
        this.stats=empty_stats;
        this.save();
    }
    save(){
        localStorage.setItem("stats", JSON.stringify(this.stats));
    }

    add_solve(time, elasped_ms, scramble){
        let solve = { time: time, elasped_ms: elasped_ms, scramble: scramble };

        this.stats.recent.push(solve);
        while (this.stats.recent.length > 50) {
            this.stats.recent.shift();
        }

        var position = 0;
        var added =false;
        while (position<this.stats.best.length){
            if ( solve.elasped_ms < this.stats.best[position].elasped_ms) {
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
}
