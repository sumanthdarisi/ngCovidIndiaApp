export class States {
    st_name: string;
    st_population: number;
    st_confirmed: number;
    st_deceased: number;
    st_tested: number;
    st_recoverd: number;
    st_active: number;    
    st_lastupdate: Date;
    st_vaccinated:number;

    delta_con: any;
    delta_rec: any;
    delta_tes: any;
    delta_dec: any;
    delta_act: any;
    delta_vac: any;

    constructor(name, pop, con, dec, tes, rec, act, date, vacc, d_con, d_rec, d_dec, d_tes, d_act,d_vac){
        this.st_name = name;
        this.st_population = pop;
        this.st_confirmed = con;
        this.st_deceased = dec;
        this.st_tested = tes;
        this.st_recoverd = rec;
        this.st_active = act;
        this.st_lastupdate = date;
        this.st_vaccinated = vacc;

        this.delta_con = d_con;
        this.delta_dec = d_dec;
        this.delta_rec = d_rec;
        this.delta_tes = d_tes;
        this.delta_act = d_act;
        this.delta_vac = d_vac;
    }
}


