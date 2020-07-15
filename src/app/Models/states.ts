export class States {
    st_name: string;
    st_population: number;
    st_confirmed: number;
    st_deceased: number;
    st_tested: number;
    st_recoverd: number;
    st_active: number;
    st_lastupdate: Date;

    constructor(name, pop, con, dec, tes, rec,act, date){
        this.st_name = name;
        this.st_population = pop;
        this.st_confirmed = con;
        this.st_deceased = dec;
        this.st_tested = tes;
        this.st_recoverd = rec;
        this.st_active = act;
        this.st_lastupdate = date;
    }
}


