export class NtStCounts {
    nt_confirmed;
    nt_deceased;
    nt_active;
    nt_recovered;
    nt_tested;

    st_confirmed;
    st_active;
    st_deceased;
    st_recovered;
    st_tested;

    public constructor(nt_con,nt_rec,nt_dec,nt_act,nt_tes,st_con,st_rec,st_dec,st_act,st_tes){
        this.nt_active=nt_act;
        this.nt_confirmed = nt_con;
        this.nt_deceased=nt_dec;
        this.nt_recovered=nt_rec;
        this.nt_tested=nt_tes;
        this.st_active=st_act;
        this.st_confirmed=st_con;
        this.st_deceased=st_dec;
        this.st_recovered=st_rec;
        this.st_tested=st_tes;
    }
}
