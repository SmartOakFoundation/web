export class Game {
    public Id: number;
    public Name: string;
    public Price: number;
    public ImagePath: string;
    public ShortDescription: string;
    public EthereumId: number;
    public HasAnyLicence: boolean;
    public SteamLink: string;

    public WaitingForBuy: boolean = false;
    public WaitingForBuyText: string;

}