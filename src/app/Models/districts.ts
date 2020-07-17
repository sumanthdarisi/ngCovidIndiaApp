export class Districts {
    dt_name: string;
    dt_population: number;
    dt_confirmed: number;
    dt_deceased: number;
    dt_tested: number;
    dt_recoverd: number;
    dt_active: number;

    delta_con: any;
    delta_rec: any;
    delta_dec: any;
    delta_tes: any;
    delta_act: any;

    constructor(name, pop, con, dec, tes, rec,act,d_con,d_act,d_rec,d_dec,d_tes){
        this.dt_name = name;
        this.dt_population = pop;
        this.dt_confirmed = con;
        this.dt_deceased = dec;
        this.dt_tested = tes;
        this.dt_recoverd = rec;
        this.dt_active = act;

        this.delta_act = d_act;
        this.delta_con = d_con;
        this.delta_dec = d_dec;
        this.delta_rec = d_rec;
        this.delta_tes = d_tes;
    }
}
