//defaults
var inputSizeDef = 4;
var bitmapInputSize = 900;
var bitmapSqSize = 30;
var charOutputSize = 8;

var inputMode; //0 node input, 1 bitmap input
var outputMode; //0 node output, 1 numeric output, 2 character output
var selectedChromosome;


//*************************//
/* function that is called */
/* when any of the         */
/* settings are changed    */
//*************************//
function refreshSettings(imode, omode, _reinit)
{
	if(imode == null && omode == null && _reinit == null)
	{
		var chrom = document.getElementById("chrom").value - 1;
		updateGenomeSettings();
		if(selectedChromosome != chrom)
		{
			net.setTValues(genome.chromosomes[chrom].tvgenes);
			net.setWeights(genome.chromosomes[chrom].wgenes);
			selectedChromosome = chrom;
			updateChromDiv();
		}
		genOpStrings();
	}
	if(imode != null && inputMode != imode)
	{
		inputMode = imode;
		var _is = document.getElementById("inputsettings");
		_is.innerHTML = inputMode == 0 ? "<span class=\"input-group-addon\">Inputs</span><input id=\"nins\" type=\"text\" class=\"form-control\" value=\"" + inputSizeDef + "\">" : "<span class=\"input-group-addon\">Inputs</span><input id=\"nins\" type=\"text\" class=\"form-control\" value=\"" + bitmapInputSize + "\" disabled>";
	}
	if(omode != null && outputMode != omode)
	{
		if(omode == 2)
		{
			var _os = document.getElementById("outputsettings");
			_os.innerHTML = "<span class=\"input-group-addon\">Outputs</span><input id=\"nouts\" type=\"text\" class=\"form-control\" value=\"" + charOutputSize + "\" disabled>";
			_reinit = true;
		}
		else if (outputMode == 2)
		{
			var _os = document.getElementById("outputsettings");
			_os.innerHTML = "<span class=\"input-group-addon\">Outputs</span><input id=\"nouts\" type=\"text\" class=\"form-control\" value=\"2\">";
			_reinit = true;
		}

		outputMode = omode;
	}

	if(_reinit)
	{
		selectedChromosome = 0;
		initNet(document.getElementById("nins").value,document.getElementById("nouts").value,document.getElementById("nhnodes").value,document.getElementById("hiddenls").value);
		initGenome(document.getElementById("nchroms").value);
		initInputs();
		genOpStrings();
		updateGenomeSettings();
	}
	calcNet(inputMode, outputMode);
}

//*************************//
/*  updates the options in */
/*  chromosome select divs */
//*************************//
function updateGenomeSettings()
{
	var nchroms = document.getElementById("nchroms").value;
	mutationRate = document.getElementById("mutrate").value / 100;
	mutationVarience = document.getElementById("mutvar").value / 100;

	selectedChromosome = resizeGenome(nchroms,selectedChromosome);
	document.getElementById("chrom").value = selectedChromosome + 1;
}

//*************************//
/*  mutate  the selected   */
/*  chromosomes            */
//*************************//
function mutateSelected()
{
	var li = document.getElementById("lockinputs").checked ? 1 : 0;
	var lo = document.getElementById("lockoutputs").checked ? 2 : 0;
	var lh = document.getElementById("lockhidden").checked ? 4 : 0;
	var lt = document.getElementById("locktvals").checked ? 8 : 0;
	mutateChromosome(selectedChromosome,mutationRate,mutationVarience,inputMode,outputMode, li | lo | lh | lt);
}

//*************************//
/*  breed the selected     */
/*  chromosomes            */
//*************************//
function breedSelected()
{
	var c1 = document.getElementById("bcrom1").value;
	var c2 = document.getElementById("bcrom2").value;
	document.getElementById("nchroms").value = breedChromosomes(c1,c2);
	genOpStrings();
}

//*************************//
/*  evolve the network     */
/*  based on the given     */
/*  target                 */
//*************************//
function evolveNetwork()
{
	var gens = document.getElementById("numgens").value;
	var trainval = document.getElementById("trainingval").value;
    $('#runbtn').button('loading');
	Netvolver(gens,trainval,selectedChromosome,inputMode,outputMode,mutationRate,mutationVarience);
	$('#runbtn').button('reset');
}

//*************************//
/*  updates the options in */
/*  chromosome select divs */
//*************************//
function genOpStrings()
{
	var v1 = document.getElementById("bcrom1").value;
	var v2 = document.getElementById("bcrom2").value;
	var v3 = document.getElementById("genome").value;

	var s = "";
	var s1 = "";
	var s2 = "";
	var s3 = "";

	for(var i=1;i<=genome.chromosomes.length;i++)
	{
		if(i == selectedChromosome + 1)
			s+="<option selected=\"true\">" + i + "</option>";
		else
			s+="<option>" + i + "</option>";

		if(i == v1)
			s1+="<option selected=\"true\">" + i + "</option>";
		else
			s1+="<option>" + i + "</option>";

		if(i == v2)
			s2+="<option selected=\"true\">" + i + "</option>";
		else
			s2+="<option>" + i + "</option>";

		if(i <= 1)
		{
			if(i == v3)
				s3+="<option selected=\"true\">" + i + "</option>";
			else
				s3+="<option>" + i + "</option>";
		}
	}

	document.getElementById("chrom").innerHTML = s;
	document.getElementById("bcrom1").innerHTML = s1;
	document.getElementById("bcrom2").innerHTML = s2;
	document.getElementById("genome").innerHTML = s3;
}

//*************************//
/*  updates the chromosome */
/*  display div on change  */
//*************************//
function updateChromDiv()
{
	var ctv = document.getElementById("currtvals");
	var s = "";
	for(var i=0; i<genome.chromosomes[selectedChromosome].tvgenes.length;i++)
	{
		var _v = genome.chromosomes[selectedChromosome].tvgenes[i].toFixed(4);
		s+= "<p>" + _v + "</p>";
	}
	ctv.innerHTML = s;

	var cws = document.getElementById("currweights");
	s = "";
	for(var i=0; i<genome.chromosomes[selectedChromosome].wgenes.length;i++)
	{
		var _v = genome.chromosomes[selectedChromosome].wgenes[i].toFixed(4);
		s+= "<p>" + _v + "</p>";
	}
	cws.innerHTML = s;
}

//*************************//
/*  first function to run  */
/*  on pagg load           */
//*************************//
function init()
{
	inputMode = 0;
	outputMode = 0;
	selectedChromosome = 0;

	document.getElementById('nodein').checked = true;
	document.getElementById('bitin').checked = false;
	document.getElementById('nodeout').checked = true
	document.getElementById('numout').checked = false;
	document.getElementById('charout').checked = false;

	$('#genalgcont').collapse('toggle');
	$('#options').collapse('toggle');
	$('#runbtn').button('reset');

	refreshSettings(null, null, true);
}