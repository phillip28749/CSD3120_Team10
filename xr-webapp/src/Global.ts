export class GLOBAL 
{
    static DEBUG_MODE: number = 1

    static print(...data: any[])
    {
        if(this.DEBUG_MODE) console.log(...data)
    }
}