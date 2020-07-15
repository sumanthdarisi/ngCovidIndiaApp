export class Districts {
    dt_name: string;
    dt_population: number;
    dt_confirmed: number;
    dt_deceased: number;
    dt_tested: number;
    dt_recoverd: number;
    dt_active: number;

    constructor(name, pop, con, dec, tes, rec,act){
        this.dt_name = name;
        this.dt_population = pop;
        this.dt_confirmed = con;
        this.dt_deceased = dec;
        this.dt_tested = tes;
        this.dt_recoverd = rec;
        this.dt_active = act;
    }
}
