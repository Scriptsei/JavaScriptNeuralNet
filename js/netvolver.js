/*****************************************************************/
/*Genetics Constants                                             */
/*****************************************************************/
var tValMed = 0.5;
var weightMin = -1;
var weightMax = 1;
var tMin = 0.53;
var tMax = 0.6;


var netInitilizers; //[nins,nouts,nhnodes,hiddenls]

/*****************************************************************/
/*Chromosome definition.                                         */
/*****************************************************************/
function Chromosome(neurons, connections)
{
	this.wgenes = new Array();
	this.tvgenes = new Array();
	this.fitness = 0.0;

	for(var i=0;i<neurons;i++)
		this.tvgenes.push((Math.random() + 1.5 - 1) / 10 + tValMed + 0.03);

	for(var i=0;i<connections;i++)
		this.wgenes.push(Math.random() * 2 - 1);

	this.mutate = function(rate, varience, flags)
	{
		if(flags != 15)
		{
			var s = 0;
			var e = this.wgenes.length;

			if(flags & 1)
				s += netInitilizers[0] * netInitilizers[2];
			if(flags & 2)
				e -= netInitilizers[2] * netInitilizers[1];
			if(flags & 4)
				s += netInitilizers[2] * netInitilizers[2] * netInitilizers[3];


			for(var i=s;i<e;i++)
			{
				var r = Math.random();
				if (r > 1 - rate && r < 1 )
				{
					this.wgenes[i]+= (Math.random() * 2 - 1) * varience * weightMax;
					if(this.wgenes[i] > weightMax)
						this.wgenes[i] = weightMax;
					if(this.wgenes[i] < weightMin)
						this.wgenes[i] = weightMin;
				}
			}
			if(flags == 0 || flags & 8 != 0)
			{
				for(var i=0;i<this.tvgenes.length;i++)
				{
					var r = Math.random();
					if (r > 1 - rate && r < 1 )
					{
						this.tvgenes[i]+= (Math.random() * 2 - 1) * varience * tMax;
						if(this.tvgenes[i] > tMax)
							this.tvgenes[i] = tMax;
						if(this.tvgenes[i] < tMin)
							this.tvgenes[i] = tMin;
					}
				}
			}
		}
	}

	this.mixGenes = function(mixWith)
	{
		var newChrom = new Chromosome(this.tvgenes.length,this.wgenes.length);

		for(var i=0;i<this.tvgenes.length;i++)
			newChrom.tvgenes[i] = (this.tvgenes[i] + mixWith.tvgenes[i]) / 2

		for(var i=0;i<this.wgenes.length;i++)
			newChrom.wgenes[i] = (this.wgenes[i] + mixWith.wgenes[i]) / 2

		return newChrom;
	}

}

/*****************************************************************/
/*Genome definition.                                             */
/*****************************************************************/
function Genome(neurons, connections, gsize)
{
	this.chromosomes = new Array();
	this.neurons = neurons;
	this.connections = connections;

	for(var i=0;i<gsize;i++)
		this.chromosomes.push(new Chromosome(neurons, connections));

	this.addNewChromosome = function()
	{
		this.chromosomes.push(new Chromosome(neurons, connections));
	}

	this.removeChromosome = function()
	{
		this.chromosomes.pop();
	}

	this.breedNewChromosome = function(c1,c2)
	{
		var mixed = this.chromosomes[c1].mixGenes(this.chromosomes[c2]);
		this.chromosomes.push(mixed);
	}

}


/*****************************************************************/
/*Worker Code                                                    */
/*****************************************************************/
var net;
var genome;
var inputs;
var cchrom;

//*************************//
/* Initiate a set of       */
/* inputs			       */
//*************************//
function initInputs()
{
	inputs = new Array();
	for(var i=0; i<net.inputl.neurons.length; i++)
	{
		if(inputMode == 0)
			inputs.push(1);
		else
			inputs.push(0);
	}
}

//*************************//
/* Initiate a new network  */
/* based on the options    */
//*************************//
function initNet(nins,nouts,nhnodes,hiddenls)
{
	netInitilizers = [nins,nouts,nhnodes,hiddenls];
	net = new NeuralNet();
	net.createFeedForward(nins, nouts, nhnodes, hiddenls);
	net.setInputs(inputs);
}


//*************************//
/* Initiate a new genome   */
/* based on the options    */
//*************************//
function initGenome(nchroms)
{
	genome = new Genome(net.getNumHiddenNeurons() + net.getNumOutputs(), net.getNumConnections(), nchroms);
	net.setTValues(genome.chromosomes[0].tvgenes);
	net.setWeights(genome.chromosomes[0].wgenes);
}

//*************************//
/* resize the current      */
/* genome to have ncrhoms  */
/* chromosomes             */
//*************************//
function resizeGenome(nchroms, schrom)
{
	var lth = genome.chromosomes.length;

	if(nchroms < lth)
	{
		for(var i=0;i< lth - nchroms;i++)
			genome.removeChromosome();
	}
	else if (nchroms > lth)
	{
		for(var i=0;i<nchroms - lth;i++)
			genome.addNewChromosome();
	}

	if(schrom>lth)
	{
		var cwgs = genome.chromosomes[schrom].wgenes;
		var ctgs = genome.chromosomes[schrom].tvgenes;
		genome.chromosomes[genome.chromosomes.length - 1].wgenes = cwgs;
		genome.chromosomes[genome.chromosomes.length - 1].tvgenes = ctgs;
		schrom = lth - 1;
	}
	return schrom;
}

//*************************//
/* Mutate the currently    */
/* selected chromosome     */
//*************************//
function mutateChromosome(chrom,rate,varience,imode,omode, flags)
{
	genome.chromosomes[chrom].mutate(rate, varience, flags);
	net.setTValues(genome.chromosomes[chrom].tvgenes);
	net.setWeights(genome.chromosomes[chrom].wgenes);
	updateChromDiv();
	calcNet(imode,omode);
}

//*************************//
/* Mutate the currently    */
/* selected chromosome     */
//*************************//
function breedChromosomes(c1,c2)
{
	genome.breedNewChromosome(c1,c2);
	return genome.chromosomes.length;
}

//*************************//
/* Mutate the currently    */
/* selected chromosome     */
//*************************//
function Netvolver(gens,trainval,chrom,imode,omode,rate,varience)
{
	for(var i=0;i<gens;i++)
	{
		for(var j=0;j<genome.chromosomes.length;j++)
		{
			net.setTValues(genome.chromosomes[j].tvgenes);
			net.setWeights(genome.chromosomes[j].wgenes);
			net.calculateNetwork();
			var d = (256 - Math.abs(net.getOutputAsNumber() - trainval.charCodeAt(0))) / 256
			var f = net.getOutputAsNumber() ^ trainval.charCodeAt(0);
			var c = 0;
			for(var k=0;k<8;k++)
			{
				c += f & 1;
				f = f >>> 1;
			}

			genome.chromosomes[j].fitness = ((8 - c) / 8) * d;
		}
		genome.chromosomes.sort(function(a,b){
			    if (a.fitness < b.fitness)
			      return 1;
			    if (a.fitness > b.fitness)
			      return -1;
    			return 0;});

    	var length = genome.chromosomes.length;
    	var toppct = Math.round(length*0.3);
    	var diff = length - toppct;
    	resizeGenome(toppct, 0);
    	for(var j=0;j<diff;j++)
			genome.breedNewChromosome(Math.round(Math.random()*(toppct-1)),Math.round(Math.random()*(toppct-1)));

    	for(var j=0;j<toppct;j++)
			genome.chromosomes[j].mutate(rate, varience, Math.round(Math.random()*15));
	}

	net.setTValues(genome.chromosomes[chrom].tvgenes);
	net.setWeights(genome.chromosomes[chrom].wgenes);
	updateChromDiv();
	calcNet(imode,omode);
}


//*************************//
/* reclaculate the network */
//*************************//
function calcNet(imode,omode)
{
	net.calculateNetwork();
	draw(imode,omode);
}