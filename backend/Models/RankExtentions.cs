namespace Backend.Models
{
    public static class RankExtensions
    {
        public static bool IsTitularise(this Rank rank) => rank switch
        {
            Rank.Stagiaire1ereAnnee => false,
            Rank.Stagiaire2emeAnnee => false,
            Rank.Contractuelle => false,
            _ => true
        };
    }
}