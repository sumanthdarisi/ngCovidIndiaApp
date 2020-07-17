
export class StatesDelta {
    Name: any;
    Confirmed: any;
    Recovered: any;
    Active: any;
    Deceased: any;
    Tested: any;

    constructor(name,con,rec,act,dec,tes){
        this.Name= name;
        this.Confirmed = con;
        this.Recovered = rec;
        this.Active = act;
        this.Deceased  = dec;
        this.Tested = tes;
    }

}
