import {AbstractMesh, Nullable } from "babylonjs";
import {Molecule} from './Molecule'

/**
 * A manager class for molecules to perform molecule logic and holds data relating to molecules
 */
export class MoleculeManager
{   
    currSelected : Nullable<Molecule>;                  // currently selected molecule
    private reactants : Molecule[];                 // the available reactants
    private result: Molecule[];                     // the available results for reactions
    private reactionList : Map<string,number>;      // list molecule and its count in the reaction list

    /**
     * Default constructs a molecule manager
     */
    constructor()
    {
        this.currSelected = null;
        this.reactants = [];
        this.result = [];
        this.reactionList = new Map<string,number>();
    }

    getAllResults() : Molecule[]
    {
        return this.result;
    }

    /**
     * Adds a molecule to the reaction list used to check for reaction
     * @param  m
     *         The reactant molecule obj
     */
    addReactionToList(m : Nullable<Molecule>)
    {
        var count = this.reactionList.get(m.name);
        if(count !== undefined)
        {
            ++count;
            console.log("Add reaction name:" + m.name);
            this.reactionList.set(m.name, count);
        }
        else
            console.log("Error: adding reaction to list");
    }
    /**
     * Clears the reaction list and reset it
     */
    clearReactionList()
    {
        this.reactants.forEach(m => {
            this.reactionList.set(m.name, 0);
        });
        console.log("clear reaction list");
    }

    /**
     * Push a molecule to the list of available reactants
     * @param   m
     *          The reactant molecule obj
     */
    pushReactants( m : Molecule)
    {   
        this.reactants.push(m);
        this.reactionList.set(m.name,0);
    }

    /**
     * Finds a reactant master mesh's root by using its own/children's unique mesh id.
     * @param   id
     *          The unique id of mesh to perform search   
     * @returns 
     *          The master molecule object in the reactant list
     */
    findReactants( id : number) : Nullable<Molecule>
    {
        for(let m of this.reactants)
        {   
            //console.log("finding id:" + id.toString());
        
            if(m.uniqueIds.indexOf(id) !== -1)
            {
                return m;
            }
        }
        return null;
    }

    /**
     * Push a molecule to the list of available result from reaction
     * @param   m
     *          The reactant molecule obj
     */
    pushResult( m : Molecule)
    {
        this.result.push(m);
    }

    /**
     * Gets the result from the reaction
     * @returns 
     *          The resulting molecule object from the reaction,
     *          null is return if the process fails.
     */
    getResult() : Nullable<Molecule>
    {   
        var m : Nullable<Molecule> = null;
        const cc = this.reactionList.get("C");
        const o2c = this.reactionList.get("O2");
        const h2c = this.reactionList.get("H2");
        // if(cc !== undefined)
        //     console.log("C:" + cc.toString());
        // if(o2c !== undefined)
        //     console.log("O2:" + o2c.toString());
        // if(h2c !== undefined)
        //     console.log("H2:" + h2c.toString());

        //CO2
        if(cc !== undefined && cc == 1 && o2c !== undefined && o2c == 1)
            m = this.result[0];
        //C6H6
        else if(cc !== undefined && cc == 6 && h2c !== undefined && h2c == 3)
            m = this.result[1];
        
        //reaction success clear the reaction list
        if(m != null)
            this.clearReactionList();

        return m;
    }

    /**
     * Clones the given molecule's meshs,material and transform
     * @param   m
     *          The molecule to clone
     * @returns 
     *          The cloned molecule's mesh
     */
    clone(m : Molecule) : Nullable<AbstractMesh>
    {
       return m.root.clone(m.root.name + "_clone",null);
    }

};
