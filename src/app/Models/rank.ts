export class Rank {
    ConfirmedRank;
    ActiveRank;
    RecoveredRank;
    DeceasedRank;
    TestsRank;

    public constructor(con,act,rec,dec,tes){
        this.ActiveRank = act;
        this.ConfirmedRank = con;
        this.DeceasedRank = dec;
        this.RecoveredRank = rec;
        this.TestsRank = tes;
    }
}
